import { ConsoleTableOptions } from "../consoleTable";
import { consoleText, ConsoleText } from "../../core/consoleText";
import createTableCell from "./createTableCell";
import consoleStyles from "../../inspect/utils/consoleStyles";
import consoleTableCell from "./consoleTableCell";
import calcColumnsSize from "./calcColumnsSize";
import consoleTableRow from "./consoleTableRow";

export default function flatObjectOrArrayTable(
    object: object,
    options: Required<ConsoleTableOptions>,
): ConsoleText[] {
    const spans: ConsoleText[] = [];
    const isArray = Array.isArray(object);
    const keys = Object.keys(object);
    const lengthPerColumn = Math.floor(options.lineLength / keys.length);
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
                lengthPerColumn,
            ),
        ];
    });
    const columnsSize = calcColumnsSize(rows);
    for (let i = 0; i < rows.length; i++) {
        const isLastRow = i === rows.length - 1;
        const row = i === 0 ? "top" : isLastRow ? "bottom" : "middle";
        spans.push(
            ...consoleTableRow(rows[i]!, columnsSize, row, options.theme),
        );
        if (!isLastRow) {
            spans.push(consoleText("\n"));
        }
    }
    return spans;
}
