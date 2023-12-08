import { consoleText, ConsoleText } from "../../core/consoleText";
import consoleStyles from "./consoleStyles";
import { ConsoleInspectContext, ConsoleInspectOptions } from "../consoleInspect";

const LINE_AT_FIRST_LEVEL = false;

export default function createIndent(
    context: ConsoleInspectContext,
    options: Required<ConsoleInspectOptions>,
): ConsoleText[] {
    if (!options.line) {
        return [consoleText(" ".repeat(context.indent))];
    }

    if (LINE_AT_FIRST_LEVEL) {
        const messages: ConsoleText[] = [];
        for (let i = 0; i <= context.indent; i += options.indent) {
            if (i !== 0) {
                messages.push(consoleText(" ".repeat(options.indent - 1)));
            }
            messages.push(
                consoleText(" ", {
                    marginLeft: "0.2em",
                    borderLeft: `1.85px solid ${consoleStyles.expandedKey.color}`,
                }),
            );
        }
        return messages;
    } else {
        if (context.indent === 0) {
            return [];
        }

        const messages: ConsoleText[] = [];
        for (let i = options.indent; i <= context.indent; i += options.indent) {
            messages.push(consoleText(" ".repeat(options.indent - 1)));
            messages.push(
                consoleText(" ", {
                    marginLeft: "0.22em",
                    borderLeft: `1.85px solid ${consoleStyles.expandedKey.color}`,
                }),
            );
        }
        return messages;
    }
}
