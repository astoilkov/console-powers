import ConsoleSpan from "./ConsoleSpan";
import ConsoleStyle from "./ConsoleStyle";

export default function consoleApply<T extends ConsoleSpan>(
    spans: T[],
    style: ConsoleStyle,
): T[] {
    return spans.map((span) => {
        return span.type === "text"
            ? {
                  ...span,
                  style: {
                      ...span.style,
                      ...style,
                  },
              }
            : span;
    });
}
