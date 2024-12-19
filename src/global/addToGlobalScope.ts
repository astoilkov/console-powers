import iiFn from "../inspect/ii";
import ttFn from "../inspect/tt";

export default function addToGlobalScope(): void {
    (global as any).ii = iiFn;
    (global as any).tt = ttFn;
}
