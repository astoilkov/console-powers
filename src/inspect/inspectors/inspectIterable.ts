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
import inspectInline from "./inspectInline";
import { inspectObject } from "./inspectObject";

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
        iterableInfo(iterable).array.every(isPrimitive)
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
    const info = iterableInfo(iterable);
    return {
        type: "inline",
        spans: [
            consoleText(info.subtype === undefined ? "[" : "{"),
            ...info.array.flatMap((value, i) => {
                const inspection =
                    info.subtype === "Map"
                        ? inspectEntry(value, options, context)
                        : inspectAny(value, options, {
                              ...context,
                              depth: context.depth + 1,
                          });
                return i === 0
                    ? inspection.spans
                    : [consoleText(", "), ...inspection.spans];
            }),
            consoleText(info.subtype === undefined ? "]" : "}"),
            consoleText(
                ` ${info.subtype ?? ""}(${info.array.length})`,
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
    const info = iterableInfo(iterable);
    return {
        type: "block",
        spans: info.array.flatMap((value, i) => {
            const indexText = `[${i}]: `;
            const inspection =
                info.subtype === "Map"
                    ? inspectEntry(value, options, context)
                    : inspectAny(value, options, {
                          keys: context.keys,
                          depth: context.depth + 1,
                          wrap: Math.max(
                              context.wrap -
                                  Math.max(indexText.length, options.indent),
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

function inspectEntry(
    entry: unknown,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleInspection {
    const [key, value] = entry as [unknown, unknown];
    const keySpan = inspectInline(key, options.theme);
    const valueInspection = inspectAny(value, options, {
        keys: context.keys,
        depth: context.depth + 1,
        wrap: Math.max(
            context.wrap - Math.max(keySpan.text.length + 4, options.indent),
            0,
        ),
    });

    if (!isPrimitive(key)) {
        return inspectObject({ key, value }, options, {
            keys: context.keys,
            depth: context.depth,
            wrap: Math.max(context.wrap - options.indent, 0),
        });
    }

    return {
        type: valueInspection.type,
        spans: [keySpan, consoleText(" => "), ...valueInspection.spans],
    };
}

function iterableInfo(iterable: Iterable<unknown>): {
    array: unknown[];
    subtype: "Set" | "Map" | undefined;
} {
    return {
        subtype:
            iterable instanceof Set
                ? "Set"
                : iterable instanceof Map
                  ? "Map"
                  : undefined,
        array: Array.isArray(iterable) ? iterable : [...iterable],
    };
}
