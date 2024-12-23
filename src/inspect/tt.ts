import consolePrint from "../core/consolePrint";
import type ConsoleSpan from "../core/ConsoleSpan";
import { consoleText } from "../core/consoleText";
import type { ConsoleTableOptions } from "../extras/consoleTable";
import consoleTable from "../extras/consoleTable";
import isPrimitive from "../utils/isPrimitive";

const tt = createTableTable({});

export default tt;

export interface TableTable {
    <T>(value: T, ...args: unknown[]): T;
    defaults: ConsoleTableOptions;
    pre: ((value: unknown) => unknown) | undefined;
}

function createTableTable(options: ConsoleTableOptions): TableTable {
    const fn = (...args: unknown[]) => {
        return tableTable(fn, ...args);
    };
    fn.defaults = options;
    fn.pre = undefined;
    return fn as TableTable;
}

function tableTable<T>(self: TableTable, value: T, ...args: unknown[]): T;
function tableTable(self: TableTable, ...args: unknown[]): unknown;
function tableTable(self: TableTable, ...args: unknown[]): unknown {
    if (args.length === 0) {
        return undefined;
    }

    const hasPromise = args.some((arg) => arg instanceof Promise);
    if (hasPromise) {
        Promise.all(args).then((values) => {
            return tableTable(self, ...values);
        });
    } else {
        if (hasWebContext()) {
            const spans: ConsoleSpan[] = [];
            let first = true;
            for (const arg of args) {
                if (!first) {
                    spans.push(consoleText("\n\n"));
                }
                first = false;
                const value = self.pre === undefined ? arg : self.pre(arg);
                spans.push(
                    ...consoleTable(
                        isPrimitive(value) ? [value] : (value as {}),
                        {
                            ...self.defaults,
                            print: false,
                        },
                    ),
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
