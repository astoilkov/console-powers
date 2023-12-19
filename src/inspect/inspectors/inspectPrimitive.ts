import { ConsoleText, consoleText } from "../../core/consoleText";
import { Primitive } from "type-fest";
import consoleStyles from "../utils/consoleStyles";

export default function inspectPrimitive(value: Primitive): ConsoleText {
    const type = typeof value;
    if (value === undefined || value === null) {
        return consoleText(String(value), consoleStyles.undefinedNull);
    } else if (type === "number" || type === "bigint") {
        return consoleText(String(value), consoleStyles.number);
    } else if (type === "string") {
        const string = String(value);
        if (string.length > 100) {
            return consoleText(
                `'${string.slice(0, 50)}…${string.slice(-49)}'`,
                consoleStyles.string,
            );
        }
        return consoleText(`'${string}'`, consoleStyles.string);
    } else if (type === "symbol") {
        return consoleText(String(value), consoleStyles.string);
    }

    // fallback
    return consoleText(String(value));
}
