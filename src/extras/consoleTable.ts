import { ConsoleText } from "../core/consoleText";
import hasOnlyPrimitives from "../utils/hasOnlyPrimitives";
import consolePrint from "../core/consolePrint";
import arrayOfObjectsTable from "./consoleTable/arrayOfObjectsTable";
import flatObjectOrArrayTable from "./consoleTable/flatObjectOrArrayTable";

export type ConsoleTableOptions = {
    print?: boolean;
    theme?: "light" | "dark";
    wrap?: "auto" | number;
};

export default function consoleTable(
    object: object,
    options: ConsoleTableOptions = {},
): ConsoleText[] {
    const isArrayOfObjects =
        Array.isArray(object) && !hasOnlyPrimitives(object);
    const optionsRequired = {
        print: true,
        wrap: "auto",
        theme: matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
        ...options,
    } satisfies ConsoleTableOptions;

    const spans = isArrayOfObjects
        ? arrayOfObjectsTable(object, optionsRequired)
        : flatObjectOrArrayTable(object, optionsRequired);

    if (options.print !== false) {
        consolePrint(spans);
    }

    return spans;
}
