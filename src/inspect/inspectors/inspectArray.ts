import { Primitive } from "type-fest";
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
import inspectInline from "./inspectInline";

export default function inspectArray(
    array: unknown[],
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): (ConsoleText | ConsoleObject)[] {
    if (options.wrap !== "auto" || array.every(isPrimitive)) {
        const singleLine = singleLineArray(array as Primitive[], options);
        if (spansLength(singleLine) + context.indent <= context.wrap) {
            // special case: top-level array
            // we otherwise can't use groups because they call `consoleFlush()`
            // if (context.depth === 0) {
            //     return [
            //         consoleGroup({
            //             header: singleLine,
            //             body: multiLineArray(array, options, context),
            //         }),
            //     ];
            // }
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
): (ConsoleText | ConsoleObject)[] {
    return [
        consoleText("["),
        ...array.flatMap((value, i) => {
            return i === 0
                ? [inspectInline(value, options.theme)]
                : [consoleText(", "), inspectInline(value, options.theme)];
        }),
        consoleText("]"),
        consoleText(` (${array.length})`, consoleStyles[options.theme].dimmed),
    ];
}

function multiLineArray(
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
