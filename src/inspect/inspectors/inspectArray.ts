import { Primitive } from "type-fest";
import { ConsoleText, consoleText } from "../../core/consoleText";
import inspectPrimitive from "./inspectPrimitive";
import ConsoleSpan from "../../core/ConsoleSpan";
import isPrimitive from "../../utils/isPrimitive";
import inspectAny from "./inspectAny";
import consoleStyles from "../utils/consoleStyles";
import {
    ConsoleInspectContext,
    ConsoleInspectOptions,
} from "../consoleInspect";
import hasOnlyPrimitives from "../../utils/hasOnlyPrimitives";
import { consoleObject } from "../../core/consoleObject";
import createIndent from "../utils/createIndent";
import spansLength from "../../utils/spansLength";
import { consoleGroup } from "../../core/consoleGroup";

export default function inspectArray(
    array: unknown[],
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleSpan[] {
    if (array.every(isPrimitive)) {
        const singleLine = singleLineArray(array as Primitive[], options);
        if (spansLength(singleLine) + context.indent <= options.lineLength) {
            // special case: top-level array
            // we otherwise can't use groups because they call `consoleFlush()`
            if (context.depth === 0) {
                return [
                    consoleGroup({
                        header: singleLine,
                        body: multiLineArray(array, options, context),
                    }),
                ];
            }
            return singleLine;
        }
    }

    if (context.depth >= options.depth) {
        return [consoleObject(array)];
    }

    return multiLineArray(array, options, context);
}

function singleLineArray(
    array: Primitive[],
    options: Required<ConsoleInspectOptions>,
): ConsoleText[] {
    return [
        consoleText("["),
        ...array.flatMap((value, i) => {
            return i === 0
                ? [inspectPrimitive(value, options.theme)]
                : [consoleText(", "), inspectPrimitive(value, options.theme)];
        }),
        consoleText("]"),
        consoleText(` (${array.length})`, consoleStyles[options.theme].dimmed),
    ];
}

function multiLineArray(
    array: unknown[],
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleSpan[] {
    return array.flatMap((value, i) => {
        const indexText = `[${i}]: `;
        const valueSpans =
            isPrimitive(value) ||
            hasOnlyPrimitives(value) ||
            context.depth + 1 >= options.depth
                ? inspectAny(value, options, {
                      indent: 0,
                      depth: context.depth + 1,
                  })
                : [
                      consoleText("\n"),
                      ...inspectAny(value, options, {
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
