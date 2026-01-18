import consolePrint from "../core/consolePrint";
import inspectAny from "./inspectors/inspectAny";
import ConsoleSpan from "../core/ConsoleSpan";
import isIterable from "../utils/isIterable";
import { consoleGroup } from "../core/consoleGroup";
import {
    inspectIterableMultiLine,
    makeIterableDetails,
} from "./inspectors/inspectIterable";
import isPlainObject from "is-plain-obj";
import { inspectObjectMultiLine } from "./inspectors/inspectObject";
import { consoleText } from "../core/consoleText";
import stringExcerpt from "../utils/stringExcerpt";
import isPrimitive from "../utils/isPrimitive";
import consoleApply from "../core/consoleApply";
import savedAvailableLengthGuess from "../utils/savedAvailableLengthGuess";
import inspectPrimitive from "./inspectors/inspectPrimitive";
import consoleStyles from "./utils/consoleStyles";

export interface ConsoleInspectOptions {
    indent?: number;
    print?: boolean;
    depth?: number;
    keys?: string[];
    theme?: "light" | "dark";
    wrap?: "auto" | "single-line" | "multi-line" | number;
    // preferMultiLine?: boolean;
    // preferSingleLine?: boolean;
    // preferTables?: boolean;
}

export interface ConsoleInspectContext {
    depth: number;
    wrap: number;
    keys: Set<string>;
    circular: Set<unknown>;
}

export default function consoleInspect(
    values: unknown[],
    options?: ConsoleInspectOptions,
): ConsoleSpan[] {
    const spans = inspect(values, {
        depth: 2,
        indent: 4,
        wrap: "auto",
        theme: matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
        print: true,
        keys: [],
        ...options,
    });
    const withLineHeight = isPrimitive(values)
        ? spans
        : consoleApply(spans, { lineHeight: "1.6" });

    if (options?.print !== false) {
        consolePrint(withLineHeight);
    }

    return withLineHeight;
}

function inspect(
    values: unknown[],
    options: Required<ConsoleInspectOptions>,
): ConsoleSpan[] {
    const spans: ConsoleSpan[] = [];
    const separator = values.every((value) => isPrimitive(value))
        ? " "
        : "\n\n";

    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (typeof value === "string") {
            if (value.trim() === "") {
                spans.push(inspectPrimitive(value, options.theme));
            } else {
                spans.push(consoleText(stringExcerpt(value, 10000)));
            }

            if (i !== values.length - 1) {
                spans.push(consoleText(" "));
            }
        } else {
            const context: ConsoleInspectContext = {
                depth: 0,
                circular: new Set(),
                keys: new Set(options.keys),
                wrap:
                    typeof options.wrap === "number"
                        ? options.wrap
                        : options.wrap === "single-line"
                          ? Number.MAX_SAFE_INTEGER
                          : savedAvailableLengthGuess(),
            };
            const inspection = inspectAny(value, options, context);

            // special case: top-level grouping of array/object
            // we otherwise can't use groups because they call `consoleFlush()`
            if (values.length === 1) {
                if ((Array.isArray(value) || isIterable(value)) && inspection.type === "inline") {
                    // For iterables with inline inspection, create a group with multi-line body
                    return [
                        consoleGroup({
                            header: inspection.spans,
                            body: inspectIterableMultiLine(
                                makeIterableDetails(value),
                                options,
                                context,
                            ).spans,
                        }),
                    ];
                } else if (isPlainObject(value) && inspection.type === "inline") {
                    // For plain objects with inline inspection, create a group with multi-line body
                    return [
                        consoleGroup({
                            header: inspection.spans,
                            body: inspectObjectMultiLine(
                                value,
                                options,
                                context,
                            ).spans,
                        }),
                    ];
                } else if ((Array.isArray(value) || isIterable(value)) && inspection.type === "block") {
                    // For iterables with block inspection, the inspection already contains the full structure
                    // We need to extract a header and use the block content as the body
                    // For now, just return the inspection as-is wrapped in a group
                    // This handles Maps and other iterables that return block inspections
                    const iterableDetails = makeIterableDetails(value);
                    const type = iterableDetails.type;
                    const length = iterableDetails.array.length;
                    const headerText = type === undefined ? `[…]` : `{…}`;
                    const countText = ` ${type ?? ""}(${length})`;
                    
                    return [
                        consoleGroup({
                            header: [
                                consoleText(headerText),
                                consoleText(countText, consoleStyles[options.theme].dimmed),
                            ],
                            body: inspection.spans,
                        }),
                    ];
                } else if (isPlainObject(value) && inspection.type === "block") {
                    // For plain objects with block inspection, extract header and body
                    const keys = Object.keys(value);
                    const headerText = `{…}`;
                    const countText = ` (${keys.length})`;
                    
                    return [
                        consoleGroup({
                            header: [
                                consoleText(headerText),
                                consoleText(countText, consoleStyles[options.theme].dimmed),
                            ],
                            body: inspection.spans,
                        }),
                    ];
                } else {
                    // For non-iterable, non-plain-object values (like Date, functions, etc.)
                    spans.push(...inspection.spans);
                }
            } else {
                spans.push(...inspection.spans);

                if (i !== values.length - 1) {
                    spans.push(consoleText(separator));
                }
            }
        }
    }

    return spans;
}
