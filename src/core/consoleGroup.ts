import { ConsoleText } from "./consoleText";
import ConsoleMessage from "./ConsoleMessage";

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
    header?: ConsoleText[];
    body?: ConsoleMessage[];
} = {}): ConsoleGroup {
    return {
        type: "group",
        expanded: expanded ?? false,
        header:
            header?.map((message) => ({
                ...message,
                style: `font-weight:normal;${message.style}`,
            })) ?? [],
        body: body ?? [],
    };
}
