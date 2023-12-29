import { ConsoleText } from "./consoleText";
import { ConsoleObject } from "./consoleObject";
import { ConsoleFlush } from "./consoleFlush";
import { ConsoleGroup } from "./consoleGroup";

type ConsoleSpan =
    | string
    | ConsoleText
    | ConsoleObject
    | ConsoleGroup
    | ConsoleFlush;

export default ConsoleSpan;
