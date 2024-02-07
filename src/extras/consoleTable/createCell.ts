import { ConsoleText } from "../../core/consoleText";

export interface ConsoleTableCell {
    spans: ConsoleText[];
}

export default function createCell(
    spans: ConsoleText | ConsoleText[],
): ConsoleTableCell {
    return { spans: Array.isArray(spans) ? spans : [spans] };
}
