export default function arrayArg<T>(value: T | T[] | undefined | null): T[] {
    return value === undefined || value === null
        ? []
        : Array.isArray(value)
          ? value
          : [value];
}
