import arrify from "arrify";
import arrayMessages from "./arrayMessages";
import objectMessages from "./objectMessages";
import { consoleObject } from "../../core/consoleObject";
import { consoleText } from "../../core/consoleText";
import isPrimitive from "../../utils/isPrimitive";
import primitiveMessage from "./primitiveMessage";
import isIterable from "../../utils/isIterable";
import ConsoleMessage from "../../core/ConsoleMessage";

export default function valueMessages(value: unknown): ConsoleMessage[] {
    if (isPrimitive(value)) {
        return [primitiveMessage(value)];
    } else if (Array.isArray(value) || isIterable(value)) {
        const array = arrify(value);
        return arrayMessages(array);
    } else if (typeof value === "object" && value !== null) {
        return objectMessages(value);
    } else if (value instanceof Node) {
        return [consoleObject(value)];
    }

    // fallback
    return [consoleText(String(value))];
}
