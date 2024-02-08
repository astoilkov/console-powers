import { ConsoleText, consoleText } from "../../core/consoleText";
import consoleTableCell from "./consoleTableCell";
import createTableCell, { ConsoleTableCell } from "./createTableCell";
import calcColumnsSize from "./calcColumnsSize";
import consoleTableRow from "./consoleTableRow";
import { ConsoleTableOptions } from "../consoleTable";

export default function arrayOfObjectsTable(
    array: object[],
    options: Required<ConsoleTableOptions>,
): ConsoleText[] {
    const spans: ConsoleText[] = [];
    const keys = [...new Set(array.flatMap((item) => Object.keys(item)))];
    const lengthPerColumn = Math.floor(options.lineLength / keys.length);
    const rows = [
        keys.map((key) => createTableCell(consoleText(key, { fontWeight: "bold" }))),
        ...array.map((item) => {
            const row: ConsoleTableCell[] = [];
            for (const key of keys) {
                row.push(
                    consoleTableCell(
                        item[key as keyof typeof item],
                        options.theme,
                        lengthPerColumn,
                    ),
                );
            }
            return row;
        }),
    ];
    const columnsSize = calcColumnsSize(rows);
    for (let i = 0; i < rows.length; i++) {
        const isLastRow = i === rows.length - 1;
        const row =
            i === 0 || i === 1 ? "top" : isLastRow ? "bottom" : "middle";
        spans.push(
            ...consoleTableRow(rows[i]!, columnsSize, row, options.theme),
        );
        if (!isLastRow) {
            spans.push(consoleText("\n"));
        }
    }
    return spans;
}
