import { ConsoleSpan } from "../../index";

export default function toFlatSpans<T extends ConsoleSpan>(
    ...args: (T | T[] | T[][] | undefined | null)[]
): T[] {
    return args.flatMap((arg) => {
        return arg === undefined || arg === null
            ? []
            : Array.isArray(arg)
              ? (arg.flat(Infinity) as T[])
              : [arg];
    });
}
