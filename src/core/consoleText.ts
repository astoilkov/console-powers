import ConsoleStyle from "./ConsoleStyle";

export interface ConsoleText {
    type: "text";
    text: string;
    style: ConsoleStyle;
}

export function consoleText(text: string, style?: ConsoleStyle): ConsoleText {
    return {
        type: "text",
        text,
        style: style ?? {},
    };
}
