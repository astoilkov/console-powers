import { ConsoleText, consoleText } from "../../core/consoleText";
import consoleStyles from "../utils/consoleStyles";
import inspectAny from "./inspectAny";
import isPrimitive from "../../utils/isPrimitive";
import {
    ConsoleInspectContext,
    ConsoleInspectOptions,
} from "../consoleInspect";
import { Primitive } from "type-fest";
import hasOnlyPrimitives from "../../utils/hasOnlyPrimitives";
import { ConsoleObject, consoleObject } from "../../core/consoleObject";
import createIndent from "../utils/createIndent";
import spansLength from "../../utils/spansLength";
import isPlainObject from "is-plain-obj";

export default function inspectObject(
    object: object,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): (ConsoleText | ConsoleObject)[] {
    if (!isPlainObject(object)) {
        return [consoleObject(object)];
    }

    if (options.wrap !== "auto" || hasOnlyPrimitives(object)) {
        const singleLine = singleLineObject(
            object as Record<string | number | symbol, Primitive>,
            options,
            context,
        );
        if (spansLength(singleLine) + context.indent <= context.wrap) {
            return singleLine;
        }
    }

    if (context.depth >= options.depth) {
        return [consoleObject(object)];
    }

    return multiLineObject(object, options, context);
}

function singleLineObject(
    object: object,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): (ConsoleText | ConsoleObject)[] {
    const spans: (ConsoleText | ConsoleObject)[] = [consoleText("{ ")];

    let index = 0;
    for (const key in object) {
        if (index !== 0) {
            spans.push(consoleText(", "));
        }
        spans.push(consoleText(key, consoleStyles[options.theme].dimmed));
        spans.push(consoleText(": "));
        spans.push(
            ...inspectAny(object[key as keyof typeof object], options, {
                ...context,
                indent: 0,
                depth: context.depth + 1,
            }),
        );
        index += 1;
    }

    spans.push(consoleText(" }"));

    return index === 0 ? [consoleText("{}")] : spans;
}

function multiLineObject(
    object: object,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): (ConsoleText | ConsoleObject)[] {
    const spans: (ConsoleText | ConsoleObject)[] = [];
    const sortedKeys = sortKeys(object);
    const maxLength = maxKeyLength(object);

    for (let i = 0; i < sortedKeys.length; i++) {
        if (i !== 0) {
            spans.push(consoleText("\n"));
        }

        const key = sortedKeys[i]!;
        spans.push(...createIndent(context, options));
        spans.push(consoleText(key, consoleStyles[options.theme].dimmed));
        spans.push(consoleText(": "));
        spans.push(consoleText(" ".repeat(maxLength - key.length)));

        const value = object[key as keyof typeof object];
        if (
            isPrimitive(value) ||
            hasOnlyPrimitives(value) ||
            context.depth + 1 >= options.depth
        ) {
            spans.push(
                ...inspectAny(value, options, {
                    wrap: context.wrap,
                    indent: context.indent,
                    depth: context.depth + 1,
                }),
            );
        } else {
            spans.push(consoleText("\n"));
            spans.push(
                ...inspectAny(value, options, {
                    wrap: context.wrap,
                    indent: context.indent + options.indent,
                    depth: context.depth + 1,
                }),
            );
        }
    }
    return spans;
}

function maxKeyLength(object: object): number {
    let max = 0;
    for (const key in object) {
        max = Math.max(max, key.length);
    }
    return max;
}

// - primitives first
// - array/object with only primitives second
// - array/object with non-primitives third
function sortKeys(object: object): string[] {
    return Object.keys(object).sort((a, b) => {
        const aIsPrimitive = isPrimitive(object[a as keyof typeof object]);
        const bIsPrimitive = isPrimitive(object[b as keyof typeof object]);
        const aHasOnlyPrimitives = hasOnlyPrimitives(
            object[a as keyof typeof object],
        );
        const bHasOnlyPrimitives = hasOnlyPrimitives(
            object[b as keyof typeof object],
        );
        if (aIsPrimitive && !bIsPrimitive) {
            return -1;
        } else if (!aIsPrimitive && bIsPrimitive) {
            return 1;
        } else if (aHasOnlyPrimitives && !bHasOnlyPrimitives) {
            return -1;
        } else if (!aHasOnlyPrimitives && bHasOnlyPrimitives) {
            return 1;
        } else {
            return 0;
        }
    });
}
