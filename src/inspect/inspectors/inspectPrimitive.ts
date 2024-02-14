import { ConsoleText, consoleText } from "../../core/consoleText";
import { Primitive } from "type-fest";
import consoleStyles from "../utils/consoleStyles";
import stringExcerpt from "../../utils/stringExcerpt";

export default function inspectPrimitive(
    value: Primitive | Date,
    theme: "light" | "dark",
    maxStringLength: number = 100,
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
        return consoleText(
            stringExcerpt(`'${prepareString(value)}'`, maxStringLength),
            consoleStyles[theme].string,
        );
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
        return consoleText(`${value.toLocaleDateString()} ${value.toLocaleTimeString()}`, {
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
