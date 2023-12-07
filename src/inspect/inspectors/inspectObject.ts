import ConsoleMessage from "../../core/ConsoleMessage";
import { consoleText } from "../../core/consoleText";
import consoleStyles from "../consoleStyles";
import inspectAny from "./inspectAny";
import isPrimitive from "../../utils/isPrimitive";
import { InspectionContext } from "../consoleInspect";
import { Primitive } from "type-fest";
import inspectPrimitive from "./inspectPrimitive";
import hasOnlyPrimitives from "../../utils/hasOnlyPrimitives";

export default function inspectObject(
    value: object,
    context: InspectionContext,
): ConsoleMessage[] {
    return Object.values(value).every(isPrimitive)
        ? [
              consoleText(" ".repeat(context.left)),
              ...singleLineObject(
                  value as Record<string | number | symbol, Primitive>,
              ),
          ]
        : multiLineObject(value, context);
}

function singleLineObject(
    value: Record<string | number | symbol, Primitive>,
): ConsoleMessage[] {
    const messages: ConsoleMessage[] = [consoleText("{ ")];

    let isFirst = true;
    for (const key in value) {
        if (isFirst) {
            isFirst = false;
        } else {
            messages.push(consoleText(", "));
        }
        messages.push(consoleText(key, consoleStyles.collapsedObjectKey));
        messages.push(consoleText(": "));
        messages.push(inspectPrimitive(value[key]));
    }

    messages.push(consoleText(" }"));

    return messages;
}

function multiLineObject(
    object: object,
    context: InspectionContext,
): ConsoleMessage[] {
    const maxLength = maxKeyLength(object);
    const messages: ConsoleMessage[] = [];

    let isFirst = true;
    for (const key of sortPrimitiveKeysFirst(object)) {
        if (!isFirst) {
            messages.push(consoleText("\n"));
        }
        isFirst = false;

        messages.push(consoleText(" ".repeat(context.left)));
        messages.push(consoleText(key, consoleStyles.collapsedObjectKey));
        messages.push(consoleText(": "));
        messages.push(consoleText(" ".repeat(maxLength - key.length)));

        const value = object[key as keyof typeof object];
        if (isPrimitive(value) || hasOnlyPrimitives(value)) {
            messages.push(...inspectAny(value, context));
        } else {
            messages.push(consoleText("\n"));
            messages.push(...inspectAny(value, { left: context.left + 2 }));
        }
    }
    return messages;
}

function maxKeyLength(object: object): number {
    let max = 0;
    for (const key in object) {
        max = Math.max(max, key.length);
    }
    return max;
}

function sortPrimitiveKeysFirst(object: object): string[] {
    return Object.keys(object).sort((a, b) => {
        const aIsPrimitive = isPrimitive(object[a as keyof typeof object]);
        const bIsPrimitive = isPrimitive(object[b as keyof typeof object]);
        if (aIsPrimitive && !bIsPrimitive) {
            return -1;
        } else if (!aIsPrimitive && bIsPrimitive) {
            return 1;
        } else {
            return 0;
        }
    });
}
