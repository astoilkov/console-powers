export interface ConsoleObject {
    type: "object";
    object: object;
}

export function consoleObject(object: object): ConsoleObject {
    return { type: "object", object };
}
