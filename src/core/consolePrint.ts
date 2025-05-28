import ConsoleSpan from "./ConsoleSpan";
import consoleCalls from "./consoleCalls";
import builtInConsole from "../utils/builtInConsole";

export default function consolePrint(
    ...args: (ConsoleSpan | ConsoleSpan[] | ConsoleSpan[][])[]
): void {
    const calls = consoleCalls(...args);
    for (const call of calls) {
        builtInConsole[call.method](call.text, ...call.rest);
    }
}
