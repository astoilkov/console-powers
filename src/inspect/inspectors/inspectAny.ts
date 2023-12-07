import inspectArray from "./inspectArray";
import inspectObject from "./inspectObject";
import isIterable from "../../utils/isIterable";
import isPrimitive from "../../utils/isPrimitive";
import inspectPrimitive from "./inspectPrimitive";
import { consoleText } from "../../core/consoleText";
import ConsoleMessage from "../../core/ConsoleMessage";
import { consoleObject } from "../../core/consoleObject";
import { InspectionContext } from "../consoleInspect";

export default function inspectAny(
    value: unknown,
    context: InspectionContext,
): ConsoleMessage[] {
    if (isPrimitive(value)) {
        return [inspectPrimitive(value)];
    } else if (Array.isArray(value) || isIterable(value)) {
        const array = [...value];
        return inspectArray(array, context);
    } else if (typeof value === "object" && value !== null) {
        return inspectObject(value, context);
    } else if (value instanceof Node) {
        return [consoleObject(value)];
    }

    // fallback
    return [consoleText(String(value))];
}
