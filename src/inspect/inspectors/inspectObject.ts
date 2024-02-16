import { ConsoleText, consoleText } from "../../core/consoleText";
import consoleStyles from "../utils/consoleStyles";
import inspectAny from "./inspectAny";
import isPrimitive from "../../utils/isPrimitive";
import {
    ConsoleInspectContext,
    ConsoleInspectOptions,
} from "../consoleInspect";
import hasOnlyPrimitives from "../../utils/hasOnlyPrimitives";
import { ConsoleObject, consoleObject } from "../../core/consoleObject";
import spansLength from "../../utils/spansLength";
import isPlainObject from "is-plain-obj";
import indent from "../../utils/indent";
import ConsoleInspection from "../utils/ConsoleInspection";

export function inspectObject(
    object: object,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleInspection {
    if (!isPlainObject(object) || context.depth >= options.depth) {
        return {
            type: "inline",
            spans: [consoleObject(object)],
        };
    }

    if (options.wrap === "single-line") {
        return inspectObjectSingleLine(object, options, context);
    }

    if (options.wrap === "multi-line") {
        return inspectObjectMultiLine(object, options, context);
    }

    const inspection = inspectObjectSingleLine(object, options, context);
    if (
        hasOnlyPrimitives(object) &&
        spansLength(inspection.spans) <= context.wrap
    ) {
        return inspection;
    }

    return inspectObjectMultiLine(object, options, context);
}

export function inspectObjectSingleLine(
    object: object,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleInspection {
    const spans: (ConsoleText | ConsoleObject)[] = [consoleText("{ ")];

    let index = 0;
    for (const key in object) {
        if (index !== 0) {
            spans.push(consoleText(", "));
        }
        spans.push(consoleText(key, consoleStyles[options.theme].dimmed));
        spans.push(consoleText(": "));
        const inspection = inspectAny(
            object[key as keyof typeof object],
            options,
            {
                ...context,
                depth: context.depth + 1,
            },
        );
        spans.push(...inspection.spans);
        index += 1;
    }

    spans.push(consoleText(" }"));

    return {
        type: "inline",
        spans: index === 0 ? [consoleText("{}")] : spans,
    };
}

export function inspectObjectMultiLine(
    object: object,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleInspection {
    const spans: (ConsoleText | ConsoleObject)[] = [];
    const sortedKeys = sortKeys(object);
    const maxLength = maxKeyLength(object);

    for (let i = 0; i < sortedKeys.length; i++) {
        if (i !== 0) {
            spans.push(consoleText("\n"));
        }

        const key = sortedKeys[i]!;
        spans.push(consoleText(key, consoleStyles[options.theme].dimmed));
        spans.push(consoleText(": "));
        spans.push(consoleText(" ".repeat(maxLength - key.length)));

        const value = object[key as keyof typeof object];
        const inspection = inspectAny(value, options, {
            depth: context.depth + 1,
            wrap: Math.max(context.wrap - maxLength - 2 - options.indent, 0),
        });
        if (inspection.type === "block") {
            spans.push(consoleText("\n"));
            spans.push(...indent(inspection.spans, options.indent));
        } else {
            spans.push(...inspection.spans);
        }
    }
    return { type: "block", spans };
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
