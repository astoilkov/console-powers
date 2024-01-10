import { ConsoleText } from "../core/consoleText";

export default function spansLength(spans: ConsoleText[]): number {
    let charsCount = 0;
    for (const span of spans) {
        charsCount += span.text.length;
    }
    return charsCount;
}
