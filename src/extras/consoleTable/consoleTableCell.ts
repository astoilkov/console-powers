import consoleInline from "../../utils/consoleInline";
import inspectAny from "../../inspect/inspectors/inspectAny";
import { ConsoleText, consoleText } from "../../core/consoleText";
import createTableCell, { ConsoleTableCell } from "./createTableCell";

export default function consoleTableCell(
    value: unknown,
    theme: "light" | "dark",
    maxCellLength: number,
): ConsoleTableCell {
    const spans = inspectAny(
        value,
        {
            theme,
            lineLength: maxCellLength,
            print: false,
            line: false,
            indent: 0,
            depth: 2,
        },
        {
            depth: 1,
            indent: 0,
        },
    ).map((span) => {
        return typeof span === "string"
            ? consoleText(span)
            : span.type === "object"
              ? consoleInline(span, theme)
              : span;
    });
    return spans.every(
        (span): span is ConsoleText =>
            span.type === "text" && !span.text.includes("\n"),
    )
        ? createTableCell(spans)
        : createTableCell(consoleInline(value, theme));
}
