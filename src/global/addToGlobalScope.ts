import iiFn from "../inspect/ii";
import ttFn, { type TableTable } from "../inspect/tt";
import type { InspectInspect } from "../inspect/ii";

declare global {
    const ii: InspectInspect;
    const tt: TableTable;
}

export default function addToGlobalScope(): void {
    (global as any).ii = iiFn;
    (global as any).tt = ttFn;
}
