import ConsoleSpan from "./ConsoleSpan";
import consoleCalls from "./consoleCalls";

export default function consolePrint(
    ...args: (ConsoleSpan | ConsoleSpan[] | ConsoleSpan[][])[]
): void {
    const calls = consoleCalls(...args);
    for (const call of calls) {
        console[call.method](call.text, ...call.rest);
    }
}
