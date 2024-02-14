import { ConsoleText } from "../../core/consoleText";
import { ConsoleObject } from "../../core/consoleObject";

export default interface ConsoleInspection {
    type: "inline" | "block";
    spans: (ConsoleText | ConsoleObject)[];
}
