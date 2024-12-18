export default function addNoopToGlobalScope(): void {
    const ii = <T>(value: T) => value;
    ii.defaults = {};
    ii.depth = () => ii;
    ii.d = ii.depth;
    ii.keys = () => ii;
    ii.k = ii.keys;
    (global as any).ii = ii;

    const tt = <T>(value: T) => value;
    tt.defaults = {};
    (global as any).tt = tt;
}
