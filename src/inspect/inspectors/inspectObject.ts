import ConsoleSpan from "../../core/ConsoleSpan";
import { ConsoleText, consoleText } from "../../core/consoleText";
import consoleStyles from "../utils/consoleStyles";
import inspectAny from "./inspectAny";
import isPrimitive from "../../utils/isPrimitive";
import {
    ConsoleInspectContext,
    ConsoleInspectOptions,
} from "../consoleInspect";
import { Primitive } from "type-fest";
import inspectPrimitive from "./inspectPrimitive";
import hasOnlyPrimitives from "../../utils/hasOnlyPrimitives";
import { consoleObject } from "../../core/consoleObject";
import createIndent from "../utils/createIndent";
import canFit from "../../utils/canFit";

export default function inspectObject(
    object: object,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleSpan[] {
    if (hasOnlyPrimitives(object)) {
        const singleLine = singleLineObject(
            object as Record<string | number | symbol, Primitive>,
            options
        );
        if (canFit(singleLine, context.indent)) {
            return singleLine;
        }
    }

    if (context.depth >= options.expandDepth) {
        return [consoleObject(object)];
    }

    return multiLineObject(object, options, context);
}

function singleLineObject(
    value: Record<string | number | symbol, Primitive>,
    options: Required<ConsoleInspectOptions>,
): ConsoleText[] {
    const spans: ConsoleText[] = [consoleText("{ ")];

    let isFirst = true;
    for (const key in value) {
        if (isFirst) {
            isFirst = false;
        } else {
            spans.push(consoleText(", "));
        }
        spans.push(consoleText(key, consoleStyles[options.theme].dimmed));
        spans.push(consoleText(": "));
        spans.push(inspectPrimitive(value[key], options.theme));
    }

    spans.push(consoleText(" }"));

    return spans;
}

function multiLineObject(
    object: object,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleSpan[] {
    const spans: ConsoleSpan[] = [];
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
            context.depth + 1 >= options.expandDepth
        ) {
            spans.push(
                ...inspectAny(value, options, {
                    indent: context.indent,
                    depth: context.depth + 1,
                }),
            );
        } else {
            spans.push(consoleText("\n"));
            spans.push(
                ...inspectAny(value, options, {
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
