import inspectInline from "../../inspect/inspectors/inspectInline";
import inspectAny from "../../inspect/inspectors/inspectAny";
import { ConsoleText, consoleText } from "../../core/consoleText";
import createTableCell, { ConsoleTableCell } from "./createTableCell";
import spansLength from "../../utils/spansLength";

export default function consoleTableCell(
    value: unknown,
    theme: "light" | "dark",
    maxCellLength: number,
): ConsoleTableCell {
    const spans = findOptimalExpansion(value, theme, maxCellLength);
    return spans === undefined
        ? createTableCell(inspectInline(value, theme))
        : createTableCell(spans);
}

function findOptimalExpansion(
    value: unknown,
    theme: "light" | "dark",
    maxCellLength: number,
): ConsoleText[] | undefined {
    let optimal: ConsoleText[] | undefined;
    let depth = 0;
    while (true) {
        let hasObject = false;
        const spans = inspectAny(
            value,
            {
                theme,
                wrap: "single-line",
                print: false,
                line: false,
                indent: 0,
                depth: depth + 1,
            },
            {
                depth: depth,
                indent: 0,
                wrap: Number.MAX_SAFE_INTEGER,
            },
        ).map((span) => {
            return typeof span === "string"
                ? consoleText(span)
                : span.type === "object"
                  ? ((hasObject = true), inspectInline(span, theme))
                  : span;
        });
        if (
            spans.every((span): span is ConsoleText => span.type === "text") &&
            spansLength(spans) <= maxCellLength
        ) {
            depth += 1;
            optimal = spans;
            if (!hasObject) {
                break;
            }
            if (depth > 6) {
                break;
            }
        } else {
            break;
        }
    }
    return optimal;
}
