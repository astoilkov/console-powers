import inspectArray from "./inspectArray";
import inspectObject from "./inspectObject";
import isIterable from "../../utils/isIterable";
import isPrimitive from "../../utils/isPrimitive";
import inspectPrimitive from "./inspectPrimitive";
import { ConsoleText, consoleText } from "../../core/consoleText";
import { ConsoleObject, consoleObject } from "../../core/consoleObject";
import { ConsoleInspectContext, ConsoleInspectOptions } from "../consoleInspect";

export default function inspectAny(
    value: unknown,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): (ConsoleText | ConsoleObject)[] {
    if (isPrimitive(value)) {
        return [inspectPrimitive(value, options.theme)];
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
