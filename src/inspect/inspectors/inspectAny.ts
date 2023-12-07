import inspectArray from "./inspectArray";
import inspectObject from "./inspectObject";
import isIterable from "../../utils/isIterable";
import isPrimitive from "../../utils/isPrimitive";
import inspectPrimitive from "./inspectPrimitive";
import { consoleText } from "../../core/consoleText";
import ConsoleMessage from "../../core/ConsoleMessage";
import { consoleObject } from "../../core/consoleObject";
import { InspectionContext, InspectionOptions } from "../consoleInspect";

export default function inspectAny(
    value: unknown,
    options: Required<InspectionOptions>,
    context: InspectionContext,
): ConsoleMessage[] {
    if (isPrimitive(value)) {
        return [inspectPrimitive(value)];
    } else if (Array.isArray(value) || isIterable(value)) {
        const array = [...value];
        return inspectArray(array, options, context);
    } else if (typeof value === "object" && value !== null) {
        return inspectObject(value, options, context);
    } else if (value instanceof Node) {
        return [consoleObject(value)];
    }

    // fallback
    return [consoleText(String(value))];
}
