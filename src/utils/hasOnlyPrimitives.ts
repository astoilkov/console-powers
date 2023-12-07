import isPrimitive from "./isPrimitive";

export default function hasOnlyPrimitives(value: unknown): boolean {
    if (Array.isArray(value)) {
        return value.every(isPrimitive);
    }
    if (typeof value === "object" && value !== null) {
        return Object.values(value).every(isPrimitive);
    }
    return false;
}
