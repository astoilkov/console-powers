import { ConsoleText, consoleText } from "../../core/consoleText";
import { Primitive } from "type-fest";
import consoleStyles from "../utils/consoleStyles";

export default function inspectPrimitive(
    value: Primitive | Date,
    theme: "light" | "dark",
): ConsoleText {
    const type = typeof value;
    if (value === undefined) {
        return consoleText(String(value), consoleStyles[theme].undefined);
    } else if (value === null) {
        return consoleText(String(value), consoleStyles[theme].null);
    } else if (type === "boolean") {
        return consoleText(String(value), consoleStyles[theme].boolean);
    } else if (type === "number") {
        return consoleText(String(value), consoleStyles[theme].number);
    } else if (type === "bigint") {
        return consoleText(`${String(value)}n`, consoleStyles[theme].bigint);
    } else if (type === "string") {
        const string = prepareString(value)
        if (string.length > 100) {
            return consoleText(
                `'${string.slice(0, 50)}…${string.slice(-49)}'`,
                consoleStyles[theme].string,
            );
        }
        return consoleText(`'${string}'`, consoleStyles[theme].string);
    } else if (type === "symbol") {
        return consoleText(prepareString(value), consoleStyles[theme].string);
    } else if (value instanceof Date) {
        if (
            value.getHours() === 0 &&
            value.getMinutes() === 0 &&
            value.getSeconds() === 0 &&
            value.getMilliseconds() === 0
        ) {
            return consoleText(value.toLocaleDateString(), {
                fontStyle: "italic",
            });
        }
        return consoleText(value.toLocaleString(), {
            fontStyle: "italic",
        });
    }

    // fallback
    return consoleText(prepareString(value));
}

function prepareString(string: unknown): string {
    return String(string)
        .replace(/\n/gu, "\\n")
        .replace(/\t/gu, "\\t")
        .replace(/\r/gu, "\\r");
}
