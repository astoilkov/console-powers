import { type ConsoleText, consoleText } from "../../core/consoleText";
import inspectAny from "./inspectAny";
import consoleStyles from "../utils/consoleStyles";
import {
    ConsoleInspectContext,
    ConsoleInspectOptions,
} from "../consoleInspect";
import { type ConsoleObject, consoleObject } from "../../core/consoleObject";
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
    const array = iterableArray(iterable);
    if (
        spansLength(inspection.spans) <= context.wrap &&
        array.every(isPrimitive) &&
        iterableExtraKeys(iterable).every((key) =>
            isPrimitive(array[key as keyof typeof array]),
        )
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
    const type = iterableType(iterable);
    const array = iterableArray(iterable);
    const extraKeys = iterableExtraKeys(iterable);
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
    iterable: Iterable<unknown>,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleInspection {
    const array = iterableArray(iterable);
    return {
        type: "block",
        spans: [
            ...array.flatMap((value, i) => {
                const indexText = `[${i}]: `;
                const inspection =
                    iterableType(iterable) === "Map"
                        ? inspectEntry(value, options, context)
                        : inspectAny(value, options, {
                              keys: context.keys,
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
            ...iterableExtraKeys(iterable).flatMap((key, i) => {
                const spans: (ConsoleText | ConsoleObject)[] = [];
                if (i !== 0 || array.length !== 0) {
                    spans.push(consoleText("\n"));
                }

                spans.push(consoleText(key, consoleStyles[options.theme].highlight));
                spans.push(consoleText(": "));

                const value = array[key as keyof typeof array];
                const inspection = inspectAny(value, options, {
                    keys: context.keys,
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
                return spans
            })
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

const iterableArrayCache = new WeakMap<Iterable<unknown>, unknown[]>();
function iterableArray(iterable: Iterable<unknown>): unknown[] {
    if (Array.isArray(iterable)) {
        return iterable;
    }

    const cached = iterableArrayCache.get(iterable);
    if (cached !== undefined) {
        return cached;
    }

    const array = [...iterable];
    iterableArrayCache.set(iterable, array);
    return array;
}

function iterableType(iterable: Iterable<unknown>): "Set" | "Map" | undefined {
    return iterable instanceof Set
        ? "Set"
        : iterable instanceof Map
          ? "Map"
          : undefined;
}

const iterableExtraKeysCache = new WeakMap<Iterable<unknown>, string[]>();
function iterableExtraKeys(iterable: Iterable<unknown>): string[] {
    const cached = iterableExtraKeysCache.get(iterable);

    if (cached !== undefined) {
        return cached;
    }

    const keys: string[] = [];
    const array = iterableArray(iterable);
    for (const key of Object.keys(array)) {
        const index = Number.parseInt(key, 10);
        if (Number.isNaN(index) || index < 0 || index >= array.length) {
            keys.push(key);
        }
    }
    return keys;
}
