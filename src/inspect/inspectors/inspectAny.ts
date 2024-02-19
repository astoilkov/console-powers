import isIterable from "../../utils/isIterable";
import isPrimitive from "../../utils/isPrimitive";
import inspectPrimitive from "./inspectPrimitive";
import { consoleText } from "../../core/consoleText";
import {
    ConsoleInspectContext,
    ConsoleInspectOptions,
} from "../consoleInspect";
import { inspectIterable } from "./inspectIterable";
import { inspectObject } from "./inspectObject";
import ConsoleInspection from "../utils/ConsoleInspection";

export default function inspectAny(
    value: unknown,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleInspection {
    if (isPrimitive(value)) {
        return {
            type: "inline",
            spans: [
                inspectPrimitive(
                    value,
                    options.theme,
                    Math.round(context.wrap),
                ),
            ],
        };
    } else if (Array.isArray(value) || isIterable(value)) {
        return inspectIterable(value, options, context);
    } else if (typeof value === "object" && value !== null) {
        return inspectObject(value, options, context);
    }

    // fallback
    return {
        type: "inline",
        spans: [consoleText(String(value))],
    };
}
