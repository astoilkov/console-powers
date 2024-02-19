import { consoleText } from "../../core/consoleText";
import inspectAny from "./inspectAny";
import consoleStyles from "../utils/consoleStyles";
import { ConsoleInspectContext, ConsoleInspectOptions, } from "../consoleInspect";
import { consoleObject } from "../../core/consoleObject";
import spansLength from "../../utils/spansLength";
import indent from "../../utils/indent";
import isPrimitive from "../../utils/isPrimitive";
import ConsoleInspection from "../utils/ConsoleInspection";

export function inspectIterable(
    iterable: Iterable<unknown>,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleInspection {
    if (context.depth >= options.depth) {
        return {
            type: "inline",
            spans: [consoleObject(iterable)],
        };
    }

    if (options.wrap === "single-line") {
        return inspectIterableSingleLine(iterable, options, context);
    }

    if (options.wrap === "multi-line") {
        return inspectIterableMultiLine(iterable, options, context);
    }

    // wrap is "auto", try to fit on one line
    const inspection = inspectIterableSingleLine(iterable, options, context);
    if (
        spansLength(inspection.spans) <= context.wrap &&
        toArray(iterable).every(isPrimitive)
    ) {
        return inspection;
    }

    return inspectIterableMultiLine(iterable, options, context);
}

export function inspectIterableSingleLine(
    iterable: Iterable<unknown>,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleInspection {
    const array = toArray(iterable);
    const isSet = iterable instanceof Set;
    const modifier = isSet ? 'Set' : ''
    return {
        type: "inline",
        spans: [
            consoleText(isSet ? '{' : "["),
            ...array.flatMap((value, i) => {
                const inspection = inspectAny(value, options, {
                    ...context,
                    depth: context.depth + 1,
                });
                return i === 0
                    ? inspection.spans
                    : [consoleText(", "), ...inspection.spans];
            }),
            consoleText(isSet ? '}' : "]"),
            consoleText(
                ` ${modifier}(${array.length})`,
                consoleStyles[options.theme].dimmed,
            ),
        ],
    };
}

export function inspectIterableMultiLine(
    iterable: Iterable<unknown>,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleInspection {
    const array = toArray(iterable);
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

function toArray(iterable: Iterable<unknown>): unknown[] {
    return Array.isArray(iterable) ? iterable : [...iterable];
}
