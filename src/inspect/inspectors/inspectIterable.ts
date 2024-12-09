import { type ConsoleText, consoleText } from "../../core/consoleText";
import inspectAny from "./inspectAny";
import consoleStyles from "../utils/consoleStyles";
import {
    ConsoleInspectContext,
    ConsoleInspectOptions,
} from "../consoleInspect";
import { type ConsoleObject, consoleObject } from "../../core/consoleObject";
import indent from "../../utils/indent";
import isPrimitive from "../../utils/isPrimitive";
import ConsoleInspection from "../utils/ConsoleInspection";
import inspectInline from "./inspectInline";
import { inspectObject } from "./inspectObject";
import spansLength from "../../utils/spansLength";
import consoleTable from "../../extras/consoleTable";
import hasOnlyPrimitives from "../../utils/hasOnlyPrimitives";

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

    const iterableDetails = makeIterableDetails(iterable);
    const preferTables = true;
    if (
        preferTables &&
        iterableDetails.array.every(
            (value) => isPrimitive(value) || hasOnlyPrimitives(value),
        )
    ) {
        return {
            type: "block",
            spans: consoleTable(iterable, {
                print: false,
                theme: options.theme,
                wrap: context.wrap,
            }),
        };
    }

    if (options.wrap === "single-line") {
        return inspectIterableSingleLine(iterableDetails, options, context);
    }

    if (options.wrap === "multi-line") {
        return inspectIterableMultiLine(iterableDetails, options, context);
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
        const inspection = inspectIterableSingleLine(
            iterableDetails,
            options,
            context,
        );
        if (spansLength(inspection.spans) <= context.wrap) {
            return inspection;
        }
    }

    return inspectIterableMultiLine(iterableDetails, options, context);
}

export function inspectIterableSingleLine(
    { array, type, extraKeys }: IterableDetails,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleInspection {
    return {
        type: "inline",
        spans: [
            consoleText(type === undefined ? "[" : "{"),
            ...array.flatMap((value, i) => {
                const inspection =
                    type === "Map"
                        ? inspectEntry(value, options, context)
                        : inspectAny(value, options, {
                              ...context,
                              depth: context.depth + 1,
                          });
                return i === 0
                    ? inspection.spans
                    : [consoleText(", "), ...inspection.spans];
            }),
            ...extraKeys.flatMap((key, i) => {
                const value = array[key as keyof typeof array];
                const spans = [
                    consoleText(key, consoleStyles[options.theme].dimmed),
                    consoleText(": "),
                    ...inspectAny(value, options, {
                        ...context,
                        depth: context.depth + 1,
                    }).spans,
                ];
                return i === 0 && array.length === 0
                    ? spans
                    : [consoleText(", "), ...spans];
            }),
            consoleText(type === undefined ? "]" : "}"),
            consoleText(
                ` ${type ?? ""}(${array.length})`,
                consoleStyles[options.theme].dimmed,
            ),
        ],
    };
}

export function inspectIterableMultiLine(
    { array, type, extraKeys }: IterableDetails,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleInspection {
    return {
        type: "block",
        spans: [
            ...array.flatMap((value, i) => {
                const indexText = `[${i}]: `;
                const inspection =
                    type === "Map"
                        ? inspectEntry(value, options, context)
                        : inspectAny(value, options, {
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
                    consoleText(
                        indexText,
                        consoleStyles[options.theme].highlight,
                    ),
                    ...valueSpans,
                ];
            }),
            ...extraKeys.flatMap((key, i) => {
                const spans: (ConsoleText | ConsoleObject)[] = [];
                if (i !== 0 || array.length !== 0) {
                    spans.push(consoleText("\n"));
                }

                spans.push(
                    consoleText(key, consoleStyles[options.theme].highlight),
                );
                spans.push(consoleText(": "));

                const value = array[key as keyof typeof array];
                const inspection = inspectAny(value, options, {
                    ...context,
                    depth: context.depth + 1,
                    wrap: Math.max(
                        context.wrap - Math.max(key.length + 2, options.indent),
                        0,
                    ),
                });
                if (inspection.type === "block") {
                    spans.push(consoleText("\n"));
                    spans.push(...indent(inspection.spans, options.indent));
                } else {
                    spans.push(...inspection.spans);
                }
                return spans;
            }),
        ],
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
        circular: context.circular,
        keys: context.keys,
        depth: context.depth + 1,
        wrap: Math.max(
            context.wrap - Math.max(keySpan.text.length + 4, options.indent),
            0,
        ),
    });

    if (!isPrimitive(key)) {
        return inspectObject({ key, value }, options, {
            circular: context.circular,
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

interface IterableDetails {
    array: unknown[];
    type: "Set" | "Map" | undefined;
    extraKeys: string[];
}
function makeIterableDetails(iterable: Iterable<unknown>): IterableDetails {
    const array = Array.isArray(iterable) ? iterable : [...iterable];
    const type =
        iterable instanceof Set
            ? "Set"
            : iterable instanceof Map
              ? "Map"
              : undefined;
    const extraKeys: string[] = [];
    for (const key of Object.keys(array)) {
        const index = Number.parseInt(key, 10);
        if (Number.isNaN(index) || index < 0 || index >= array.length) {
            extraKeys.push(key);
        }
    }
    return { array, type, extraKeys };
}
