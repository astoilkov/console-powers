import ConsoleSpan from "./ConsoleSpan";
import ConsoleStyle from "./ConsoleStyle";
import { ConsoleText, consoleText } from "./consoleText";
import toFlatSpans from "../utils/toFlatSpans";

export default function consoleApply<T extends ConsoleSpan>(
    spans: T | T[] | T[][],
    style: ConsoleStyle,
): T[] {
    return toFlatSpans(spans).map((span) => {
        return typeof span === "string"
            ? consoleText(span, style)
            : span.type === "text"
              ? {
                    ...(span as ConsoleText),
                    style: {
                        ...span.style,
                        ...style,
                    },
                }
              : span;
    }) as T[];
}
