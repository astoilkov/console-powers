import consolePrint from "../core/consolePrint";
import valueMessages from "./inspectors/valueMessages";

// export type ConsoleInspectOptions = {
//   preferMultiLine?: boolean
//   preferSingleLine?: boolean
//   preferTables?: boolean
//   preferExpanded?: boolean / preferCollapsed?: boolean
// }

// - when it's an iterable, iterate over it
// - name ideas:
//   - inspect
//   - prettyLog
//   - fullLog
export default function consoleInspect(value: unknown): void {
    consolePrint(valueMessages(value));
}
