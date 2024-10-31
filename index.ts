// core
export { default as consolePrint } from "./src/core/consolePrint";
export { consoleText } from "./src/core/consoleText";
export { consoleObject } from "./src/core/consoleObject";
export { consoleFlush } from "./src/core/consoleFlush";
export { consoleGroup } from "./src/core/consoleGroup";
export { default as consoleCalls } from "./src/core/consoleCalls";
export type { default as ConsoleSpan } from "./src/core/ConsoleSpan";
export type { ConsoleText } from "./src/core/consoleText";
export type { ConsoleObject } from "./src/core/consoleObject";
export type { ConsoleGroup } from "./src/core/consoleGroup";

// inspect
export { default as consoleInspect } from "./src/inspect/consoleInspect";
export type { ConsoleInspectOptions } from "./src/inspect/consoleInspect";

// extras
export { default as consoleTable } from "./src/extras/consoleTable";
export { default as consoleOrderedList } from "./src/extras/consoleOrderedList";
export { default as consoleUnorderedList } from "./src/extras/consoleUnorderedList";
