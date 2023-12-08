import consolePrint from "../core/consolePrint";
import inspectAny from "./inspectors/inspectAny";
import consoleApply from "../core/consoleApply";

export interface InspectionContext {
    indent: number;
    depth: number;
}

export interface InspectionOptions {
    line?: boolean;
    indent?: number;
    expandDepth?: number;
}

// export type ConsoleInspectOptions = {
//   preferMultiLine?: boolean
//   preferSingleLine?: boolean
//   preferTables?: boolean
//   preferExpanded?: boolean / preferCollapsed?: boolean
//   expandDepth?: number
// }

// - when it's an iterable, iterate over it
// - name ideas:
//   - inspect
//   - prettyLog
//   - fullLog
export default function consoleInspect(
    value: unknown,
    options?: InspectionOptions,
): void {
    consolePrint(
        consoleApply(
            inspectAny(
                value,
                {
                    expandDepth: 2,
                    indent: 4,
                    line: false,
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
        ),
    );
}
