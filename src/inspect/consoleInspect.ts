import consolePrint from "../core/consolePrint";
import inspectAny from "./inspectors/inspectAny";
import consoleApply from "../core/consoleApply";
import ConsoleSpan from "../core/ConsoleSpan";
import guessAvailableLength from "../utils/guessAvailableLength";
import isIterable from "../utils/isIterable";
import { consoleGroup } from "../core/consoleGroup";
import { inspectArrayMultiLine } from "./inspectors/inspectArray";
import isPlainObject from "is-plain-obj";
import { inspectObjectMultiLine } from "./inspectors/inspectObject";
import { consoleText } from "../core/consoleText";
import stringExcerpt from "../utils/stringExcerpt";

export interface ConsoleInspectOptions {
    line?: boolean;
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
    indent: number;
    depth: number;
    wrap: number;
}

export default function consoleInspect(
    value: unknown,
    options?: ConsoleInspectOptions,
): ConsoleSpan[] {
    const spans = consoleApply(
        inspect(value, {
            depth: 2,
            indent: 4,
            line: false,
            wrap: "auto",
            theme: matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light",
            print: true,
            ...options,
        }),
        {
            lineHeight: "1.6",
        },
    );

    if (options?.print !== false) {
        consolePrint(spans);
    }

    return spans;
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
        indent: 0,
        wrap:
            options.wrap === "auto"
                ? guessAvailableLength()
                : options.wrap === "single-line"
                  ? Number.MAX_SAFE_INTEGER
                  : options.wrap === "multi-line"
                    ? 0
                    : options.wrap,
    };
    const spans = inspectAny(value, options, context);

    // special case: top-level grouping of array/object
    // we otherwise can't use groups because they call `consoleFlush()`
    if (
        !spans.some((span) => span.type === "text" && span.text.includes("\n"))
    ) {
        if (Array.isArray(value) || isIterable(value)) {
            return [
                consoleGroup({
                    header: spans,
                    body: inspectArrayMultiLine([...value], options, context),
                }),
            ];
        } else if (isPlainObject(value)) {
            return [
                consoleGroup({
                    header: spans,
                    body: inspectObjectMultiLine(value, options, context),
                }),
            ];
        }
    }

    return spans;
}
