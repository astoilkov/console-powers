import arrayArg from "../utils/arrayArg";
import ConsoleSpan from "./ConsoleSpan";
import { consoleText, ConsoleText } from "./consoleText";
import ensureConsoleText from "../utils/ensureConsoleText";

export interface ConsoleGroup {
    type: "group";
    expanded: boolean;
    header: ConsoleText[];
    body: ConsoleSpan[];
}

export function consoleGroup({
    expanded,
    header,
    body,
}: {
    expanded?: boolean;
    header?: string | ConsoleText | (string | ConsoleText)[];
    body?: (ConsoleSpan | string)[] | string;
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
