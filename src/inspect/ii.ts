import consolePrint from "../core/consolePrint";
import type ConsoleSpan from "../core/ConsoleSpan";
import { consoleText } from "../core/consoleText";
import consoleInspect from "./consoleInspect";

export default function ii<T>(value: T, ...args: unknown[]): T;
export default function ii(...args: unknown[]): unknown {
    if (args.length === 0) {
        return undefined;
    }

    if (hasWebContext()) {
        const spans: ConsoleSpan[] = [];
        let first = true;
        for (const value of args) {
            if (!first) {
                first = false;
                spans.push(consoleText(" "));
            }
            spans.push(
                ...consoleInspect(value, {
                    print: false,
                }),
            );
        }
        consolePrint(spans);
    } else {
        console.log(...args);
    }

    return args[0];
}

function hasWebContext(): boolean {
    return typeof window !== "undefined";
}
