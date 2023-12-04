import ConsoleMessage from "./ConsoleMessage";
import { ConsoleText } from "./consoleText";

export default function consolePrint(messages: ConsoleMessage[]): void {
    let logBuffer: LogBuffer = {
        text: "",
        rest: [],
    };

    for (const message of messages) {
        if (message.type === "text") {
            logBuffer.text += `%c${message.text}%c`;
            logBuffer.rest.push(message.style);
            logBuffer.rest.push("");
        } else if (message.type === "object") {
            logBuffer.text += "%o";
            logBuffer.rest.push(message.object);
        } else if (message.type === "line") {
            flush(logBuffer);
        } else if (message.type === "group") {
            flush(logBuffer);

            const merged = mergeText(message.header);
            if (message.expanded) {
                console.group(merged.text, ...merged.rest);
            } else {
                console.groupCollapsed(merged.text, ...merged.rest);
            }

            consolePrint(message.body);

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
        merged.rest.push(message.style);
        merged.rest.push("");
    }
    return merged;
}
