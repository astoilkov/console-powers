import { ConsoleInspectOptions, ConsoleInspectContext } from "../consoleInspect";
import ConsoleInspection from "../utils/ConsoleInspection";

/**
 * Represents a unit of work in the iterative inspection system.
 * 
 * **Task Structure:**
 * 
 * Each task contains:
 * - value: The value to be inspected
 * - options: The inspection options (depth, indent, wrap, theme, keys)
 * - context: The current inspection context (depth, wrap width, circular refs, key filter)
 * - onComplete: Callback invoked when the inspection is complete with the result
 * 
 * **Callback Pattern:**
 * 
 * The onComplete callback is the key to assembling results in the iterative approach.
 * Instead of returning values up the call stack (as in recursion), we pass results
 * through callbacks.
 * 
 * Pattern for parent-child relationships:
 * 1. Parent creates child task with an onComplete callback
 * 2. Callback stores the child's result in a results array
 * 3. Callback increments a completedCount
 * 4. When completedCount === totalChildren, parent assembles all results
 * 5. Parent calls its own onComplete with the assembled result
 * 
 * Example for object { a: 1, b: 2 }:
 * ```
 * // Parent task for object
 * const results = [];
 * let completedCount = 0;
 * 
 * // Create child task for property "a"
 * queue.enqueue({
 *   value: 1,
 *   options,
 *   context: { ...context, depth: context.depth + 1 },
 *   onComplete: (inspection) => {
 *     results[0] = inspection;
 *     completedCount++;
 *     if (completedCount === 2) {
 *       // All children done, assemble result
 *       parentOnComplete({ type: "inline", spans: [...] });
 *     }
 *   }
 * });
 * 
 * // Create child task for property "b"
 * queue.enqueue({
 *   value: 2,
 *   options,
 *   context: { ...context, depth: context.depth + 1 },
 *   onComplete: (inspection) => {
 *     results[1] = inspection;
 *     completedCount++;
 *     if (completedCount === 2) {
 *       // All children done, assemble result
 *       parentOnComplete({ type: "inline", spans: [...] });
 *     }
 *   }
 * });
 * ```
 * 
 * This pattern enables:
 * - Asynchronous result collection (tasks can complete in any order)
 * - Proper result ordering (results array indexed by position)
 * - Hierarchical assembly (child results → parent result → grandparent result)
 * 
 * Tasks are processed iteratively from a work queue, enabling deep nesting
 * without stack overflow.
 */
export interface InspectionTask {
    /**
     * The value to inspect (can be any JavaScript value)
     */
    value: unknown;
    
    /**
     * The inspection options with all defaults applied
     */
    options: Required<ConsoleInspectOptions>;
    
    /**
     * The current inspection context including depth, circular reference tracking,
     * available wrap width, and key filtering
     */
    context: ConsoleInspectContext;
    
    /**
     * Callback invoked when the inspection of this value is complete.
     * The callback receives the ConsoleInspection result which can be
     * integrated into the parent's output.
     */
    onComplete: (inspection: ConsoleInspection) => void;
}
