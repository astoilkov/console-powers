import { ConsoleTableCell } from "./createTableCell";
import spansLength from "../utils/spansLength";

export default function calcColumnsSize(rows: ConsoleTableCell[][]): number[] {
    const columns: number[] = [];
    for (const row of rows) {
        for (let i = 0; i < row.length; i++) {
            columns[i] = Math.max(columns[i] ?? 0, spansLength(row[i]!.spans));
        }
    }
    return columns;
}
