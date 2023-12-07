import consolePrint from "../core/consolePrint";
import inspectAny from "./inspectors/inspectAny";

export interface InspectionContext {
    left: number;
    depth: number;
}

export interface InspectionOptions {
    expandDepth?: number;
}

// export type ConsoleInspectOptions = {
//   preferMultiLine?: boolean
//   preferSingleLine?: boolean
//   preferTables?: boolean
//   preferExpanded?: boolean / preferCollapsed?: boolean
//   expandedDepth?: number
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
        inspectAny(
            value,
            {
                expandDepth: Number.MAX_SAFE_INTEGER,
                ...options,
            },
            {
                depth: 0,
                left: 0,
            },
        ),
    );
}
