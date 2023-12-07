import { Primitive } from "type-fest";
import { consoleText } from "../../core/consoleText";
import inspectPrimitive from "./inspectPrimitive";
import ConsoleMessage from "../../core/ConsoleMessage";
import isPrimitive from "../../utils/isPrimitive";
import inspectAny from "./inspectAny";
import consoleStyles from "../consoleStyles";
import { InspectionContext, InspectionOptions } from "../consoleInspect";
import hasOnlyPrimitives from "../../utils/hasOnlyPrimitives";
import { consoleObject } from "../../core/consoleObject";

export default function inspectArray(
    array: unknown[],
    options: Required<InspectionOptions>,
    context: InspectionContext,
): ConsoleMessage[] {
    if (context.depth >= options.expandDepth) {
        return [consoleObject(array)];
    }

    return array.every(isPrimitive)
        ? //
          singleLineArray(array)
        : multiLineArray(array, options, context);
}

function singleLineArray(array: Primitive[]): ConsoleMessage[] {
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
    options: Required<InspectionOptions>,
    context: InspectionContext,
): ConsoleMessage[] {
    return array.flatMap((value, i) => {
        const indexText = `[${i}]: `;
        const valueMessages =
            isPrimitive(value) ||
            hasOnlyPrimitives(value) ||
            context.depth + 1 >= options.expandDepth
                ? inspectAny(value, options, {
                      left: 0,
                      depth: context.depth + 1,
                  })
                : [
                      consoleText("\n"),
                      ...inspectAny(value, options, {
                          left: context.left + 2,
                          depth: context.depth + 1,
                      }),
                  ];
        return [
            ...(i === 0 ? [] : [consoleText("\n")]),
            consoleText(" ".repeat(context.left)),
            consoleText(indexText, consoleStyles.expandedKey),
            ...valueMessages,
        ];
    });
}
