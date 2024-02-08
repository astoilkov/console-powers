import createTableCell, { ConsoleTableCell } from "./createTableCell";
import { consoleText, ConsoleText } from "../../core/consoleText";
import spansLength from "../../utils/spansLength";
import CellBorder from "./CellBorder";

export default function consoleTableRow(
    cells: ConsoleTableCell[],
    columnsSize: number[],
    cellBorder: CellBorder,
): ConsoleText[] {
    const spans: ConsoleText[] = [];
    for (let i = 0; i < cells.length; i++) {
        const padEnd = columnsSize[i]! + 2 - spansLength(cells[i]!.spans);
        const cellWithPadding = createTableCell([
            consoleText(" "),
            ...cells[i]!.spans,
            consoleText(" ".repeat(padEnd)),
        ]);
        cellBorder.setHorizontal(cells, i);
        spans.push(...cellBorder.apply(cellWithPadding).spans);
    }
    return spans;
}
