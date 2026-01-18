import isPrimitive from "../../utils/isPrimitive";
import inspectPrimitive from "./inspectPrimitive";
import {
    ConsoleInspectContext,
    ConsoleInspectOptions,
} from "../consoleInspect";
import ConsoleInspection from "../utils/ConsoleInspection";
import { inspectIterative } from "../iterative/inspectIterative";

export default function inspectAny(
    value: unknown,
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleInspection {
    // Fast path for primitives - handle directly without queueing
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
    }
    
    // For non-primitives (objects, arrays, iterables), route through inspectIterative
    // This uses the iterative work queue approach to avoid stack overflow on deep nesting
    return inspectIterative(value, options, context);
}
