import { consoleText, ConsoleText } from "../core/consoleText";
import ensureConsoleText from "../utils/ensureConsoleText";

export default function consoleUnorderedList(
    spans: (string | ConsoleText)[],
): ConsoleText[] {
    return spans.flatMap((span, index) => {
        const line = [
            //
            consoleText(`${index + 1}. `),
            ensureConsoleText(span),
        ];
        return index === 0 ? line : [consoleText("\n"), ...line];
    });
}
