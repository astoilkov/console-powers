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
            if (values.length === 1 && inspection.type === "inline") {
                if (Array.isArray(value) || isIterable(value)) {
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
                } else if (isPlainObject(value)) {
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
                }
            } else {
                spans.push(...inspection.spans);

                if (i !== values.length - 1) {
                    spans.push(
                        consoleText(inspection.type === "block" ? "\n" : " "),
                    );
                }
            }
        }
    }

    return spans;
}
