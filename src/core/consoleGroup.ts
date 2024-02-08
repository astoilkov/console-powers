import toFlatSpans from "../utils/toFlatSpans";
import ConsoleSpan from "./ConsoleSpan";
import { ConsoleText } from "./consoleText";
import consoleApply from "./consoleApply";
import { ConsoleObject } from "./consoleObject";

export interface ConsoleGroup {
    type: "group";
    expanded: boolean;
    header: (ConsoleText | ConsoleObject | string)[];
    body: ConsoleSpan[];
}

export function consoleGroup({
    expanded,
    header,
    body,
}: {
    expanded?: boolean;
    header?: ConsoleText | string | (ConsoleText | ConsoleObject | string)[];
    body?: ConsoleSpan | ConsoleSpan[];
} = {}): ConsoleGroup {
    return {
        type: "group",
        expanded: expanded ?? false,
        header: consoleApply(toFlatSpans(header), {
            fontWeight: "normal",
        }),
        body: toFlatSpans(body),
    };
}
