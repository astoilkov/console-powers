import ensureConsoleText from "../utils/ensureConsoleText";
import { consoleText, ConsoleText } from "../core/consoleText";

export default function consoleQuote(
    text: string | ConsoleText,
    author?: string | ConsoleText,
): ConsoleText[] {
    const quoteLine = consoleText(
        " ",
        "border-left: 4px solid #E9E9E9;font-size:1.1em;line-height:24px;",
    );
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
