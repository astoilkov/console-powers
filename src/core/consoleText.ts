import { ConsoleStyle } from "./ConsoleStyle";

export interface ConsoleText {
    type: "text";
    text: string;
    style: Partial<ConsoleStyle>;
}

export function consoleText(
    text: string,
    style?: Partial<ConsoleStyle>,
): ConsoleText {
    return {
        type: "text",
        text,
        style: style ?? {},
    };
}
