import { ConsoleText } from "../core/consoleText";
import { ConsoleObject } from "../core/consoleObject";

export default function spansLength(
    spans: (ConsoleText | ConsoleObject)[],
): number {
    let charsCount = 0;
    for (const span of spans) {
        if (span.type === "text") {
            charsCount += span.text.length;
        } else {
            charsCount += Object.keys(span.object).length * 8;
        }
    }
    return charsCount;
}
