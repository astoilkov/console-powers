import ConsoleStyle from "../core/ConsoleStyle";
import { ConsoleText, consoleText } from "../core/consoleText";
import consoleInline from "../utils/consoleInline";
import consoleStyles from "../inspect/utils/consoleStyles";
import hasOnlyPrimitives from "../utils/hasOnlyPrimitives";

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

export type ConsoleTableOptions = {
    theme?: "light" | "dark";
};

export default function consoleTable(
    object: object,
    options: ConsoleTableOptions = {},
): ConsoleText[] {
    const isArrayOfObjects =
        Array.isArray(object) && !hasOnlyPrimitives(object);
    const theme =
        options.theme ??
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    return isArrayOfObjects
        ? arrayOfObjects(object, theme)
        : flatObjectOrArray(object, theme);
}

function arrayOfObjects(
    array: object[],
    theme: "light" | "dark",
): ConsoleText[] {
    const spans: ConsoleText[] = [];
    const keys = [...new Set(array.flatMap((item) => Object.keys(item)))];
    const rows = [
        keys.map((key) => consoleText(key, { fontWeight: "bold" })),
        ...array.map((item) => {
            const row: ConsoleText[] = [];
            for (const key of keys) {
                row.push(consoleInline(item[key as keyof typeof item], theme));
            }
            return row;
        }),
    ];
    const columnsSize = calcColumnsSize(rows);
    for (let i = 0; i < rows.length; i++) {
        const isLastRow = i === rows.length - 1;
        const style =
            i === 0 || i === 1
                ? firstRowStyle
                : isLastRow
                  ? lastRowStyle
                  : middleRowStyle;
        spans.push(...tableRow(rows[i]!, columnsSize, style));
        if (!isLastRow) {
            spans.push(consoleText("\n"));
        }
    }
    return spans;
}

function flatObjectOrArray(
    object: object,
    theme: "light" | "dark",
): ConsoleText[] {
    const spans: ConsoleText[] = [];
    const isArray = Array.isArray(object);
    const keys = Object.keys(object);
    const rows = keys.map((key) => [
        isArray
            ? consoleText(`[${key}]`, consoleStyles[theme].highlight)
            : consoleText(`${key}:`, consoleStyles[theme].dimmed),
        consoleInline(object[(key as keyof typeof object)], theme),
    ]);
    const columnsSize = calcColumnsSize(rows);
    for (let i = 0; i < rows.length; i++) {
        const isLastRow = i === rows.length - 1;
        const style =
            i === 0 ? firstRowStyle : isLastRow ? lastRowStyle : middleRowStyle;
        spans.push(...tableRow(rows[i]!, columnsSize, style));
        if (!isLastRow) {
            spans.push(consoleText("\n"));
        }
    }
    return spans;
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
    const spans: ConsoleText[] = [];
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
        spans.push(cell);
    }
    return spans;
}
