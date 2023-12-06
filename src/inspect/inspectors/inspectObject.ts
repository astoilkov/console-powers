import ConsoleMessage from "../../core/ConsoleMessage";
import { consoleText } from "../../core/consoleText";
import consoleStyles from "../consoleStyles";
import inspectAny from "./inspectAny";

export default function inspectObject(value: object): ConsoleMessage[] {
    return singleLineObject(value);
}

// function multiLineObject(value: object): ConsoleMessage[] {
//     const pad = maxKeyLength(value)
//     const messages: ConsoleMessage[] = []
//     for (const key in value) {
//         // if (value.hasOwnProperty(key)) {
//         messages.push(consoleText(key.padEnd(pad), consoleStyles.collapsedObjectKey))
//         messages.push(consoleText(' : '))
//         messages.push(...valueMessages(value[key as keyof typeof value]))
//         messages.push(consoleText('\n'))
//         // }
//     }
//     return messages
// }

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

// function maxKeyLength(object: object): number {
//     let max = 0
//     for (const key in object) {
//         if (object.hasOwnProperty(key)) {
//             max = Math.max(max, key.length)
//         }
//     }
//     return max
// }
