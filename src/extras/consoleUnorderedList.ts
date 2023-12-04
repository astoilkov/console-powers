import { consoleText, ConsoleText } from "../core/consoleText";
import ensureConsoleText from "../utils/ensureConsoleText";

export default function consoleUnorderedList(
    items: (string | ConsoleText)[],
): ConsoleText[] {
    return items.flatMap((item, index) => {
        const line = [
            //
            consoleText("• "),
            ensureConsoleText(item),
        ];
        return index === 0 ? line : [consoleText("\n"), ...line];
    });
}
