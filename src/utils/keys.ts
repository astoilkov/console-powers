export default function keys(
    value: object | Iterable<unknown>,
    include: Set<string>,
): string[] {
    const keys = Object.keys(value);

    if (include.size > 0) {
        const result = [];
        for (const key of keys) {
            if (include.has(key)) {
                result.push(key);
            }
        }
        return result.length === 0 ? keys : result;
    }

    return keys;
}
