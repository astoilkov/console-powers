import consolePrint from "../core/consolePrint";
import inspectAny from "./inspectors/inspectAny";
import consoleApply from "../core/consoleApply";
import ConsoleSpan from "../core/ConsoleSpan";

export interface ConsoleInspectOptions {
    line?: boolean;
    indent?: number;
    print?: boolean;
    expandDepth?: number;
    lineLength?: number;
    theme?: "light" | "dark";
    // preferMultiLine?: boolean;
    // preferSingleLine?: boolean;
    // preferTables?: boolean;
}

export interface ConsoleInspectContext {
    indent: number;
    depth: number;
}

export default function consoleInspect(
    value: unknown,
    options?: ConsoleInspectOptions,
): ConsoleSpan[] {
    const spans = consoleApply(
        inspectAny(
            value,
            {
                expandDepth: 2,
                indent: 4,
                line: false,
                lineLength: defaultLineLength(),
                theme: matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light",
                print: true,
                ...options,
            },
            {
                depth: 0,
                indent: 0,
            },
        ),
        {
            lineHeight: "1.6",
        },
    );

    if (options?.print !== false) {
        consolePrint(spans);
    }

    return spans;
}

function defaultLineLength(): number {
    // - if a window is 1400px wide, a DevTools window positioned horizontally
    //   will have around 1150 space for printing characters on one line. note
    //   that this is variable due to the right side being taken by the name of
    //   the function that called logging which varies in length
    // - then, you have around 250px of margins that DevTools is adding
    // - then, each character is around 6.6px wide
    const CHAR_WIDTH = 6.6;
    const DEV_TOOLS_MARGINS = 250;
    return Math.round((window.innerWidth - DEV_TOOLS_MARGINS) / CHAR_WIDTH);
}
