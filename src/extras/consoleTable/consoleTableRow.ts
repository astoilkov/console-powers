import createCell, { ConsoleTableCell } from "./createCell";
import { consoleText, ConsoleText } from "../../core/consoleText";
import spansLength from "../../utils/spansLength";
import ConsoleStyle from "../../core/ConsoleStyle";
import consoleApply from "../../core/consoleApply";

export default function consoleTableRow(
    cells: ConsoleTableCell[],
    columnsSize: number[],
    row: "top" | "middle" | "bottom",
    theme: "light" | "dark",
): ConsoleText[] {
    const spans: ConsoleText[] = [];
    for (let i = 0; i < cells.length; i++) {
        const padEnd = columnsSize[i]! + 2 - spansLength(cells[i]!.spans);
        const cellWithPadding = createCell([
            consoleText(" "),
            ...cells[i]!.spans,
            consoleText(" ".repeat(padEnd)),
        ]);
        const cell =
            i === 0
                ? applyCellStyle(cellWithPadding, row, "left", theme)
                : i === cells.length - 1
                  ? applyCellStyle(cellWithPadding, row, "right", theme)
                  : applyCellStyle(cellWithPadding, row, "middle", theme);
        spans.push(...cell.spans);
    }
    return spans;
}

function applyCellStyle(
    cell: ConsoleTableCell,
    row: "top" | "middle" | "bottom",
    column: "left" | "middle" | "right",
    theme: "light" | "dark",
): ConsoleTableCell {
    const color = theme === "light" ? "black" : "#474747";
    const rowStyle = {
        top: { borderTop: `1px solid ${color}` },
        middle: {},
        bottom: { borderBottom: `1px solid ${color}` },
    }[row];
    const columnStyle = {
        left: { borderLeft: `1px solid ${color}` },
        middle: { borderLeft: `1px solid ${color}` },
        right: {
            borderLeft: `1px solid ${color}`,
            borderRight: `1px solid ${color}`,
        },
    }[column];
    const style = {
        ...rowStyle,
        ...columnStyle,
        lineHeight: "1.8",
    } satisfies ConsoleStyle;
    if (cell.spans.length > 1) {
        const { borderLeft, borderRight, ...restStyle } = style;
        return createCell([
            ...consoleApply(cell.spans[0]!, { ...restStyle, borderLeft }),
            ...consoleApply(cell.spans.slice(1, -1), restStyle),
            ...consoleApply(cell.spans.at(-1)!, {
                ...restStyle,
                borderRight,
            }),
        ]);
    }
    return createCell(consoleApply(cell.spans, style));
}
