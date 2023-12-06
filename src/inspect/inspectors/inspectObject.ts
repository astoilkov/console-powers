import ConsoleMessage from "../../core/ConsoleMessage";
import { consoleText } from "../../core/consoleText";
import consoleStyles from "../consoleStyles";
import inspectAny from "./inspectAny";
import isPrimitive from "../../utils/isPrimitive";

export default function inspectObject(value: object): ConsoleMessage[] {
    return Object.values(value).every(isPrimitive)
        ? singleLineObject(value)
        : multiLineObject(value);
}

function singleLineObject(value: object): ConsoleMessage[] {
    const messages: ConsoleMessage[] = [consoleText("{ ")];

    let isFirst = true;
    for (const key in value) {
        // if (value.hasOwnProperty(key)) {
        if (isFirst) {
            isFirst = false;
        } else {
            messages.push(consoleText(", "));
        }
        messages.push(consoleText(key, consoleStyles.collapsedObjectKey));
        messages.push(consoleText(": "));
        messages.push(...inspectAny(value[key as keyof typeof value]));
        // }
    }

    messages.push(consoleText(" }"));

    return messages;
}

function multiLineObject(value: object): ConsoleMessage[] {
    const maxLength = maxKeyLength(value);
    console.log(value, maxLength)
    const messages: ConsoleMessage[] = [];
    for (const key in value) {
        // if (value.hasOwnProperty(key)) {
        messages.push(consoleText(key, consoleStyles.collapsedObjectKey));
        messages.push(consoleText(": "));
        messages.push(consoleText(" ".repeat(maxLength - key.length)))
        messages.push(...inspectAny(value[key as keyof typeof value]));
        messages.push(consoleText("\n"));
        // }
    }
    return messages;
}

function maxKeyLength(object: object): number {
    let max = 0;
    for (const key in object) {
        // if (object.hasOwnProperty(key)) {
        max = Math.max(max, key.length);
        // }
    }
    return max;
}
