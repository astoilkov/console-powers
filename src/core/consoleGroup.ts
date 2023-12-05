import arrayArg from "../utils/arrayArg";
import ConsoleMessage from "./ConsoleMessage";
import { consoleText, ConsoleText } from "./consoleText";
import ensureConsoleText from "../utils/ensureConsoleText";

export interface ConsoleGroup {
    type: "group";
    expanded: boolean;
    header: ConsoleText[];
    body: ConsoleMessage[];
}

export function consoleGroup({
    expanded,
    header,
    body,
}: {
    expanded?: boolean;
    header?: string | ConsoleText | (string | ConsoleText)[];
    body?: (ConsoleMessage | string)[] | string;
} = {}): ConsoleGroup {
    return {
        type: "group",
        expanded: expanded ?? false,
        header:
            arrayArg(header).map((message) => {
                const consoleText = ensureConsoleText(message);
                return {
                    ...consoleText,
                    style: {
                        fontWeight: "normal",
                        ...consoleText.style,
                    },
                };
            }) ?? [],
        body: arrayArg(body).map((message) =>
            typeof message === "string" ? consoleText(message) : message,
        ),
    };
}
