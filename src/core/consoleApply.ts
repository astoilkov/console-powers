import ConsoleSpan from "./ConsoleSpan";
import ConsoleStyle from "./ConsoleStyle";

export default function consoleApply<T extends ConsoleSpan>(
    messages: T[],
    style: ConsoleStyle,
): T[] {
    return messages.map((message) => {
        return message.type === "text"
            ? {
                  ...message,
                  style: {
                      ...message.style,
                      ...style,
                  },
              }
            : message;
    });
}
