import { Primitive } from "type-fest";
import { consoleText } from "../../core/consoleText";
import getPrimitiveMessage from "./inspectPrimitive";
import ConsoleMessage from "../../core/ConsoleMessage";
import isPrimitive from "../../utils/isPrimitive";
import inspectAny from "./inspectAny";
import consoleStyles from "../consoleStyles";
import { InspectionContext, InspectionOptions } from "../consoleInspect";
import hasOnlyPrimitives from "../../utils/hasOnlyPrimitives";

export default function inspectArray(
    array: unknown[],
    options: Required<InspectionOptions>,
    context: InspectionContext,
): ConsoleMessage[] {
    if (context.depth >= options.expandDepth) {
        return [consoleText("[…]")];
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
                ? [getPrimitiveMessage(value)]
                : [consoleText(", "), getPrimitiveMessage(value)];
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
        console.log(context.depth, options.expandDepth)
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
