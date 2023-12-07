import { Primitive } from "type-fest";
import { consoleText } from "../../core/consoleText";
import getPrimitiveMessage from "./inspectPrimitive";
import ConsoleMessage from "../../core/ConsoleMessage";
import isPrimitive from "../../utils/isPrimitive";
import inspectAny from "./inspectAny";
import consoleStyles from "../consoleStyles";
import { InspectionContext } from "../consoleInspect";
import hasOnlyPrimitives from "../../utils/hasOnlyPrimitives";

export default function inspectArray(
    array: unknown[],
    context: InspectionContext,
): ConsoleMessage[] {
    return array.every(isPrimitive)
        ? //
          singleLineArray(array)
        : multiLineArray(array, context);
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
    context: InspectionContext,
): ConsoleMessage[] {
    return array.flatMap((value, i) => {
        const indexText = `[${i}]: `;
        const valueMessages =
            isPrimitive(value) || hasOnlyPrimitives(value)
                ? inspectAny(value, { left: 0 })
                : [
                      consoleText("\n"),
                      ...inspectAny(value, {
                          left: context.left + 2,
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
