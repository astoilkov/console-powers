import { consoleText } from "../core/consoleText";
import ConsoleSpan from "../core/ConsoleSpan";

// assumes new lines are exactly `{ type: 'text', text: '\n' }` and not
// something like `{ type: 'text', text: '\n\n' }`
// or `{ type: 'text', text: 'end of line \n start of new' }`
export default function indent<T extends ConsoleSpan>(
    spans: T[],
    indent: number,
): T[] {
    const newSpans: ConsoleSpan[] = [consoleText(" ".repeat(indent))];
    for (let i = 0; i < spans.length; i++) {
        const span = spans[i]!;
        newSpans.push(span);
        if (
            typeof span !== "string" &&
            span.type === "text" &&
            span.text === "\n"
        ) {
            newSpans.push(consoleText(" ".repeat(indent)));
        }
    }
    return newSpans as T[];
}
