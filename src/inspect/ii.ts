import consolePrint from "../core/consolePrint";
import type ConsoleSpan from "../core/ConsoleSpan";
import { consoleText } from "../core/consoleText";
import consoleInspect, { type ConsoleInspectOptions } from "./consoleInspect";

const ii = createInspectInspect({});

export default ii;

export interface InspectInspect {
    <T>(value: T, ...args: unknown[]): T;
    defaults: ConsoleInspectOptions;
    depth: (depth: number) => InspectInspect;
    d: (depth: number) => InspectInspect;
    keys: (...keys: string[]) => InspectInspect;
    k: (...keys: string[]) => InspectInspect;
}

function createInspectInspect(options: ConsoleInspectOptions): InspectInspect {
    const fn = (...args: unknown[]) => {
        return inspectInspect(options, ...args);
    };
    fn.defaults = options;
    fn.depth = (depth: number) => createInspectInspect({ ...options, depth });
    fn.d = fn.depth;
    fn.keys = (...keys: string[]) => createInspectInspect({ ...options, keys });
    fn.k = fn.keys;
    return fn as InspectInspect;
}

function inspectInspect<T>(
    options: ConsoleInspectOptions,
    value: T,
    ...args: unknown[]
): T;
function inspectInspect(
    options: ConsoleInspectOptions,
    ...args: unknown[]
): unknown;
function inspectInspect(
    options: ConsoleInspectOptions,
    ...args: unknown[]
): unknown {
    if (args.length === 0) {
        return undefined;
    }

    const hasPromise = args.some((arg) => arg instanceof Promise);
    if (hasPromise) {
        Promise.all(args).then((values) => {
            return inspectInspect(options, ...values);
        });
    } else {
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
                        ...options,
                        print: false,
                    }),
                );
            }
            consolePrint(spans);
        } else {
            console.log(...args);
        }
    }

    return args[0];
}

function hasWebContext(): boolean {
    return typeof window !== "undefined";
}
