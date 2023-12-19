import { Primitive } from "type-fest";
import { ConsoleText, consoleText } from "../../core/consoleText";
import inspectPrimitive from "./inspectPrimitive";
import ConsoleItem from "../../core/ConsoleItem";
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
import canFit from "../../utils/canFit";

export default function inspectArray(
    array: unknown[],
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleItem[] {
    if (context.depth >= options.expandDepth) {
        return [consoleObject(array)];
    }

    if (array.every(isPrimitive)) {
        const singleLine = singleLineArray(array as Primitive[]);
        if (canFit(singleLine, context.indent)) {
            return singleLine;
        }
    }

    return multiLineArray(array, options, context);
}

function singleLineArray(array: Primitive[]): ConsoleText[] {
    const header = [
        consoleText("["),
        ...array.flatMap((value, i) => {
            return i === 0
                ? [inspectPrimitive(value)]
                : [consoleText(", "), inspectPrimitive(value)];
        }),
        consoleText("]"),
    ];

    return header;
    // return [
    //     consoleGroup({
    //         header,
    //         body: multiLineArrayMessages(array),
    //     }),
    // ];
}

function multiLineArray(
    array: unknown[],
    options: Required<ConsoleInspectOptions>,
    context: ConsoleInspectContext,
): ConsoleItem[] {
    return array.flatMap((value, i) => {
        const indexText = `[${i}]: `;
        const valueMessages =
            isPrimitive(value) ||
            hasOnlyPrimitives(value) ||
            context.depth + 1 >= options.expandDepth
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
            consoleText(indexText, consoleStyles.expandedKey),
            ...valueMessages,
        ];
    });
}
