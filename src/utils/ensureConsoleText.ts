import { ConsoleText, consoleText } from "../core/consoleText";

export default function ensureConsoleText(
    text: ConsoleText | string,
): ConsoleText {
    return typeof text === "string" ? consoleText(text) : text;
}
