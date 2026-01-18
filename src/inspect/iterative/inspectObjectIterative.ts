import { type ConsoleText, consoleText } from "../../core/consoleText";
import consoleStyles from "../utils/consoleStyles";
import {
    ConsoleInspectContext,
    ConsoleInspectOptions,
} from "../consoleInspect";
import { type ConsoleObject, consoleObject } from "../../core/consoleObject";
import indent from "../../utils/indent";
import ConsoleInspection from "../utils/ConsoleInspection";
import spansLength from "../../utils/spansLength";
import { InspectionQueue } from "./InspectionQueue";
import isPlainObject from "is-plain-obj";
import hasOnlyPrimitives from "../../utils/hasOnlyPrimitives";
import keys from "../../utils/keys";

/**
 * Iteratively inspects an object using a work queue.
 * 
 * This function replaces the recursive inspectObject with an iterative approach
 * that creates child inspection tasks for nested values instead of calling
 * inspectAny recursively.
 * 
 * **Work Queue Approach:**
 * Instead of recursively calling inspectAny for each property:
 * 1. Creates InspectionTask objects for each property value
 * 2. Adds these tasks to the work queue via queue.enqueue()
 * 3. Uses callbacks to collect results asynchronously
 * 4. Assembles the final output once all child tasks complete
 * 
 * **Callback Pattern:**
 * Each property's value gets its own task with an onComplete callback.
 * The callback stores the result at the correct index. When all properties
 * are processed (completedCount === objectKeys.length), the parent assembles
 * all results into the final ConsoleInspection with proper formatting.
 * 
 * **Context Management:**
 * - depth: Incremented by 1 for child tasks to track nesting level
 * - circular: Parent object added to Set before creating child tasks
 * - wrap: Reduced by maxKeyLength + 2 (for ": " separator) in multi-line mode
 * - keys: Used to filter which properties to inspect (via keys() utility)
 * 
 * @param object - The object to inspect
 * @param options - The inspection options with all defaults applied
 * @param context - The current inspection context
 * @param queue - The work queue for adding child tasks
 * @param onComplete - Callback invoked when inspection is complete
 */
export function inspectObjectIterative(
    object: object,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
    queue: InspectionQueue,
    onComplete: (inspection: ConsoleInspection) => void,
): void {
    // Check if it's a plain object and within depth limit
    if (!isPlainObject(object) || context.depth >= options.depth) {
        onComplete({
            type: "inline",
            spans: [consoleObject(object)],
        });
        return;
    }

    // Determine format based on wrap option
    if (options.wrap === "single-line") {
        inspectObjectSingleLineIterative(object, options, context, queue, onComplete);
        return;
    }

    if (options.wrap === "multi-line") {
        inspectObjectMultiLineIterative(object, options, context, queue, onComplete);
        return;
    }

    // wrap is "auto", try to fit on one line
    if (hasOnlyPrimitives(object)) {
        // Try single-line format first
        inspectObjectSingleLineIterative(
            object,
            options,
            context,
            queue,
            (inspection) => {
                // Check if it fits on one line
                if (spansLength(inspection.spans) <= context.wrap) {
                    onComplete(inspection);
                } else {
                    // Doesn't fit, use multi-line format
                    inspectObjectMultiLineIterative(
                        object,
                        options,
                        context,
                        queue,
                        onComplete,
                    );
                }
            },
        );
        return;
    }

    // Default to multi-line format
    inspectObjectMultiLineIterative(object, options, context, queue, onComplete);
}

/**
 * Inspects an object in single-line format using iterative processing.
 * 
 * **Task Creation Pattern:**
 * For each property in the object:
 * 1. Creates an InspectionTask with the property value
 * 2. Passes updated context with depth+1
 * 3. Provides an onChildComplete callback that stores the result
 * 4. Enqueues the task for processing
 * 
 * **Result Assembly:**
 * Uses a results array indexed by property position and completedCount
 * to track progress. When all properties are processed, assembles them
 * into "{ key: value, key: value }" format.
 * 
 * **Context Management:**
 * - depth: Incremented for child tasks
 * - wrap: Not reduced in single-line mode (all on one line)
 */
function inspectObjectSingleLineIterative(
    object: object,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
    queue: InspectionQueue,
    onComplete: (inspection: ConsoleInspection) => void,
): void {
    const objectKeys = keys(object, context.keys);
    
    // If no keys, return empty object
    if (objectKeys.length === 0) {
        onComplete({
            type: "inline",
            spans: [consoleText("{}")],
        });
        return;
    }

    // Track results for each property
    const results: ConsoleInspection[] = new Array(objectKeys.length);
    let completedCount = 0;

    // Callback invoked when a child task completes
    const onChildComplete = (index: number, inspection: ConsoleInspection) => {
        results[index] = inspection;
        completedCount++;

        // When all children are complete, assemble the final result
        if (completedCount === objectKeys.length) {
            const spans: (ConsoleText | ConsoleObject)[] = [consoleText("{ ")];

            for (let i = 0; i < objectKeys.length; i++) {
                if (i > 0) {
                    spans.push(consoleText(", "));
                }
                
                const key = objectKeys[i];
                if (!key) continue;
                
                spans.push(
                    consoleText(key, consoleStyles[options.theme].dimmed),
                    consoleText(": "),
                );
                
                const result = results[i];
                if (result) {
                    spans.push(...result.spans);
                }
            }

            spans.push(consoleText(" }"));

            onComplete({
                type: "inline",
                spans,
            });
        }
    };

    // Create child tasks for each property
    for (let i = 0; i < objectKeys.length; i++) {
        const key = objectKeys[i];
        if (!key) continue;
        
        const value = object[key as keyof typeof object];
        const index = i;

        queue.enqueue({
            value,
            options,
            context: {
                ...context,
                depth: context.depth + 1,
            },
            onComplete: (inspection) => onChildComplete(index, inspection),
        });
    }
}

/**
 * Inspects an object in multi-line format using iterative processing.
 * 
 * **Task Creation Pattern:**
 * Similar to single-line, but with adjusted context:
 * - depth: Incremented by 1 for each child
 * - wrap: Reduced by maxKeyLength + 2 to account for "key: " prefix
 *   This ensures nested values know their available width
 * 
 * **Result Assembly:**
 * Assembles results with newlines between properties and proper indentation
 * for block-type child inspections. Block children get extra indentation.
 * 
 * **Context Management Example:**
 * For object { name: "Alice", address: { city: "NYC" } } with wrap=80:
 * - "name" child gets wrap=80-7=73 (maxKeyLength=7 for "address")
 * - "address" child gets wrap=80-7=73
 * - "city" (nested) gets wrap=73-4=69 (maxKeyLength=4 for "city")
 */
function inspectObjectMultiLineIterative(
    object: object,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
    queue: InspectionQueue,
    onComplete: (inspection: ConsoleInspection) => void,
): void {
    const objectKeys = keys(object, context.keys);
    const maxLength = maxKeyLength(object);
    
    // If no keys, return empty block
    if (objectKeys.length === 0) {
        onComplete({
            type: "block",
            spans: [],
        });
        return;
    }

    // Track results for each property
    const results: ConsoleInspection[] = new Array(objectKeys.length);
    let completedCount = 0;

    // Callback invoked when a child task completes
    const onChildComplete = (index: number, inspection: ConsoleInspection) => {
        results[index] = inspection;
        completedCount++;

        // When all children are complete, assemble the final result
        if (completedCount === objectKeys.length) {
            const spans: (ConsoleText | ConsoleObject)[] = [];

            for (let i = 0; i < objectKeys.length; i++) {
                if (i > 0) {
                    spans.push(consoleText("\n"));
                }

                const key = objectKeys[i];
                if (!key) continue;
                
                spans.push(
                    consoleText(key, consoleStyles[options.theme].highlight),
                    consoleText(": "),
                );

                const inspection = results[i];
                if (inspection && inspection.type === "block") {
                    spans.push(
                        consoleText("\n"),
                        ...indent(inspection.spans, options.indent),
                    );
                } else if (inspection) {
                    spans.push(...inspection.spans);
                }
            }

            onComplete({
                type: "block",
                spans,
            });
        }
    };

    // Create child tasks for each property
    for (let i = 0; i < objectKeys.length; i++) {
        const key = objectKeys[i];
        if (!key) continue;
        
        const value = object[key as keyof typeof object];
        const index = i;

        queue.enqueue({
            value,
            options,
            context: {
                ...context,
                depth: context.depth + 1,
                wrap: Math.max(
                    context.wrap - Math.max(maxLength + 2, options.indent),
                    0,
                ),
            },
            onComplete: (inspection) => onChildComplete(index, inspection),
        });
    }
}

/**
 * Calculates the maximum key length in an object.
 * Used for wrap width calculation in multi-line format.
 */
function maxKeyLength(object: object): number {
    let max = 0;
    for (const key in object) {
        max = Math.max(max, key.length);
    }
    return max;
}
