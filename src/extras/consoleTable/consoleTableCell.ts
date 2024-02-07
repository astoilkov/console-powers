import consoleInline from "../../utils/consoleInline";
import inspectAny from "../../inspect/inspectors/inspectAny";
import { ConsoleText } from "../../core/consoleText";
import ensureConsoleText from "../../utils/ensureConsoleText";
import { ConsoleTableCell } from "./createCell";

export default function consoleTableCell(
    value: unknown,
    theme: "light" | "dark",
    maxCellLength: number,
): ConsoleTableCell {
    const spans = inspectAny(
        value,
        {
            lineLength: maxCellLength,
            theme,
            print: false,
            line: false,
            indent: 0,
            depth: 1,
        },
        {
            depth: 1,
            indent: 0,
        },
    );
    if (
        spans.every(
            (span): span is string | ConsoleText =>
                typeof span === "string" || span.type === "text",
        )
    ) {
        return { spans: spans.map((span) => ensureConsoleText(span)) };
    }
    return {
        spans: [consoleInline(value, theme)],
    };
}
