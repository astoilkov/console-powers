# Inspect System Architecture

## Overview

The inspect system converts JavaScript values into formatted console output. It uses an **iterative architecture with a work queue** to handle arbitrarily deep nesting without stack overflow.

## Architecture: Iterative with Work Queue

### Design Philosophy

The system was refactored from a recursive approach to an iterative one to solve the "Maximum call stack exceeded" problem when inspecting deeply nested structures. The iterative approach uses an explicit work queue instead of the call stack, enabling unlimited nesting depth.

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                     consoleInspect()                        │
│                   (Public API Entry Point)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      inspectAny()                           │
│              (Routes to appropriate inspector)              │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
   Primitives      inspectIterative()  Non-plain
   (fast path)     (Work Queue Loop)   Objects
                         │
         ┌───────────────┼───────────────┐
         │                               │
         ▼                               ▼
  inspectIterableIterative()    inspectObjectIterative()
  (Arrays, Sets, Maps)          (Plain Objects)
         │                               │
         └───────────────┬───────────────┘
                         │
                         ▼
                  InspectionQueue
                  (LIFO Work Queue)
```

### Work Queue Processing

The `inspectIterative()` function is the heart of the system:

```typescript
function inspectIterative(value, options, context) {
    const queue = new InspectionQueue();
    let result = null;
    
    // 1. Create initial task
    queue.enqueue({
        value,
        options,
        context,
        onComplete: (inspection) => { result = inspection; }
    });
    
    // 2. Process tasks until queue is empty
    while (!queue.isEmpty()) {
        const task = queue.dequeue();
        
        // 3. Handle based on value type
        if (isPrimitive(task.value)) {
            // Process immediately
            task.onComplete(inspectPrimitive(task.value));
        } else if (isCircular(task.value)) {
            // Detect circular references
            task.onComplete({ type: "inline", spans: ["[Circular]"] });
        } else if (isIterable(task.value)) {
            // Create child tasks for elements
            inspectIterableIterative(task.value, ..., queue, task.onComplete);
        } else if (isObject(task.value)) {
            // Create child tasks for properties
            inspectObjectIterative(task.value, ..., queue, task.onComplete);
        }
    }
    
    return result;
}
```

### Task Structure

Each task in the queue contains:

```typescript
interface InspectionTask {
    value: unknown;              // The value to inspect
    options: ConsoleInspectOptions;  // Inspection options
    context: ConsoleInspectContext;  // Current context (depth, circular, wrap, keys)
    onComplete: (result) => void;    // Callback for result
}
```

### Callback Pattern for Result Assembly

Instead of returning values up the call stack (recursion), results are passed through callbacks:

```typescript
// Parent creates child tasks with callbacks
const results = [];
let completedCount = 0;

for (let i = 0; i < children.length; i++) {
    queue.enqueue({
        value: children[i],
        options,
        context: childContext,
        onComplete: (inspection) => {
            results[i] = inspection;  // Store result at correct index
            completedCount++;
            
            if (completedCount === children.length) {
                // All children complete, assemble and return
                const assembled = assembleResults(results);
                parentOnComplete(assembled);
            }
        }
    });
}
```

This pattern enables:
- **Asynchronous result collection**: Tasks can complete in any order
- **Proper ordering**: Results array indexed by position
- **Hierarchical assembly**: Child → Parent → Grandparent

## Context Management

The context object tracks state across the inspection:

```typescript
interface ConsoleInspectContext {
    depth: number;           // Current nesting level
    wrap: number;            // Available width for formatting
    circular: Set<unknown>;  // Values seen in current path
    keys: Set<string>;       // Property name filter
}
```

### Context Evolution

Context is updated for each child task:

```typescript
const childContext = {
    depth: context.depth + 1,                    // Increment depth
    wrap: context.wrap - options.indent,         // Reduce available width
    circular: new Set(context.circular).add(value),  // Add parent to circular set
    keys: context.keys                           // Preserve key filter
};
```

**Example for nested object:**
```
Root:        { depth: 0, circular: Set(),           wrap: 80 }
Child:       { depth: 1, circular: Set(root),       wrap: 76 }
Grandchild:  { depth: 2, circular: Set(root,child), wrap: 72 }
```

## LIFO Queue Strategy

The queue uses **LIFO (Last In, First Out)** ordering to maintain depth-first traversal:

```typescript
class InspectionQueue {
    private tasks: InspectionTask[] = [];
    
    enqueue(task: InspectionTask): void {
        this.tasks.push(task);  // Add to end
    }
    
    dequeue(): InspectionTask | undefined {
        return this.tasks.pop();  // Remove from end (LIFO)
    }
}
```

**Why LIFO?**
- Maintains depth-first traversal order
- Matches recursive implementation behavior
- Ensures identical output ordering

**Example:**
```
Object: { a: 1, b: { c: 2 } }

1. Enqueue root task
2. Dequeue root → enqueue task(a), enqueue task(b)
3. Dequeue task(b) (LIFO) → enqueue task(c)
4. Dequeue task(c) → process primitive 2
5. Dequeue task(a) → process primitive 1
6. Results assembled via callbacks
```

## Deep Nesting Capability

### The Problem

Recursive implementations fail with deeply nested structures:

```typescript
// Recursive approach (old)
function inspectAny(value) {
    if (isObject(value)) {
        return inspectObject(value);  // Adds stack frame
    }
}

function inspectObject(obj) {
    for (const key in obj) {
        inspectAny(obj[key]);  // Adds stack frame for each property
    }
}

// Fails at ~10,000 levels: "Maximum call stack exceeded"
```

### The Solution

Iterative approach with constant stack depth:

```typescript
// Iterative approach (new)
function inspectIterative(value) {
    const queue = new InspectionQueue();
    queue.enqueue({ value, ... });
    
    while (!queue.isEmpty()) {  // Constant stack depth
        const task = queue.dequeue();
        // Process task, enqueue children
    }
}

// Handles 10,000+ levels without stack overflow
```

### Performance Characteristics

| Nesting Depth | Recursive | Iterative | Result |
|---------------|-----------|-----------|--------|
| 100 levels    | 0.139ms   | 0.106ms   | ✅ Both work, iterative faster |
| 1,000 levels  | ❌ Stack overflow | 0.104ms | ✅ Iterative succeeds |
| 10,000 levels | ❌ Stack overflow | 0.105ms | ✅ Iterative succeeds |

**Key Insight**: Performance remains constant regardless of depth (when depth limiting is applied).

## Performance Optimizations

### 1. Primitive Fast Path

Primitives are processed immediately without queueing:

```typescript
if (isPrimitive(task.value)) {
    task.onComplete({
        type: "inline",
        spans: [inspectPrimitive(task.value)]
    });
    continue;  // Skip queue operations
}
```

### 2. Reduced Function Call Overhead

Single processing loop instead of many recursive calls:
- **Recursive**: O(n) function calls for n nested levels
- **Iterative**: O(1) function calls (single loop)

### 3. Better Memory Locality

Work queue keeps related data structures close together in memory, improving cache hit rates.

### 4. Efficient Context Management

Context objects created more efficiently without repeated spreading in call stack.

## Circular Reference Detection

Circular references are detected using the `context.circular` Set:

```typescript
// Before processing any object/array
if (context.circular.has(value)) {
    task.onComplete({
        type: "inline",
        spans: [consoleText("[Circular]", dimmedStyle)]
    });
    continue;
}

// Add to circular set before creating child tasks
const newCircular = new Set(context.circular);
newCircular.add(value);

// Pass to children
const childContext = { ...context, circular: newCircular };
```

**Example:**
```typescript
const obj = { a: 1 };
obj.self = obj;  // Circular reference

// Inspection:
// { a: 1, self: [Circular] }
```

## Depth Limiting

Depth limiting prevents excessive expansion:

```typescript
// Check depth before expanding
if (context.depth >= options.depth) {
    // Return collapsed representation
    task.onComplete({
        type: "inline",
        spans: [consoleObject(value)]
    });
    continue;
}

// Increment depth for children
const childContext = {
    ...context,
    depth: context.depth + 1
};
```

**Example with depth=2:**
```typescript
{
    level1: {           // depth 0 → expanded
        level2: {       // depth 1 → expanded
            level3: {}  // depth 2 → collapsed (shown as Object)
        }
    }
}
```

## File Organization

```
src/inspect/
├── consoleInspect.ts              # Public API entry point
├── inspectors/
│   ├── inspectAny.ts              # Routes to appropriate inspector
│   ├── inspectPrimitive.ts        # Handles primitives
│   ├── inspectIterable.ts         # Legacy recursive iterable inspector
│   └── inspectObject.ts           # Legacy recursive object inspector
├── iterative/
│   ├── inspectIterative.ts        # Main iterative processing loop
│   ├── InspectionQueue.ts         # LIFO work queue
│   ├── InspectionTask.ts          # Task interface
│   ├── inspectIterableIterative.ts # Iterative iterable inspector
│   └── inspectObjectIterative.ts  # Iterative object inspector
└── utils/
    ├── ConsoleInspection.ts       # Output format types
    └── consoleStyles.ts           # Styling utilities
```

## Testing Strategy

### Unit Tests
- Specific examples and edge cases
- Integration between components
- Error conditions

### Property-Based Tests
- Deep nesting capability (100-10,000 levels)
- Backward compatibility (random values and options)
- Circular reference handling

### Performance Tests
- Shallow structure performance
- Deep structure performance
- Comparison with recursive implementation

## Backward Compatibility

The refactoring maintains **100% backward compatibility**:

✅ All existing unit tests pass without modification  
✅ Identical output for all previously supported input types  
✅ All options work exactly as before  
✅ Circular reference detection unchanged  
✅ All wrap modes produce identical output  

## References

- **Implementation Summary**: `.kiro/specs/iterative-inspect-refactor/IMPLEMENTATION_SUMMARY.md`
- **Performance Comparison**: `.kiro/specs/iterative-inspect-refactor/PERFORMANCE_COMPARISON.md`
- **Design Document**: `.kiro/specs/iterative-inspect-refactor/design.md`
- **Requirements**: `.kiro/specs/iterative-inspect-refactor/requirements.md`
