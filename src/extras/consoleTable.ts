import { ConsoleText, consoleText } from "../core/consoleText";
import consoleInline from "../utils/consoleInline";
import consoleStyles from "../inspect/utils/consoleStyles";
import hasOnlyPrimitives from "../utils/hasOnlyPrimitives";
import consolePrint from "../core/consolePrint";
import ConsoleStyle from "../core/ConsoleStyle";

export type ConsoleTableOptions = {
    print?: boolean;
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
    const spans = isArrayOfObjects
        ? arrayOfObjects(object, theme)
        : flatObjectOrArray(object, theme);

    if (options.print !== false) {
        consolePrint(spans);
    }

    return spans;
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
        const row =
            i === 0 || i === 1 ? "top" : isLastRow ? "bottom" : "middle";
        spans.push(...tableRow(rows[i]!, columnsSize, row, theme));
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
        consoleInline(object[key as keyof typeof object], theme),
    ]);
    const columnsSize = calcColumnsSize(rows);
    for (let i = 0; i < rows.length; i++) {
        const isLastRow = i === rows.length - 1;
        const row = i === 0 ? "top" : isLastRow ? "bottom" : "middle";
        spans.push(...tableRow(rows[i]!, columnsSize, row, theme));
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
    row: "top" | "middle" | "bottom",
    theme: "light" | "dark",
): ConsoleText[] {
    const spans: ConsoleText[] = [];
    for (let i = 0; i < cells.length; i++) {
        const style =
            i === 0
                ? getRowStyle(row, "left", theme)
                : i === cells.length - 1
                  ? getRowStyle(row, "right", theme)
                  : getRowStyle(row, "middle", theme);
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

function getRowStyle(
    row: "top" | "middle" | "bottom",
    column: "left" | "middle" | "right",
    theme: "light" | "dark",
): ConsoleStyle {
    const color = theme === "light" ? "black" : "#474747";
    const rowStyle = {
        top: { borderTop: `1px solid ${color}` },
        middle: {},
        bottom: { borderBottom: `1px solid ${color}` },
    }[row];
    const columnStyle = {
        left: { borderLeft: `1px solid ${color}` },
        middle: { borderLeft: `1px solid ${color}` },
        right: { borderRight: `1px solid ${color}` },
    }[column];
    return { ...rowStyle, ...columnStyle };
}
