export interface ConsoleFlush {
    type: "flush";
}

export function consoleFlush(): ConsoleFlush {
    return { type: "flush" };
}
