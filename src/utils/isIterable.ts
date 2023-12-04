export default function isIterable<T>(value: unknown): value is Iterable<T> {
    return (
        value !== null &&
        typeof value === "object" &&
        typeof (value as any)[Symbol.iterator] === "function"
    );
}
