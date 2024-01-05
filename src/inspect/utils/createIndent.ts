import { consoleText, ConsoleText } from "../../core/consoleText";
import consoleStyles from "./consoleStyles";
import {
    ConsoleInspectContext,
    ConsoleInspectOptions,
} from "../consoleInspect";

const LINE_AT_FIRST_LEVEL = true;

export default function createIndent(
    context: ConsoleInspectContext,
    options: Required<ConsoleInspectOptions>,
): ConsoleText[] {
    if (!options.line) {
        return [consoleText(" ".repeat(context.indent))];
    }

    if (LINE_AT_FIRST_LEVEL) {
        const spans: ConsoleText[] = [];
        for (let i = 0; i <= context.indent; i += options.indent) {
            if (i !== 0) {
                spans.push(consoleText(" ".repeat(options.indent - 1)));
            }
            spans.push(
                consoleText("\u200C", {
                    marginLeft: "0.22em",
                    paddingLeft: `1.85px`,
                    background: consoleStyles[options.theme].highlight.color,
                }),
            );
            spans.push(consoleText(" "));
        }
        return spans;
    } else {
        if (context.indent === 0) {
            return [];
        }

        const spans: ConsoleText[] = [];
        for (let i = options.indent; i <= context.indent; i += options.indent) {
            spans.push(consoleText(" ".repeat(options.indent - 1)));
            spans.push(
                consoleText(" ", {
                    marginLeft: "0.22em",
                    borderLeft: `1.85px solid ${
                        consoleStyles[options.theme].highlight.color
                    }`,
                }),
            );
        }
        return spans;
    }
}
