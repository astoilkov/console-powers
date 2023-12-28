import ConsoleSpan from "./ConsoleSpan";
import { ConsoleText } from "./consoleText";
import ConsoleStyle from "./ConsoleStyle";
import arrayArg from "../utils/arrayArg";

export default function consolePrint(
    ...value: (ConsoleSpan | ConsoleSpan[])[]
): void {
    let logBuffer: LogBuffer = {
        text: "",
        rest: [],
    };

    const items = value.flatMap(arrayArg);
    for (const item of items) {
        if (item.type === "text") {
            logBuffer.text += `%c${item.text}%c`;
            logBuffer.rest.push(consoleStyleToString(item.style));
            logBuffer.rest.push("");
        } else if (item.type === "object") {
            logBuffer.text += "%o";
            logBuffer.rest.push(item.object);
        } else if (item.type === "flush") {
            flush(logBuffer);
        } else if (item.type === "group") {
            flush(logBuffer);

            const merged = mergeText(item.header);
            if (item.expanded) {
                console.group(merged.text, ...merged.rest);
            } else {
                console.groupCollapsed(merged.text, ...merged.rest);
            }

            consolePrint(item.body);

            console.groupEnd();
        }
    }

    flush(logBuffer);
}

interface LogBuffer {
    text: string;
    rest: (string | object)[];
}

function flush(logBuffer: LogBuffer): void {
    if (logBuffer.text !== "") {
        console.log(logBuffer.text, ...logBuffer.rest);
    }
    logBuffer.text = "";
    logBuffer.rest = [];
}

function mergeText(messages: ConsoleText[]): LogBuffer {
    const merged: LogBuffer = {
        text: "",
        rest: [],
    };
    for (const message of messages) {
        merged.text += `%c${message.text}%c`;
        merged.rest.push(consoleStyleToString(message.style));
        merged.rest.push("");
    }
    return merged;
}

function consoleStyleToString(style: ConsoleStyle): string {
    return Object.entries(style)
        .map(
            ([key, value]) =>
                `${key.replace(/[A-Z]/g, function (match) {
                    return "-" + match.toLowerCase();
                })}:${value}`,
        )
        .join(";");
}
