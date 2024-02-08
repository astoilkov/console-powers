import { ConsoleText, consoleText } from "../../core/consoleText";
import isPrimitive from "../../utils/isPrimitive";
import inspectAny from "./inspectAny";
import consoleStyles from "../utils/consoleStyles";
import {
    ConsoleInspectContext,
    ConsoleInspectOptions,
} from "../consoleInspect";
import hasOnlyPrimitives from "../../utils/hasOnlyPrimitives";
import { ConsoleObject, consoleObject } from "../../core/consoleObject";
import createIndent from "../utils/createIndent";
import spansLength from "../../utils/spansLength";

export function inspectArray(
    array: unknown[],
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): (ConsoleText | ConsoleObject)[] {
    if (options.wrap !== "auto" || array.every(isPrimitive)) {
        const singleLine = inspectArraySingleLine(array, options, context);
        if (spansLength(singleLine) + context.indent <= context.wrap) {
            return singleLine;
        }
    }

    if (context.depth >= options.depth) {
        return [consoleObject(array)];
    }

    return inspectArrayMultiLine(array, options, context);
}

export function inspectArraySingleLine(
    array: unknown[],
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): (ConsoleText | ConsoleObject)[] {
    return [
        consoleText("["),
        ...array.flatMap((value, i) => {
            const spans = inspectAny(value, options, {
                ...context,
                depth: context.depth + 1,
            });
            return i === 0 ? spans : [consoleText(", "), ...spans];
        }),
        consoleText("]"),
        consoleText(` (${array.length})`, consoleStyles[options.theme].dimmed),
    ];
}

export function inspectArrayMultiLine(
    array: unknown[],
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): (ConsoleText | ConsoleObject)[] {
    return array.flatMap((value, i) => {
        const indexText = `[${i}]: `;
        const valueSpans =
            isPrimitive(value) ||
            hasOnlyPrimitives(value) ||
            context.depth + 1 >= options.depth
                ? inspectAny(value, options, {
                      indent: 0,
                      wrap: context.wrap,
                      depth: context.depth + 1,
                  })
                : [
                      consoleText("\n"),
                      ...inspectAny(value, options, {
                          wrap: context.wrap,
                          indent: context.indent + options.indent,
                          depth: context.depth + 1,
                      }),
                  ];
        return [
            ...(i === 0 ? [] : [consoleText("\n")]),
            ...createIndent(context, options),
            consoleText(indexText, consoleStyles[options.theme].highlight),
            ...valueSpans,
        ];
    });
}
