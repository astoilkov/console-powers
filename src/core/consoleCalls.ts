import ConsoleSpan from "./ConsoleSpan";
import ConsoleStyle from "./ConsoleStyle";
import toFlatSpans from "../utils/toFlatSpans";

export default function consoleCalls(
    ...args: (ConsoleSpan | ConsoleSpan[] | ConsoleSpan[][])[]
): readonly ConsoleCall[] {
    const consoleCalls = new ConsoleCalls();
    const spans = toFlatSpans(...args);
    consoleCalls.append(spans);
    return consoleCalls.calls();
}

interface ConsoleCall {
    readonly method: "log" | "group" | "groupCollapsed" | "groupEnd";
    readonly text: string;
    readonly rest: readonly (string | object)[];
}

class ConsoleCalls {
    #text = "";
    #rest: (string | object)[] = [];
    #calls: ConsoleCall[] = [];

    calls(): readonly ConsoleCall[] {
        return this.#calls;
    }

    append(spans: ConsoleSpan | ConsoleSpan[]): void {
        this.#append(spans);
        this.#addBufferedCall("log");
    }

    #append(spans: ConsoleSpan | ConsoleSpan[]): void {
        spans = Array.isArray(spans) ? spans : [spans];
        for (const span of spans) {
            if (typeof span === "string") {
                this.#text += span;
            } else if (span.type === "text") {
                // splitting allows text wrapping in DevTools
                if (this.#canSplit(span.text, span.style)) {
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
                this.#addBufferedCall("log");

                this.#append(span.header);

                this.#addBufferedCall(
                    span.expanded ? "group" : "groupCollapsed",
                );

                this.#append(span.body);

                this.#addBufferedCall("log");

                this.#addBufferedCall("groupEnd");
            } else if (span.type === "flush") {
                this.#addBufferedCall("log");
            }
        }
    }

    #addBufferedCall(method: ConsoleCall["method"]): void {
        if (method !== "groupEnd" && this.#text === "") {
            return;
        }

        this.#calls.push({
            method,
            text: this.#text,
            rest: this.#rest,
        });
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

    #canSplit(text: string, style: ConsoleStyle): boolean {
        if (
            text.includes("https://") ||
            text.includes("http://") ||
            text.includes("www.")
        ) {
            return false;
        }
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
        const matches = text.matchAll(/(?=\p{Upper})|\s|[^\p{Upper}\s]{12}/gu);
        const splits: string[] = [];
        let offset = 0;
        for (const match of matches) {
            const end = match.index + match[0].length;
            splits.push(text.slice(offset, end));
            offset = end;
        }
        splits.push(text.slice(offset));
        return splits;
    }
}
