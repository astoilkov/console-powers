import { type ConsoleText, consoleText } from "../../core/consoleText";
import consoleStyles from "../utils/consoleStyles";
import {
    ConsoleInspectContext,
    ConsoleInspectOptions,
} from "../consoleInspect";
import { type ConsoleObject, consoleObject } from "../../core/consoleObject";
import indent from "../../utils/indent";
import isPrimitive from "../../utils/isPrimitive";
import ConsoleInspection from "../utils/ConsoleInspection";
import inspectInline from "../inspectors/inspectInline";
import spansLength from "../../utils/spansLength";
import { InspectionQueue } from "./InspectionQueue";
import { makeIterableDetails } from "../inspectors/inspectIterable";
import { inspectObjectIterative } from "./inspectObjectIterative";

/**
 * Iteratively inspects an iterable (Array, Set, Map) using a work queue.
 * 
 * This function replaces the recursive inspectIterable with an iterative approach
 * that creates child inspection tasks for nested values instead of calling
 * inspectAny recursively.
 * 
 * **Work Queue Approach:**
 * Instead of recursively calling inspectAny for each element, this function:
 * 1. Creates InspectionTask objects for each nested element
 * 2. Adds these tasks to the work queue via queue.enqueue()
 * 3. Uses callbacks to collect results asynchronously
 * 4. Assembles the final output once all child tasks complete
 * 
 * **Callback Pattern:**
 * Each child task receives an onComplete callback that stores its result.
 * When all children complete (tracked via completedCount), the parent
 * assembles all child results into the final ConsoleInspection.
 * 
 * **Context Management:**
 * - depth: Incremented by 1 for child tasks to track nesting level
 * - circular: Parent value added to Set before creating child tasks
 * - wrap: Reduced based on indentation to maintain formatting constraints
 * - keys: Preserved unchanged across all child tasks
 * 
 * @param iterable - The iterable to inspect
 * @param options - The inspection options with all defaults applied
 * @param context - The current inspection context
 * @param queue - The work queue for adding child tasks
 * @param onComplete - Callback invoked when inspection is complete
 */
export function inspectIterableIterative(
    iterable: Iterable<unknown>,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
    queue: InspectionQueue,
    onComplete: (inspection: ConsoleInspection) => void,
): void {
    // Check depth limit
    if (context.depth >= options.depth) {
        onComplete({
            type: "inline",
            spans: [consoleObject(iterable)],
        });
        return;
    }

    const iterableDetails = makeIterableDetails(iterable);

    // Determine format based on wrap option
    if (options.wrap === "single-line") {
        inspectIterableSingleLineIterative(iterableDetails, options, context, queue, onComplete);
        return;
    }

    if (options.wrap === "multi-line") {
        inspectIterableMultiLineIterative(iterableDetails, options, context, queue, onComplete);
        return;
    }

    // wrap is "auto", try to fit on one line
    if (
        iterableDetails.array.every(isPrimitive) &&
        iterableDetails.extraKeys.every((key) =>
            isPrimitive(
                iterableDetails.array[
                    key as keyof typeof iterableDetails.array
                ],
            ),
        )
    ) {
        // Try single-line format first
        inspectIterableSingleLineIterative(
            iterableDetails,
            options,
            context,
            queue,
            (inspection) => {
                // Check if it fits on one line
                if (spansLength(inspection.spans) <= context.wrap) {
                    onComplete(inspection);
                } else {
                    // Doesn't fit, use multi-line format
                    inspectIterableMultiLineIterative(
                        iterableDetails,
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
    inspectIterableMultiLineIterative(iterableDetails, options, context, queue, onComplete);
}

/**
 * Inspects an iterable in single-line format using iterative processing.
 * 
 * **Task Creation Pattern:**
 * For each element in the iterable:
 * 1. Creates an InspectionTask with the element value
 * 2. Passes updated context with depth+1
 * 3. Provides an onChildComplete callback that stores the result
 * 4. Enqueues the task for processing
 * 
 * **Result Assembly:**
 * Uses a results array and completedCount to track progress.
 * When completedCount === totalItems, assembles all results into
 * a single-line format with proper separators and brackets.
 * 
 * **Special Cases:**
 * - Map entries: Handled via inspectEntryIterative for key => value format
 * - Extra keys: Array properties that aren't numeric indices
 */
function inspectIterableSingleLineIterative(
    { array, type, extraKeys }: { array: unknown[]; type: "Set" | "Map" | undefined; extraKeys: string[] },
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
    queue: InspectionQueue,
    onComplete: (inspection: ConsoleInspection) => void,
): void {
    const totalItems = array.length + extraKeys.length;
    
    // If no items, return immediately
    if (totalItems === 0) {
        onComplete({
            type: "inline",
            spans: [
                consoleText(type === undefined ? "[" : "{"),
                consoleText(type === undefined ? "]" : "}"),
                consoleText(
                    ` ${type ?? ""}(${array.length})`,
                    consoleStyles[options.theme].dimmed,
                ),
            ],
        });
        return;
    }

    // Track results for each item
    const results: ConsoleInspection[] = new Array(totalItems);
    let completedCount = 0;

    // Callback invoked when a child task completes
    const onChildComplete = (index: number, inspection: ConsoleInspection) => {
        results[index] = inspection;
        completedCount++;

        // When all children are complete, assemble the final result
        if (completedCount === totalItems) {
            const spans: (ConsoleText | ConsoleObject)[] = [
                consoleText(type === undefined ? "[" : "{"),
            ];

            // Add array elements
            for (let i = 0; i < array.length; i++) {
                const result = results[i];
                if (!result) continue;
                
                if (i > 0) {
                    spans.push(consoleText(", "));
                }
                spans.push(...result.spans);
            }

            // Add extra keys
            for (let i = 0; i < extraKeys.length; i++) {
                const resultIndex = array.length + i;
                const result = results[resultIndex];
                const key = extraKeys[i];
                
                if (!result || !key) continue;
                
                if (i > 0 || array.length > 0) {
                    spans.push(consoleText(", "));
                }
                spans.push(
                    consoleText(key, consoleStyles[options.theme].dimmed),
                    consoleText(": "),
                    ...result.spans,
                );
            }

            spans.push(
                consoleText(type === undefined ? "]" : "}"),
                consoleText(
                    ` ${type ?? ""}(${array.length})`,
                    consoleStyles[options.theme].dimmed,
                ),
            );

            onComplete({
                type: "inline",
                spans,
            });
        }
    };

    // Create child tasks for array elements
    for (let i = 0; i < array.length; i++) {
        const value = array[i];
        const index = i;

        if (type === "Map") {
            // Handle Map entries specially
            inspectEntryIterative(
                value,
                options,
                context,
                queue,
                (inspection) => onChildComplete(index, inspection),
            );
        } else {
            // Regular array or Set element
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

    // Create child tasks for extra keys
    for (let i = 0; i < extraKeys.length; i++) {
        const key = extraKeys[i];
        if (!key) continue;
        
        const value = array[key as keyof typeof array];
        const resultIndex = array.length + i;

        queue.enqueue({
            value,
            options,
            context: {
                ...context,
                depth: context.depth + 1,
            },
            onComplete: (inspection) => onChildComplete(resultIndex, inspection),
        });
    }
}

/**
 * Inspects an iterable in multi-line format using iterative processing.
 * 
 * **Task Creation Pattern:**
 * Similar to single-line, but with adjusted context:
 * - depth: Incremented by 1 for each child
 * - wrap: Reduced by the index label length (e.g., "[0]: " or "Map[0]: ")
 *   to account for indentation in multi-line format
 * 
 * **Result Assembly:**
 * Assembles results with newlines between elements and proper indentation
 * for block-type child inspections.
 */
function inspectIterableMultiLineIterative(
    { array, type, extraKeys }: { array: unknown[]; type: "Set" | "Map" | undefined; extraKeys: string[] },
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
    queue: InspectionQueue,
    onComplete: (inspection: ConsoleInspection) => void,
): void {
    const totalItems = array.length + extraKeys.length;
    
    // If no items, return empty block
    if (totalItems === 0) {
        onComplete({
            type: "block",
            spans: [],
        });
        return;
    }

    // Track results for each item
    const results: ConsoleInspection[] = new Array(totalItems);
    let completedCount = 0;

    // Callback invoked when a child task completes
    const onChildComplete = (index: number, inspection: ConsoleInspection) => {
        results[index] = inspection;
        completedCount++;

        // When all children are complete, assemble the final result
        if (completedCount === totalItems) {
            const spans: (ConsoleText | ConsoleObject)[] = [];

            // Add array elements
            for (let i = 0; i < array.length; i++) {
                if (i > 0) {
                    spans.push(consoleText("\n"));
                }

                const indexText = `${type ?? ""}[${i}]: `;
                spans.push(
                    consoleText(
                        indexText,
                        consoleStyles[options.theme].highlight,
                    ),
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

            // Add extra keys
            for (let i = 0; i < extraKeys.length; i++) {
                const resultIndex = array.length + i;
                const key = extraKeys[i];

                if (i > 0 || array.length > 0) {
                    spans.push(consoleText("\n"));
                }

                if (key) {
                    spans.push(
                        consoleText(key, consoleStyles[options.theme].highlight),
                        consoleText(": "),
                    );

                    const inspection = results[resultIndex];
                    if (inspection && inspection.type === "block") {
                        spans.push(
                            consoleText("\n"),
                            ...indent(inspection.spans, options.indent),
                        );
                    } else if (inspection) {
                        spans.push(...inspection.spans);
                    }
                }
            }

            onComplete({
                type: "block",
                spans,
            });
        }
    };

    // Create child tasks for array elements
    for (let i = 0; i < array.length; i++) {
        const value = array[i];
        const index = i;
        const indexText = `${type ?? ""}[${i}]: `;

        if (type === "Map") {
            // Handle Map entries specially
            inspectEntryIterative(
                value,
                options,
                context,
                queue,
                (inspection) => onChildComplete(index, inspection),
            );
        } else {
            // Regular array or Set element
            queue.enqueue({
                value,
                options,
                context: {
                    ...context,
                    depth: context.depth + 1,
                    wrap: Math.max(
                        context.wrap -
                            Math.max(
                                indexText.length,
                                options.indent,
                            ),
                        0,
                    ),
                },
                onComplete: (inspection) => onChildComplete(index, inspection),
            });
        }
    }

    // Create child tasks for extra keys
    for (let i = 0; i < extraKeys.length; i++) {
        const key = extraKeys[i];
        if (!key) continue;
        
        const value = array[key as keyof typeof array];
        const resultIndex = array.length + i;

        queue.enqueue({
            value,
            options,
            context: {
                ...context,
                depth: context.depth + 1,
                wrap: Math.max(
                    context.wrap - Math.max(key.length + 2, options.indent),
                    0,
                ),
            },
            onComplete: (inspection) => onChildComplete(resultIndex, inspection),
        });
    }
}

/**
 * Inspects a Map entry iteratively.
 * 
 * **Callback Chaining:**
 * For primitive keys: Creates a task for the value, then chains the result
 * with the key using nested callbacks (key => value format).
 * 
 * For non-primitive keys: Delegates to inspectObjectIterative to handle
 * the entry as { key, value } object.
 * 
 * **Context Management:**
 * - wrap: Reduced by key length + 4 for " => " separator
 * - depth: Incremented for the value inspection
 */
function inspectEntryIterative(
    entry: unknown,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
    queue: InspectionQueue,
    onComplete: (inspection: ConsoleInspection) => void,
): void {
    const [key, value] = entry as [unknown, unknown];
    
    // For primitive keys, use inline inspection
    if (isPrimitive(key)) {
        const keySpan = inspectInline(key, options.theme);
        
        // Create task for the value
        queue.enqueue({
            value,
            options,
            context: {
                circular: context.circular,
                keys: context.keys,
                depth: context.depth + 1,
                wrap: Math.max(
                    context.wrap - Math.max(keySpan.text.length + 4, options.indent),
                    0,
                ),
            },
            onComplete: (valueInspection) => {
                onComplete({
                    type: valueInspection.type,
                    spans: [keySpan, consoleText(" => "), ...valueInspection.spans],
                });
            },
        });
    } else {
        // For non-primitive keys, inspect as an object { key, value }
        // Call inspectObjectIterative directly to handle the object inspection
        inspectObjectIterative(
            { key, value },
            options,
            {
                circular: context.circular,
                keys: context.keys,
                depth: context.depth,
                wrap: Math.max(context.wrap - options.indent, 0),
            },
            queue,
            onComplete,
        );
    }
}
