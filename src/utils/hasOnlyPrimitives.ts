import isPrimitive from "./isPrimitive";
import { Primitive } from "type-fest";

export default function hasOnlyPrimitives(
    iterable: object,
): iterable is Record<string | number | symbol, Primitive>;
export default function hasOnlyPrimitives(
    iterable: Iterable<unknown>,
): iterable is Iterable<Primitive>;
export default function hasOnlyPrimitives(
    array: unknown[],
): array is Primitive[];
export default function hasOnlyPrimitives(
    value: unknown[] | Iterable<unknown>,
): value is Primitive[] | Iterable<Primitive>;
export default function hasOnlyPrimitives(value: unknown): boolean;
export default function hasOnlyPrimitives(value: unknown): boolean {
    if (Array.isArray(value)) {
        return value.every(isPrimitive);
    }
    if (typeof value === "object" && value !== null) {
        return Object.values(value).every(isPrimitive);
    }
    return false;
}
