import { consoleText, ConsoleText } from "../../core/consoleText";
import isPrimitive from "../../utils/isPrimitive";
import inspectPrimitive from "./inspectPrimitive";
import isIterable from "../../utils/isIterable";

export default function inspectInline(
    value: unknown,
    theme: "light" | "dark",
): ConsoleText {
    if (isPrimitive(value)) {
        return inspectPrimitive(value, theme);
    } else if (Array.isArray(value) || isIterable(value)) {
        const arr = [...value];
        return consoleText(`[…] (${arr.length})`);
    } else {
        return consoleText("{…}");
    }
}
