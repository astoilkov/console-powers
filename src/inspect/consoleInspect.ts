import consolePrint from "../core/consolePrint";
import inspectAny from "./inspectors/inspectAny";
import consoleApply from "../core/consoleApply";
import ConsoleSpan from "../core/ConsoleSpan";
import defaultLineLength from "../utils/defaultLineLength";

export interface ConsoleInspectOptions {
    line?: boolean;
    indent?: number;
    print?: boolean;
    depth?: number;
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
                depth: 2,
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
