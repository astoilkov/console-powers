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
            arrayArg(header).map((span) => {
                const consoleText = ensureConsoleText(span);
                return {
                    ...consoleText,
                    style: {
                        fontWeight: "normal",
                        ...consoleText.style,
                    },
                };
            }) ?? [],
        body: arrayArg(body).map((span) =>
            typeof span === "string" ? consoleText(span) : span,
        ),
    };
}
