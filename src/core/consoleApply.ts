import ConsoleMessage from "./ConsoleMessage";
import ConsoleStyle from "./ConsoleStyle";

export default function consoleApply<T extends ConsoleMessage>(
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
