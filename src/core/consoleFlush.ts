export interface ConsoleFlush {
    type: "flush";
}

export function consoleDivider(): ConsoleFlush {
    return { type: "flush" };
}
