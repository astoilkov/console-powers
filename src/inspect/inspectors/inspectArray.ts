import { consoleText } from "../../core/consoleText";
import inspectAny from "./inspectAny";
import consoleStyles from "../utils/consoleStyles";
import {
    ConsoleInspectContext,
    ConsoleInspectOptions,
} from "../consoleInspect";
import { consoleObject } from "../../core/consoleObject";
import spansLength from "../../utils/spansLength";
import indent from "../../utils/indent";
import isPrimitive from "../../utils/isPrimitive";
import ConsoleInspection from "../utils/ConsoleInspection";

export function inspectArray(
    array: unknown[],
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleInspection {
    if (context.depth >= options.depth) {
        return {
            type: "inline",
            spans: [consoleObject(array)],
        };
    }

    if (options.wrap === "single-line") {
        return inspectArraySingleLine(array, options, context);
    }

    if (options.wrap === "multi-line") {
        return inspectArrayMultiLine(array, options, context);
    }

    const inspection = inspectArraySingleLine(array, options, context);
    if (
        array.every(isPrimitive) &&
        spansLength(inspection.spans) <= context.wrap
    ) {
        return inspection;
    }

    return inspectArrayMultiLine(array, options, context);
}

export function inspectArraySingleLine(
    array: unknown[],
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleInspection {
    return {
        type: "inline",
        spans: [
            consoleText("["),
            ...array.flatMap((value, i) => {
                const inspection = inspectAny(value, options, {
                    ...context,
                    depth: context.depth + 1,
                });
                return i === 0
                    ? inspection.spans
                    : [consoleText(", "), ...inspection.spans];
            }),
            consoleText("]"),
            consoleText(
                ` (${array.length})`,
                consoleStyles[options.theme].dimmed,
            ),
        ],
    };
}

export function inspectArrayMultiLine(
    array: unknown[],
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleInspection {
    return {
        type: "block",
        spans: array.flatMap((value, i) => {
            const indexText = `[${i}]: `;
            const inspection = inspectAny(value, options, {
                depth: context.depth + 1,
                wrap: Math.max(
                    context.wrap - Math.max(indexText.length, options.indent),
                    0,
                ),
            });
            const valueSpans =
                inspection.type === "block"
                    ? [
                          consoleText("\n"),
                          ...indent(inspection.spans, options.indent),
                      ]
                    : inspection.spans;
            return [
                ...(i === 0 ? [] : [consoleText("\n")]),
                consoleText(indexText, consoleStyles[options.theme].highlight),
                ...valueSpans,
            ];
        }),
    };
}
