import { consoleText } from "../../core/consoleText";
import ConsoleMessage from "../../core/ConsoleMessage";
import valueMessages from "./valueMessages";
import consoleStyles from "../consoleStyles";

export default function objectMessages(value: object): ConsoleMessage[] {
    const messages: ConsoleMessage[] = [consoleText("{ ")];

    let isFirst = true;
    for (const key in value) {
        if (value.hasOwnProperty(key)) {
            if (isFirst) {
                isFirst = false;
            } else {
                messages.push(consoleText(", "));
            }
            messages.push(consoleText(key, consoleStyles.collapsedObjectKey));
            messages.push(consoleText(": "));
            messages.push(...valueMessages(value[key as keyof typeof value]));
        }
    }

    messages.push(consoleText(" }"));

    return messages;
}
