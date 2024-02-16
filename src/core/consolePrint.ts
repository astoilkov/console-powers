import ConsoleSpan from "./ConsoleSpan";
import ConsoleStyle from "./ConsoleStyle";
import toFlatSpans from "../utils/toFlatSpans";

export default function consolePrint(
    ...args: (ConsoleSpan | ConsoleSpan[] | ConsoleSpan[][])[]
): void {
    const buffer = new ConsoleBuffer();
    const spans = toFlatSpans(...args);
    buffer.append(spans);
    buffer.flush();
}

class ConsoleBuffer {
    #text = "";
    #rest: (string | object)[] = [];

    append(spans: ConsoleSpan | ConsoleSpan[]): void {
        spans = Array.isArray(spans) ? spans : [spans];
        for (const span of spans) {
            if (typeof span === "string") {
                this.#text += span;
            } else if (span.type === "text") {
                this.#text += `%c${span.text}%c`;
                this.#rest.push(this.#consoleStyleToString(span.style));
                this.#rest.push("");
            } else if (span.type === "object") {
                this.#text += "%o";
                this.#rest.push(span.object);
            } else if (span.type === "group") {
                this.flush();

                this.append(span.header);

                if (span.expanded) {
                    console.group(this.#text, ...this.#rest);
                } else {
                    console.groupCollapsed(this.#text, ...this.#rest);
                }

                consolePrint(span.body);

                console.groupEnd();
            } else if (span.type === "flush") {
                this.flush();
            }
        }
    }

    flush(): void {
        if (this.#text !== "") {
            console.log(this.#text, ...this.#rest);
        }
        this.#text = "";
        this.#rest = [];
    }

    #consoleStyleToString(style: ConsoleStyle): string {
        return Object.entries(style)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key, value]) => {
                return `${key.replace(/[A-Z]/g, function (match) {
                    return "-" + match.toLowerCase();
                })}:${value}`;
            })
            .join(";");
    }
}
