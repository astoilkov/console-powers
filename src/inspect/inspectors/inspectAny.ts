import inspectArray from "./inspectArray";
import inspectObject from "./inspectObject";
import isIterable from "../../utils/isIterable";
import isPrimitive from "../../utils/isPrimitive";
import inspectPrimitive from "./inspectPrimitive";
import { consoleText } from "../../core/consoleText";
import ConsoleMessage from "../../core/ConsoleMessage";
import { consoleObject } from "../../core/consoleObject";

export default function inspectAny(value: unknown): ConsoleMessage[] {
    if (isPrimitive(value)) {
        return [inspectPrimitive(value)];
    } else if (Array.isArray(value) || isIterable(value)) {
        const array = [...value];
        return inspectArray(array);
    } else if (typeof value === "object" && value !== null) {
        return inspectObject(value);
    } else if (value instanceof Node) {
        return [consoleObject(value)];
    }

    // fallback
    return [consoleText(String(value))];
}
