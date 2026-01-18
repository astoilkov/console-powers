# Design Document: Iterative Inspect System Refactor

## Overview

This design refactors the inspect system from a recursive architecture to an iterative one using a work queue. The current implementation has three main inspectors (`inspectAny`, `inspectIterable`, `inspectObject`) that call each other recursively, causing stack overflow on deeply nested structures. The new design introduces a work queue that processes inspection tasks iteratively while maintaining all existing functionality and output formats.

The key insight is that we can transform the recursive call tree into an explicit queue of work items. Instead of `inspectAny` calling `inspectIterable` which calls `inspectAny` again (recursion), we'll have `inspectAny` add child inspection tasks to a queue and process them in a loop.

## Architecture

### High-Level Flow

```
1. User calls consoleInspect(values, options)
2. For each value:
   a. Create initial inspection task
   b. Add task to work queue
   c. While queue is not empty:
      - Dequeue next task
      - Inspect the value based on type
      - If value has children (object/array), create child tasks and enqueue them
      - Collect results
   d. Assemble final ConsoleSpan output
3. Return ConsoleSpan array
```

### Work Queue Strategy

We'll use a **stack (LIFO)** approach to maintain depth-first traversal order, which matches the current recursive behavior. This ensures that output ordering remains identical to the current implementation.

### Key Design Decisions

1. **Minimal Changes**: Keep the existing inspector functions (`inspectPrimitive`, `inspectIterableSingleLine`, etc.) unchanged where possible
2. **Central Coordinator**: Create a new `inspectIterative` function that manages the work queue
3. **Task Structure**: Each task contains the value, options, context, and a callback to handle the result
4. **Result Assembly**: Use callbacks or result references to build the final span array in the correct order

## Components and Interfaces

### InspectionTask Interface

```typescript
interface InspectionTask {
    value: unknown;
    options: Required<ConsoleInspectOptions>;
    context: ConsoleInspectContext;
    onComplete: (inspection: ConsoleInspection) => void;
}
```

The `onComplete` callback allows parent tasks to receive results from child tasks and assemble them into the final output.

### Modified inspectAny Function

Instead of directly calling `inspectIterable` and `inspectObject`, the new `inspectAny` will:

1. Check if the value is primitive → return immediately
2. Check for circular references → return "[Circular]" immediately
3. For objects/arrays → create child inspection tasks and add to queue
4. Use callbacks to assemble results when child tasks complete

### Work Queue Implementation

```typescript
class InspectionQueue {
    private tasks: InspectionTask[] = [];
    
    enqueue(task: InspectionTask): void {
        this.tasks.push(task);
    }
    
    dequeue(): InspectionTask | undefined {
        return this.tasks.pop(); // LIFO for depth-first
    }
    
    isEmpty(): boolean {
        return this.tasks.length === 0;
    }
}
```

### Main Iterative Function

```typescript
function inspectIterative(
    value: unknown,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext
): ConsoleInspection {
    const queue = new InspectionQueue();
    let result: ConsoleInspection | null = null;
    
    // Create initial task
    queue.enqueue({
        value,
        options,
        context,
        onComplete: (inspection) => {
            result = inspection;
        }
    });
    
    // Process queue
    while (!queue.isEmpty()) {
        const task = queue.dequeue()!;
        processTask(task, queue);
    }
    
    return result!;
}
```

## Data Models

### ConsoleInspection (Existing)

```typescript
interface ConsoleInspection {
    type: "inline" | "block";
    spans: ConsoleSpan[];
}
```

This remains unchanged.

### ConsoleInspectContext (Existing)

```typescript
interface ConsoleInspectContext {
    depth: number;
    wrap: number;
    keys: Set<string>;
    circular: Set<unknown>;
}
```

This remains unchanged.

### Task Processing State

For complex inspections (objects and arrays), we need to track:
- Which children have been processed
- Where to insert child results in the parent's span array
- Whether we're building inline or block format

This can be managed through closures in the `onComplete` callbacks.

## Detailed Component Behavior

### Processing Primitives

Primitives are handled synchronously without queueing:

```typescript
if (isPrimitive(value)) {
    task.onComplete({
        type: "inline",
        spans: [inspectPrimitive(value, options.theme, Math.round(context.wrap))]
    });
    continue;
}
```

### Processing Iterables

For arrays, Sets, and Maps:

1. Check depth limit → if exceeded, return consoleObject representation
2. Check circular references → if circular, return "[Circular]"
3. Determine format (single-line vs multi-line)
4. For single-line: Create child tasks for each element, collect results, format inline
5. For multi-line: Create child tasks for each element, collect results, format as block

### Processing Objects

For plain objects:

1. Check depth limit → if exceeded, return consoleObject representation
2. Check circular references → if circular, return "[Circular]"
3. Determine format (single-line vs multi-line)
4. Get keys to inspect (filtered by context.keys if specified)
5. For single-line: Create child tasks for each property, collect results, format inline
6. For multi-line: Create child tasks for each property, collect results, format as block

### Handling Circular References

Before processing any object or iterable:

```typescript
if (context.circular.has(value)) {
    task.onComplete({
        type: "inline",
        spans: [consoleText("[Circular]", consoleStyles[options.theme].dimmed)]
    });
    continue;
}
```

Then add the value to the circular set before creating child tasks:

```typescript
const newContext = {
    ...context,
    circular: new Set(context.circular).add(value)
};
```

### Depth Tracking

When creating child tasks, increment the depth:

```typescript
const childContext = {
    ...context,
    depth: context.depth + 1,
    circular: new Set(context.circular).add(value)
};
```

### Wrap Width Calculation

For nested values, reduce the available wrap width based on indentation:

```typescript
const childContext = {
    ...context,
    depth: context.depth + 1,
    wrap: Math.max(context.wrap - Math.max(keyLength + 2, options.indent), 0)
};
```

## Implementation Strategy

### Phase 1: Create Work Queue Infrastructure

1. Define `InspectionTask` interface
2. Implement `InspectionQueue` class
3. Create `inspectIterative` function skeleton

### Phase 2: Refactor inspectAny

1. Move primitive handling to remain synchronous
2. Add circular reference check
3. Replace direct calls to `inspectIterable` and `inspectObject` with task creation
4. Implement result assembly through callbacks

### Phase 3: Refactor inspectIterable

1. Keep single-line and multi-line formatting functions mostly unchanged
2. Modify to create child tasks instead of calling `inspectAny` directly
3. Use callbacks to collect child results
4. Assemble final spans once all children are processed

### Phase 4: Refactor inspectObject

1. Keep single-line and multi-line formatting functions mostly unchanged
2. Modify to create child tasks instead of calling `inspectAny` directly
3. Use callbacks to collect child results
4. Assemble final spans once all children are processed

### Phase 5: Integration

1. Update `consoleInspect` to use `inspectIterative` instead of `inspectAny`
2. Ensure all existing tests pass
3. Add tests for deeply nested structures

## Alternative Approach: Synchronous Result Collection

Instead of callbacks, we could use a synchronous approach where child tasks store their results in a shared map:

```typescript
const results = new Map<string, ConsoleInspection>();

// Create child task
const childId = generateUniqueId();
queue.enqueue({
    value: childValue,
    options,
    context: childContext,
    resultId: childId
});

// Later, retrieve result
const childInspection = results.get(childId);
```

This approach is simpler but requires careful ordering to ensure parent tasks process after all their children.

**Decision**: Use the callback approach as it's more explicit about dependencies and easier to reason about.



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The correctness properties for this refactoring focus on two key aspects: (1) the new capability to handle arbitrarily deep nesting, and (2) maintaining perfect backward compatibility with the existing implementation.

### Property 1: Deep Nesting Without Stack Overflow

*For any* deeply nested structure (objects, arrays, or combinations thereof) with nesting depth up to 10,000 levels, inspecting the structure should complete successfully without throwing a "Maximum call stack exceeded" error or any other stack-related error.

**Validates: Requirements 1.5**

**Rationale**: This is the primary motivation for the refactoring. The current recursive implementation fails on deeply nested structures. The iterative implementation must handle arbitrary nesting depth limited only by memory, not call stack size.

**Test Strategy**: Generate nested structures of varying depths (100, 1000, 5000, 10000 levels) and verify that inspection completes without errors. Test with nested objects, nested arrays, and mixed nesting patterns.

### Property 2: Backward Compatibility - Output Equivalence

*For any* value that could be inspected by the original implementation (primitives, objects, arrays, Sets, Maps, circular references, etc.) and any valid combination of options (depth, indent, keys, theme, wrap), the refactored implementation should produce output that is structurally equivalent to the original implementation's output.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 3.1, 3.4, 4.1, 4.2, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7**

**Rationale**: This is a comprehensive property that ensures the refactoring is transparent to users. If the output is identical for all inputs and options, then all functionality is preserved: value type handling, option respect, format correctness, circular reference detection, depth limiting, etc.

**Test Strategy**: 
- Use property-based testing to generate random values and options
- Compare output from original and refactored implementations
- Define "structurally equivalent" as: same ConsoleSpan types, same text content, same styling, same structure (inline vs block)
- Test with: primitives, nested objects, nested arrays, circular references, various depth limits, all wrap modes, different themes, key filtering

**Note**: This property subsumes many individual requirements because backward compatibility implies correct behavior for all previously supported scenarios.

### Property 3: Existing Test Suite Compatibility

*For all* existing unit tests in the test suite, the refactored implementation should pass without modification to the tests.

**Validates: Requirements 6.1**

**Rationale**: The existing test suite serves as a comprehensive regression suite. If all tests pass, we have high confidence that the refactoring preserves existing behavior.

**Test Strategy**: Run the complete existing test suite (test/consoleInspect.test.ts) against the refactored implementation. All tests should pass without changes.

**Note**: This is listed as an example rather than a property because it's a specific test suite execution rather than a universally quantified statement. However, it's critical for validation.

## Error Handling

The refactored system must maintain the same error handling behavior as the original:

1. **Invalid Options**: If invalid options are provided, the system should handle them gracefully (using defaults or throwing appropriate errors)
2. **Circular References**: Detected and displayed as "[Circular]" without entering infinite loops
3. **Depth Limit Exceeded**: Objects beyond the depth limit are displayed using `consoleObject` representation
4. **Non-Serializable Values**: Functions, symbols, and other special values are handled appropriately

The iterative approach should not introduce new error conditions. The work queue processing should be robust:
- Queue operations (enqueue/dequeue) should never fail
- Task processing should handle all value types
- Callback execution should be safe

## Testing Strategy

### Dual Testing Approach

We will use both unit tests and property-based tests:

**Unit Tests**:
- Verify specific examples and edge cases
- Test integration between components
- Validate error conditions
- Focus on: empty structures, single-element structures, specific circular reference patterns, boundary depth values

**Property-Based Tests**:
- Verify universal properties across all inputs
- Use randomized input generation for comprehensive coverage
- Minimum 100 iterations per property test
- Focus on: deep nesting capability, backward compatibility, option handling

### Property-Based Testing Configuration

We will use **fast-check** (for TypeScript/JavaScript) as the property-based testing library.

Each property test must:
- Run minimum 100 iterations (configured via `fc.assert` options)
- Reference its design document property in a comment
- Use the tag format: **Feature: iterative-inspect-refactor, Property {number}: {property_text}**

Example:
```typescript
// Feature: iterative-inspect-refactor, Property 1: Deep Nesting Without Stack Overflow
test('handles deeply nested structures without stack overflow', () => {
    fc.assert(
        fc.property(
            fc.integer({ min: 100, max: 10000 }),
            (depth) => {
                const nested = createDeeplyNested(depth);
                expect(() => consoleInspect([nested], { print: false })).not.toThrow();
            }
        ),
        { numRuns: 100 }
    );
});
```

### Test Coverage Goals

- **Unit Tests**: Cover specific examples, edge cases, and error conditions from existing test suite
- **Property Test 1**: Deep nesting capability (new functionality)
- **Property Test 2**: Backward compatibility (comprehensive validation)
- **Property Test 3**: Existing test suite execution (regression validation)

### Testing Phases

1. **Phase 1**: Ensure all existing unit tests pass (Property 3)
2. **Phase 2**: Add property test for deep nesting (Property 1)
3. **Phase 3**: Add property test for backward compatibility (Property 2)
4. **Phase 4**: Add additional unit tests for edge cases specific to the iterative implementation

### Backward Compatibility Testing Details

For Property 2 (backward compatibility), we need to:

1. **Preserve Original Implementation**: Keep a copy of the original recursive implementation for comparison
2. **Generate Test Inputs**: Use fast-check to generate diverse inputs:
   - Primitives: `fc.oneof(fc.constant(null), fc.constant(undefined), fc.boolean(), fc.integer(), fc.string())`
   - Objects: `fc.object()` with controlled depth
   - Arrays: `fc.array()` with controlled depth
   - Circular references: Custom generator that creates circular structures
3. **Generate Test Options**: Use fast-check to generate option combinations:
   - depth: `fc.integer({ min: 0, max: 5 })`
   - indent: `fc.integer({ min: 0, max: 8 })`
   - wrap: `fc.oneof(fc.constant("auto"), fc.constant("single-line"), fc.constant("multi-line"), fc.integer({ min: 20, max: 200 }))`
   - theme: `fc.oneof(fc.constant("light"), fc.constant("dark"))`
4. **Compare Outputs**: Define structural equivalence comparison function
5. **Report Differences**: If outputs differ, report the input and options that caused the difference

This comprehensive property test will validate that the refactoring maintains all existing behavior.
