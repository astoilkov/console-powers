import ConsoleStyle from "../core/ConsoleStyle";
import ConsoleMessage from "../core/ConsoleMessage";
import { ConsoleText, consoleText } from "../core/consoleText";
import isPrimitive from "../utils/isPrimitive";
import inspectPrimitive from "../inspect/inspectors/inspectPrimitive";

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

export default function consoleTable(object: object): ConsoleMessage[] {
    const messages: ConsoleMessage[] = [];
    const keyPad =
        maxLength(Object.keys(object).map((key) => cellText(key).text.length)) +
        2;
    const valuePad =
        maxLength(
            Object.values(object).map((value) => cellText(value).text.length),
        ) + 2;

    // messages.push(
    //     ...tableRow(['key', 'value'], [keyPad, valuePad], firstRowStyle),
    //     consoleText('\n'),
    // )
    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
        const isLastRow = i === keys.length - 1;
        const style =
            i === 0 ? firstRowStyle : isLastRow ? lastRowStyle : middleRowStyle;
        messages.push(
            ...tableRow(
                [keys[i], object[keys[i] as keyof typeof object]],
                [keyPad, valuePad],
                style,
            ),
        );
        if (!isLastRow) {
            messages.push(consoleText("\n"));
        }
    }
    return messages;
}

function tableRow(
    values: unknown[],
    pad: number[],
    styles: {
        left: ConsoleStyle;
        right: ConsoleStyle;
        middle: ConsoleStyle;
    },
): ConsoleText[] {
    const messages: ConsoleText[] = [];
    for (let i = 0; i < values.length; i++) {
        const style =
            i === 0
                ? styles.left
                : i === values.length - 1
                  ? styles.right
                  : styles.middle;
        const cell = cellText(values[i]);
        cell.text = "  " + cell.text.padEnd(pad[i] ?? 0);
        cell.style = {
            ...cell.style,
            ...style,
            lineHeight: "1.8",
        };
        messages.push(cell);
    }
    return messages;
}

function cellText(value: unknown): ConsoleText {
    return isPrimitive(value)
        ? inspectPrimitive(value)
        : consoleText(String(value));
}

function maxLength(values: number[]): number {
    let max = 0;
    for (const value of values) {
        max = Math.max(max, value);
    }
    return max;
}
