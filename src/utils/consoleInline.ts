import { consoleText, ConsoleText } from "../core/consoleText";
import isPrimitive from "./isPrimitive";
import inspectPrimitive from "../inspect/inspectors/inspectPrimitive";
import isIterable from "./isIterable";

export default function consoleInline(value: unknown): ConsoleText {
    if (isPrimitive(value)) {
        return inspectPrimitive(value);
    } else if (Array.isArray(value) || isIterable(value)) {
        const arr = [...value];
        return consoleText(`[…] (${arr.length})`);
    } else {
        return consoleText("{…}");
    }
}
