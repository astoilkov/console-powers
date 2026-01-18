import { ConsoleInspectOptions, ConsoleInspectContext } from "../consoleInspect";
import ConsoleInspection from "../utils/ConsoleInspection";
import { InspectionQueue } from "./InspectionQueue";
import isPrimitive from "../../utils/isPrimitive";
import inspectPrimitive from "../inspectors/inspectPrimitive";
import { consoleText } from "../../core/consoleText";
import consoleStyles from "../utils/consoleStyles";
import { inspectIterableIterative } from "./inspectIterableIterative";
import { inspectObjectIterative } from "./inspectObjectIterative";
import isIterable from "../../utils/isIterable";

/**
 * Iteratively inspects a value using a work queue instead of recursion.
 * 
 * This function is the core of the iterative inspection system. It replaces
 * the recursive approach with an explicit work queue, enabling inspection of
 * arbitrarily deep nested structures without stack overflow.
 * 
 * **Work Queue Approach:**
 * 
 * Traditional recursive approach:
 *   inspectAny(obj) → inspectObject(obj) → inspectAny(obj.child) → ...
 *   Each call adds a frame to the call stack, causing stack overflow at ~10k depth.
 * 
 * Iterative approach:
 *   1. Create initial task for the root value
 *   2. While queue has tasks:
 *      a. Dequeue next task
 *      b. Process the value (primitives, circular refs, objects, iterables)
 *      c. For nested values, create child tasks and enqueue them
 *      d. Use callbacks to assemble results
 *   3. Return the final result
 * 
 * The queue uses LIFO (stack) ordering to maintain depth-first traversal,
 * ensuring output matches the original recursive implementation.
 * 
 * **Task Creation and Callback Pattern:**
 * 
 * When processing a complex value (object/array), we:
 * 1. Create child tasks for each nested value (properties, elements)
 * 2. Each child task has an onComplete callback that stores its result
 * 3. Track how many children have completed (completedCount)
 * 4. When all children complete, assemble their results and call parent's onComplete
 * 
 * Example for object { a: 1, b: { c: 2 } }:
 *   - Task 1: Inspect root object
 *     - Creates Task 2: Inspect property "a" (value: 1)
 *     - Creates Task 3: Inspect property "b" (value: { c: 2 })
 *   - Task 2: Returns inline inspection for primitive 1
 *   - Task 3: Inspect nested object { c: 2 }
 *     - Creates Task 4: Inspect property "c" (value: 2)
 *   - Task 4: Returns inline inspection for primitive 2
 *   - Task 3: Assembles result from Task 4, returns to Task 1
 *   - Task 1: Assembles results from Tasks 2 and 3, returns final result
 * 
 * **Context Management:**
 * 
 * The context object tracks state across the inspection:
 * - depth: Current nesting level (incremented for each child)
 *   Used to enforce depth limits (stop expanding beyond options.depth)
 * - circular: Set of values already seen in the current path
 *   Used to detect circular references and display "[Circular]"
 *   Each child gets a new Set with the parent value added
 * - wrap: Available width for formatting (reduced for nested values)
 *   Used to determine single-line vs multi-line format
 *   Reduced by indentation amount for each nesting level
 * - keys: Set of property names to include (filter)
 *   Preserved unchanged across all tasks
 * 
 * Example context evolution for nested object:
 *   Root: { depth: 0, circular: Set(), wrap: 80, keys: Set() }
 *   Child: { depth: 1, circular: Set(root), wrap: 78, keys: Set() }
 *   Grandchild: { depth: 2, circular: Set(root, child), wrap: 76, keys: Set() }
 * 
 * @param value - The value to inspect (any JavaScript value)
 * @param options - The inspection options with all defaults applied
 * @param context - The current inspection context (depth, circular refs, wrap width, keys)
 * @returns A ConsoleInspection containing the formatted output
 */
export function inspectIterative(
    value: unknown,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext
): ConsoleInspection {
    // Initialize the work queue
    // This queue will hold all pending inspection tasks
    const queue = new InspectionQueue();
    
    // Variable to store the final result
    // Will be set by the initial task's onComplete callback
    let result: ConsoleInspection | null = null;
    
    // Create the initial inspection task
    // The onComplete callback captures the result when the root value is fully inspected
    queue.enqueue({
        value,
        options,
        context,
        onComplete: (inspection: ConsoleInspection) => {
            result = inspection;
        }
    });
    
    // Main processing loop - continue until all tasks are processed
    // This replaces the recursive call stack with an explicit loop
    // Each iteration processes one task, which may enqueue more tasks
    while (!queue.isEmpty()) {
        const task = queue.dequeue();
        
        // This should never happen due to isEmpty check, but TypeScript needs the guard
        if (!task) {
            break;
        }
        
        // Handle primitives synchronously without queueing
        // Primitives (undefined, null, boolean, number, bigint, string, symbol, Date)
        // are simple values that don't have nested structure, so we can process them
        // immediately and return the result via the onComplete callback
        if (isPrimitive(task.value)) {
            task.onComplete({
                type: "inline",
                spans: [
                    inspectPrimitive(
                        task.value,
                        task.options.theme,
                        Math.round(task.context.wrap)
                    )
                ]
            });
            continue;
        }
        
        // Check for circular references
        // If this value has already been encountered in the current inspection path,
        // we display it as "[Circular]" to avoid infinite loops
        // The circular Set is managed in the context and updated for each child task
        if (task.context.circular.has(task.value)) {
            task.onComplete({
                type: "inline",
                spans: [
                    consoleText("[Circular]", consoleStyles[task.options.theme].dimmed)
                ]
            });
            continue;
        }
        
        // Handle iterables (Array, Set, Map)
        // Creates child tasks for each element via inspectIterableIterative
        if (isIterable(task.value)) {
            // Add value to circular set before processing children
            // This prevents infinite loops if the iterable contains a reference to itself
            const newCircular = new Set(task.context.circular);
            newCircular.add(task.value);
            
            // Delegate to inspectIterableIterative which will:
            // 1. Create child tasks for each element
            // 2. Collect results via callbacks
            // 3. Assemble the final result and call task.onComplete
            inspectIterableIterative(
                task.value as Iterable<unknown>,
                task.options,
                {
                    ...task.context,
                    circular: newCircular,
                },
                queue,
                task.onComplete,
            );
            continue;
        }
        
        // Handle objects
        // Creates child tasks for each property via inspectObjectIterative
        if (typeof task.value === "object" && task.value !== null) {
            // Add value to circular set before processing children
            // This prevents infinite loops if the object contains a reference to itself
            const newCircular = new Set(task.context.circular);
            newCircular.add(task.value);
            
            // Delegate to inspectObjectIterative which will:
            // 1. Create child tasks for each property
            // 2. Collect results via callbacks
            // 3. Assemble the final result and call task.onComplete
            inspectObjectIterative(
                task.value,
                task.options,
                {
                    ...task.context,
                    circular: newCircular,
                },
                queue,
                task.onComplete,
            );
            continue;
        }
        
        // Fallback for any other types (should rarely be reached)
        task.onComplete({
            type: "inline",
            spans: [consoleText(String(task.value))]
        });
    }
    
    // Return the result (should always be set after processing the initial task)
    if (result === null) {
        throw new Error("inspectIterative: result was not set after processing");
    }
    
    return result;
}
