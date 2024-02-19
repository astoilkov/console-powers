import consolePrint from "../core/consolePrint";
import inspectAny from "./inspectors/inspectAny";
import ConsoleSpan from "../core/ConsoleSpan";
import guessAvailableLength from "../utils/guessAvailableLength";
import isIterable from "../utils/isIterable";
import { consoleGroup } from "../core/consoleGroup";
import { inspectIterableMultiLine } from "./inspectors/inspectIterable";
import isPlainObject from "is-plain-obj";
import { inspectObjectMultiLine } from "./inspectors/inspectObject";
import { consoleText } from "../core/consoleText";
import stringExcerpt from "../utils/stringExcerpt";
import isPrimitive from "../utils/isPrimitive";
import consoleApply from "../core/consoleApply";

export interface ConsoleInspectOptions {
    indent?: number;
    print?: boolean;
    depth?: number;
    theme?: "light" | "dark";
    wrap?: "auto" | "single-line" | "multi-line" | 100;
    // preferMultiLine?: boolean;
    // preferSingleLine?: boolean;
    // preferTables?: boolean;
}

export interface ConsoleInspectContext {
    depth: number;
    wrap: number;
}

export default function consoleInspect(
    value: unknown,
    options?: ConsoleInspectOptions,
): ConsoleSpan[] {
    const spans = inspect(value, {
        depth: 2,
        indent: 4,
        wrap: "auto",
        theme: matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
        print: true,
        ...options,
    });
    const withLineHeight = isPrimitive(value)
        ? spans
        : consoleApply(spans, { lineHeight: "1.6" });

    if (options?.print !== false) {
        consolePrint(withLineHeight);
    }

    return withLineHeight;
}

function inspect(
    value: unknown,
    options: Required<ConsoleInspectOptions>,
): ConsoleSpan[] {
    if (typeof value === "string") {
        return [consoleText(stringExcerpt(value, 10000))];
    }

    const context: ConsoleInspectContext = {
        depth: 0,
        wrap:
            options.wrap === "auto"
                ? guessAvailableLength()
                : options.wrap === "single-line"
                  ? Number.MAX_SAFE_INTEGER
                  : options.wrap === "multi-line"
                    ? 0
                    : options.wrap,
    };
    const inspection = inspectAny(value, options, context);

    // special case: top-level grouping of array/object
    // we otherwise can't use groups because they call `consoleFlush()`
    if (inspection.type === "inline") {
        if (Array.isArray(value) || isIterable(value)) {
            return [
                consoleGroup({
                    header: inspection.spans,
                    body: inspectIterableMultiLine([...value], options, context)
                        .spans,
                }),
            ];
        } else if (isPlainObject(value)) {
            return [
                consoleGroup({
                    header: inspection.spans,
                    body: inspectObjectMultiLine(value, options, context).spans,
                }),
            ];
        }
    }

    return inspection.spans;
}
