import ConsoleSpan from "./ConsoleSpan";
import { ConsoleText } from "./consoleText";
import ConsoleStyle from "./ConsoleStyle";
import toFlatSpans from "../utils/toFlatSpans";

interface ConsoleBuffer {
    text: string;
    rest: (string | object)[];
}

export default function consolePrint(
    ...args: (ConsoleSpan | ConsoleSpan[] | ConsoleSpan[][])[]
): void {
    const buffer: ConsoleBuffer = {
        text: "",
        rest: [],
    };

    const spans = toFlatSpans(...args);
    for (const span of spans) {
        if (typeof span === "string" || span.type === "text") {
            appendBuffer(buffer, [span]);
        } else if (span.type === "object") {
            buffer.text += "%o";
            buffer.rest.push(span.object);
        } else if (span.type === "flush") {
            flushBuffer(buffer);
        } else if (span.type === "group") {
            flushBuffer(buffer);

            appendBuffer(buffer, span.header);

            if (span.expanded) {
                console.group(buffer.text, ...buffer.rest);
            } else {
                console.groupCollapsed(buffer.text, ...buffer.rest);
            }

            consolePrint(span.body);

            console.groupEnd();
        }
    }

    flushBuffer(buffer);
}

function appendBuffer(
    buffer: ConsoleBuffer,
    spans: (ConsoleText | string)[],
): void {
    for (const span of spans) {
        if (typeof span === "string") {
            buffer.text += span;
        } else {
            buffer.text += `%c${span.text}%c`;
            buffer.rest.push(consoleStyleToString(span.style));
            buffer.rest.push("");
        }
    }
}

function flushBuffer(buffer: ConsoleBuffer): void {
    if (buffer.text !== "") {
        console.log(buffer.text, ...buffer.rest);
    }
    buffer.text = "";
    buffer.rest = [];
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
