import consolePrint from "../core/consolePrint";
import inspectAny from "./inspectors/inspectAny";
import consoleApply from "../core/consoleApply";
import ConsoleSpan from "../core/ConsoleSpan";
import guessAvailableLength from "../utils/guessAvailableLength";

export interface ConsoleInspectOptions {
    line?: boolean;
    indent?: number;
    print?: boolean;
    depth?: number;
    theme?: "light" | "dark";
    wrap?: "auto" | "single-line" | "multi-line" | 100;
    // preferMultiLine?: boolean;
    // preferSingleLine?: boolean;
    // preferTables?: boolean;
}

export interface ConsoleInspectContext {
    indent: number;
    depth: number;
    wrap: number;
}

export default function consoleInspect(
    value: unknown,
    options?: ConsoleInspectOptions,
): ConsoleSpan[] {
    const requiredOptions: Required<ConsoleInspectOptions> = {
        depth: 2,
        indent: 4,
        line: false,
        wrap: "auto",
        theme: matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
        print: true,
        ...options,
    };
    const spans = consoleApply(
        inspectAny(value, requiredOptions, {
            depth: 0,
            indent: 0,
            wrap:
                requiredOptions.wrap === "auto"
                    ? guessAvailableLength()
                    : requiredOptions.wrap === "single-line"
                      ? Number.MAX_SAFE_INTEGER
                      : requiredOptions.wrap === "multi-line"
                        ? 0
                        : requiredOptions.wrap,
        }),
        {
            lineHeight: "1.6",
        },
    );

    if (options?.print !== false) {
        consolePrint(spans);
    }

    return spans;
}
