import arrayMessages from "./arrayMessages";
import objectMessages from "./objectMessages";
import isIterable from "../../utils/isIterable";
import isPrimitive from "../../utils/isPrimitive";
import primitiveMessage from "./primitiveMessage";
import { consoleText } from "../../core/consoleText";
import ConsoleMessage from "../../core/ConsoleMessage";
import { consoleObject } from "../../core/consoleObject";

export default function valueMessages(value: unknown): ConsoleMessage[] {
    if (isPrimitive(value)) {
        return [primitiveMessage(value)];
    } else if (Array.isArray(value) || isIterable(value)) {
        const array = [...value];
        return arrayMessages(array);
    } else if (typeof value === "object" && value !== null) {
        return objectMessages(value);
    } else if (value instanceof Node) {
        return [consoleObject(value)];
    }

    // fallback
    return [consoleText(String(value))];
}
