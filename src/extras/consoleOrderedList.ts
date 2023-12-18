import { consoleText, ConsoleText } from "../core/consoleText";
import ensureConsoleText from "../utils/ensureConsoleText";

export default function consoleOrderedList(
    items: (string | ConsoleText)[],
): ConsoleText[] {
    return items.flatMap((item, index) => {
        const line = [
            //
            consoleText(`${index + 1}. `),
            ensureConsoleText(item),
        ];
        return index === 0 ? line : [consoleText("\n"), ...line];
    });
}
