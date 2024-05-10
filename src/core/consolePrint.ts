import ConsoleSpan from "./ConsoleSpan";
import ConsoleStyle from "./ConsoleStyle";
import toFlatSpans from "../utils/toFlatSpans";

export default function consolePrint(
    ...args: (ConsoleSpan | ConsoleSpan[] | ConsoleSpan[][])[]
): void {
    const buffer = new ConsoleBuffer();
    const spans = toFlatSpans(...args);
    buffer.append(spans);
    buffer.flush("log");
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
                // splitting allows text wrapping in DevTools
                if (this.#canSplit(span.style)) {
                    const splits = this.#split(span.text);
                    this.#text +=
                        splits.map((split) => `%c${split}`).join("") + "%c";
                    this.#rest.push(
                        ...new Array(splits.length).fill(
                            this.#consoleStyleToString(span.style),
                        ),
                    );
                    this.#rest.push("");
                } else {
                    this.#text += `%c${span.text}%c`;
                    this.#rest.push(this.#consoleStyleToString(span.style));
                    this.#rest.push("");
                }
            } else if (span.type === "object") {
                this.#text += "%o";
                this.#rest.push(span.object);
            } else if (span.type === "group") {
                this.flush("log");

                this.append(span.header);

                this.flush(span.expanded ? "group" : "groupCollapsed");

                consolePrint(span.body);

                console.groupEnd();
            } else if (span.type === "flush") {
                this.flush("log");
            }
        }
    }

    flush(method: "log" | "group" | "groupCollapsed"): void {
        if (this.#text !== "") {
            console[method](this.#text, ...this.#rest);
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

    #canSplit(style: ConsoleStyle): boolean {
        const allowed = ["color", "background", "fontWeight", "lineHeight"];
        const keys = Object.keys(style);
        for (const key of keys) {
            if (!allowed.includes(key)) {
                return false;
            }
        }
        return true;
    }

    #split(text: string): string[] {
        const matches = text.matchAll(/(?=\p{Upper})|\s|[^\p{Upper}\s]{12}/gu)
        const splits: string[] = []
        let offset = 0
        for (const match of matches) {
            const end = match.index + match[0].length
            splits.push(text.slice(offset, end))
            offset = end
        }
        splits.push(text.slice(offset))
        return splits;
    }
}
