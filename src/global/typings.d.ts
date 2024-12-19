import type { InspectInspect } from "../inspect/ii";
import type { TableTable } from "../inspect/tt";

declare global {
    const ii: InspectInspect;
    const tt: TableTable;
}