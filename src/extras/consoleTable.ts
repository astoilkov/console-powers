import ConsoleStyle from "../core/ConsoleStyle";
import { ConsoleText, consoleText } from "../core/consoleText";
import consoleInline from "../utils/consoleInline";
import consoleStyles from "../inspect/utils/consoleStyles";

const firstRowStyle = {
    left: {
        borderTop: "1px solid black",
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
    },
    middle: {
        borderTop: "1px solid black",
        borderRight: "1px solid black",
    },
    right: {
        borderTop: "1px solid black",
        borderRight: "1px solid black",
    },
};
const middleRowStyle = {
    left: {
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
    },
    middle: {
        borderRight: "1px solid black",
    },
    right: {
        borderRight: "1px solid black",
    },
};
const lastRowStyle = {
    left: {
        borderBottom: "1px solid black",
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
    },
    middle: {
        borderBottom: "1px solid black",
        borderRight: "1px solid black",
    },
    right: {
        borderBottom: "1px solid black",
        borderRight: "1px solid black",
    },
};

export default function consoleTable(object: object): ConsoleText[] {
    return flatObjectArray(object);
}

function flatObjectArray(object: object): ConsoleText[] {
    const messages: ConsoleText[] = [];
    const isArray = Array.isArray(object);
    const keys = Object.keys(object);
    const rows = keys.map((key) => [
        isArray
            ? consoleText(`[${key}]`, consoleStyles.expandedKey)
            : consoleText(`${key}:`, consoleStyles.collapsedObjectKey),
        consoleInline(object[key as keyof typeof object]),
    ]);
    const columnsSize = calcColumnsSize(rows);
    for (let i = 0; i < keys.length; i++) {
        const isLastRow = i === keys.length - 1;
        const style =
            i === 0 ? firstRowStyle : isLastRow ? lastRowStyle : middleRowStyle;
        messages.push(
            ...tableRow(
                [
                    isArray
                        ? consoleText(`[${i}]`, consoleStyles.expandedKey)
                        : consoleText(
                              `${keys[i]}:`,
                              consoleStyles.collapsedObjectKey,
                          ),
                    consoleInline(object[keys[i] as keyof typeof object]),
                ],
                columnsSize,
                style,
            ),
        );
        if (!isLastRow) {
            messages.push(consoleText("\n"));
        }
    }
    return messages;
}

function calcColumnsSize(rows: ConsoleText[][]): number[] {
    const columns: number[] = [];
    for (const row of rows) {
        for (let i = 0; i < row.length; i++) {
            columns[i] = Math.max(columns[i] ?? 0, row[i]!.text.length);
        }
    }
    return columns;
}

function tableRow(
    cells: ConsoleText[],
    columnsSize: number[],
    styles: {
        left: ConsoleStyle;
        right: ConsoleStyle;
        middle: ConsoleStyle;
    },
): ConsoleText[] {
    const messages: ConsoleText[] = [];
    for (let i = 0; i < cells.length; i++) {
        const style =
            i === 0
                ? styles.left
                : i === cells.length - 1
                  ? styles.right
                  : styles.middle;
        const cell = cells[i]!;
        cell.text = "  " + cell.text.padEnd(columnsSize[i]! + 2);
        cell.style = {
            ...cell.style,
            ...style,
            lineHeight: "1.8",
        };
        messages.push(cell);
    }
    return messages;
}
