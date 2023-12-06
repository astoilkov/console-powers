import ensureConsoleText from "../utils/ensureConsoleText";
import { consoleText, ConsoleText } from "../core/consoleText";

export default function consoleQuote(
    text: string | ConsoleText,
    author?: string | ConsoleText,
): ConsoleText[] {
    const quoteLine = consoleText(" ", {
        fontSize: "1.1em",
        lineHeight: "24px",
        borderLeft: "4px solid #E9E9E9",
    });
    const line1 = [
        quoteLine,
        consoleText("“"),
        ensureConsoleText(text),
        consoleText("”"),
    ];
    return author === undefined
        ? //
          line1
        : [
              ...line1,
              consoleText("\n"),
              quoteLine,
              consoleText(`— `),
              ensureConsoleText(author),
          ];
}
