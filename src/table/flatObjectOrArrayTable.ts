import { ConsoleTableOptions } from "./consoleTable";
import { consoleText, ConsoleText } from "../core/consoleText";
import createTableCell from "./createTableCell";
import consoleStyles from "../inspect/utils/consoleStyles";
import consoleTableCell from "./consoleTableCell";
import calcColumnsSize from "./calcColumnsSize";
import consoleTableRow from "./consoleTableRow";
import CellBorder from "./CellBorder";
import savedAvailableLengthGuess from "../utils/savedAvailableLengthGuess";

export default function flatObjectOrArrayTable(
    object: object,
    options: Required<ConsoleTableOptions>,
): ConsoleText[] {
    const cellPadding = 2;
    const wrap =
        options.wrap === "auto" ? savedAvailableLengthGuess() : options.wrap;
    const spans: ConsoleText[] = [];
    const isArray = Array.isArray(object);
    const keys = Object.keys(object);
    const valueColumnMaxLength =
        wrap - cellPadding * 2 - (maxKeyLength(keys) + cellPadding * 2);
    const rows = keys.map((key) => {
        return [
            createTableCell(
                isArray
                    ? consoleText(
                          `[${key}]`,
                          consoleStyles[options.theme].highlight,
                      )
                    : consoleText(
                          `${key}`,
                          consoleStyles[options.theme].highlight,
                      ),
            ),
            consoleTableCell(
                object[key as keyof typeof object],
                options.theme,
                valueColumnMaxLength,
            ),
        ];
    });
    const columnsSize = calcColumnsSize(rows);
    for (let i = 0; i < rows.length; i++) {
        const isLastRow = i === rows.length - 1;
        const cellBorder = new CellBorder(options.theme);
        cellBorder.setVertical(rows, i);
        spans.push(...consoleTableRow(rows[i]!, columnsSize, cellBorder));
        if (!isLastRow) {
            spans.push(consoleText("\n"));
        }
    }
    return spans;
}

function maxKeyLength(keys: string[]): number {
    let max = 0;
    for (const key of keys) {
        max = Math.max(max, key.length);
    }
    return max;
}
