import { ConsoleText, consoleText } from "../../core/consoleText";
import { Primitive } from "type-fest";
import consoleStyles from "../consoleStyles";

export default function primitiveMessage(value: Primitive): ConsoleText {
    const type = typeof value;
    if (value === undefined || value === null) {
        return consoleText(String(value), consoleStyles.undefinedNull);
    } else if (type === "number" || type === "bigint") {
        return consoleText(String(value), consoleStyles.number);
    } else if (type === "string") {
        return consoleText(`'${String(value)}'`, consoleStyles.string);
    } else if (type === "symbol") {
        return consoleText(String(value), consoleStyles.string);
    }

    // fallback
    return consoleText(String(value));
}
