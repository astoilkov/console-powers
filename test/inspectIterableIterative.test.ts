import { describe, test, expect } from "vitest";
import { inspectIterableIterative } from "../src/inspect/iterative/inspectIterableIterative";
import { ConsoleInspectContext } from "../src/inspect/consoleInspect";
import { InspectionQueue } from "../src/inspect/iterative/InspectionQueue";
import ConsoleInspection from "../src/inspect/utils/ConsoleInspection";

describe("inspectIterableIterative - depth limiting", () => {
    const defaultOptions = {
        depth: 2,
        indent: 2,
        wrap: "auto" as const,
        keys: undefined,
        theme: "dark" as const,
        print: false,
    };

    test("returns consoleObject when depth limit is reached", () => {
        return new Promise<void>((resolve) => {
            const array = [1, 2, 3];
            const context: ConsoleInspectContext = {
                depth: 2, // At the depth limit
                wrap: 80,
                keys: new Set<string>(),
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();

            inspectIterableIterative(
                array,
                defaultOptions,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    expect(inspection.spans).toHaveLength(1);
                    expect(inspection.spans[0]).toHaveProperty("type", "object");
                    expect(inspection.spans[0]).toHaveProperty("object", array);
                    resolve();
                }
            );
        });
    });

    test("returns consoleObject when depth exceeds limit", () => {
        return new Promise<void>((resolve) => {
            const array = [1, 2, 3];
            const context: ConsoleInspectContext = {
                depth: 3, // Exceeds the depth limit of 2
                wrap: 80,
                keys: new Set<string>(),
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();

            inspectIterableIterative(
                array,
                defaultOptions,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    expect(inspection.spans).toHaveLength(1);
                    expect(inspection.spans[0]).toHaveProperty("type", "object");
                    expect(inspection.spans[0]).toHaveProperty("object", array);
                    resolve();
                }
            );
        });
    });

    test("inspects array normally when depth is below limit", () => {
        return new Promise<void>((resolve) => {
            const array = [1, 2, 3];
            const context: ConsoleInspectContext = {
                depth: 0, // Well below the depth limit
                wrap: 80,
                keys: new Set<string>(),
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();

            inspectIterableIterative(
                array,
                defaultOptions,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    // Should have more than just a consoleObject
                    expect(inspection.spans.length).toBeGreaterThan(1);
                    // Should not be a consoleObject
                    expect(inspection.spans[0]).not.toHaveProperty("type", "object");
                    resolve();
                }
            );

            // Process the queue to complete the inspection
            while (!queue.isEmpty()) {
                const task = queue.dequeue();
                if (task) {
                    // For primitives, complete immediately
                    task.onComplete({
                        type: "inline",
                        spans: [{ type: "text" as const, text: String(task.value) }],
                    });
                }
            }
        });
    });

    test("returns consoleObject for Set when depth limit is reached", () => {
        return new Promise<void>((resolve) => {
            const set = new Set([1, 2, 3]);
            const context: ConsoleInspectContext = {
                depth: 2, // At the depth limit
                wrap: 80,
                keys: new Set<string>(),
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();

            inspectIterableIterative(
                set,
                defaultOptions,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    expect(inspection.spans).toHaveLength(1);
                    expect(inspection.spans[0]).toHaveProperty("type", "object");
                    expect(inspection.spans[0]).toHaveProperty("object", set);
                    resolve();
                }
            );
        });
    });

    test("returns consoleObject for Map when depth limit is reached", () => {
        return new Promise<void>((resolve) => {
            const map = new Map([["a", 1], ["b", 2]]);
            const context: ConsoleInspectContext = {
                depth: 2, // At the depth limit
                wrap: 80,
                keys: new Set<string>(),
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();

            inspectIterableIterative(
                map,
                defaultOptions,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    expect(inspection.spans).toHaveLength(1);
                    expect(inspection.spans[0]).toHaveProperty("type", "object");
                    expect(inspection.spans[0]).toHaveProperty("object", map);
                    resolve();
                }
            );
        });
    });

    test("respects depth limit with nested arrays", () => {
        return new Promise<void>((resolve) => {
            const nestedArray = [[1, 2], [3, 4]];
            const context: ConsoleInspectContext = {
                depth: 1, // One level below limit
                wrap: 80,
                keys: new Set<string>(),
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();
            const optionsWithDepth2 = { ...defaultOptions, depth: 2 };

            inspectIterableIterative(
                nestedArray,
                optionsWithDepth2,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    // The outer array should be inspected (may be block or inline depending on content)
                    expect(inspection.type).toBeTruthy();
                    expect(inspection.spans.length).toBeGreaterThan(0);
                    resolve();
                }
            );

            // Process the queue - child arrays should hit depth limit
            while (!queue.isEmpty()) {
                const task = queue.dequeue();
                if (task) {
                    // Child arrays at depth 2 should return consoleObject
                    if (task.context.depth >= optionsWithDepth2.depth) {
                        task.onComplete({
                            type: "inline",
                            spans: [{ type: "object" as const, object: task.value as object }],
                        });
                    } else {
                        task.onComplete({
                            type: "inline",
                            spans: [{ type: "text" as const, text: String(task.value) }],
                        });
                    }
                }
            }
        });
    });

    test("depth limit applies to empty arrays", () => {
        return new Promise<void>((resolve) => {
            const array: unknown[] = [];
            const context: ConsoleInspectContext = {
                depth: 2, // At the depth limit
                wrap: 80,
                keys: new Set<string>(),
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();

            inspectIterableIterative(
                array,
                defaultOptions,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    expect(inspection.spans).toHaveLength(1);
                    expect(inspection.spans[0]).toHaveProperty("type", "object");
                    expect(inspection.spans[0]).toHaveProperty("object", array);
                    resolve();
                }
            );
        });
    });

    test("depth limit applies regardless of wrap mode", () => {
        return new Promise<void>((resolve) => {
            const array = [1, 2, 3];
            const context: ConsoleInspectContext = {
                depth: 2, // At the depth limit
                wrap: 80,
                keys: new Set<string>(),
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();
            const optionsMultiLine = { ...defaultOptions, wrap: "multi-line" as const };

            inspectIterableIterative(
                array,
                optionsMultiLine,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    expect(inspection.spans).toHaveLength(1);
                    expect(inspection.spans[0]).toHaveProperty("type", "object");
                    expect(inspection.spans[0]).toHaveProperty("object", array);
                    resolve();
                }
            );
        });
    });
});

describe("inspectIterableIterative - basic functionality", () => {
    const defaultOptions = {
        depth: 3,
        indent: 2,
        wrap: "auto" as const,
        keys: undefined,
        theme: "dark" as const,
        print: false,
    };

    const defaultContext: ConsoleInspectContext = {
        depth: 0,
        wrap: 80,
        keys: new Set<string>(),
        circular: new Set<unknown>(),
    };

    test("handles empty array", () => {
        return new Promise<void>((resolve) => {
            const array: unknown[] = [];
            const queue = new InspectionQueue();

            inspectIterableIterative(
                array,
                defaultOptions,
                defaultContext,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    expect(inspection.spans.length).toBeGreaterThan(0);
                    // Should have brackets and length indicator
                    const text = inspection.spans.map(s => 'text' in s ? s.text : '').join('');
                    expect(text).toContain('[');
                    expect(text).toContain(']');
                    expect(text).toContain('(0)');
                    resolve();
                }
            );
        });
    });

    test("handles empty Set", () => {
        return new Promise<void>((resolve) => {
            const set = new Set();
            const queue = new InspectionQueue();

            inspectIterableIterative(
                set,
                defaultOptions,
                defaultContext,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    expect(inspection.spans.length).toBeGreaterThan(0);
                    const text = inspection.spans.map(s => 'text' in s ? s.text : '').join('');
                    expect(text).toContain('Set');
                    expect(text).toContain('(0)');
                    resolve();
                }
            );
        });
    });

    test("handles empty Map", () => {
        return new Promise<void>((resolve) => {
            const map = new Map();
            const queue = new InspectionQueue();

            inspectIterableIterative(
                map,
                defaultOptions,
                defaultContext,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    expect(inspection.spans.length).toBeGreaterThan(0);
                    const text = inspection.spans.map(s => 'text' in s ? s.text : '').join('');
                    expect(text).toContain('Map');
                    expect(text).toContain('(0)');
                    resolve();
                }
            );
        });
    });
});


describe("inspectIterableIterative - array extra keys", () => {
    const defaultOptions = {
        depth: 3,
        indent: 2,
        wrap: "auto" as const,
        keys: undefined,
        theme: "dark" as const,
        print: false,
    };

    const defaultContext: ConsoleInspectContext = {
        depth: 0,
        wrap: 80,
        keys: new Set<string>(),
        circular: new Set<unknown>(),
    };

    test("handles array with extra keys in single-line format", () => {
        return new Promise<void>((resolve) => {
            const arr: any = [1, 2, 3];
            arr.customProp = "value";
            arr.anotherProp = 42;
            
            const queue = new InspectionQueue();
            const optionsSingleLine = { ...defaultOptions, wrap: "single-line" as const };

            inspectIterableIterative(
                arr,
                optionsSingleLine,
                defaultContext,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    
                    // Convert spans to text to verify content
                    const text = inspection.spans
                        .map(s => 'text' in s ? s.text : '')
                        .join('');
                    
                    // Should include array elements
                    expect(text).toContain("1");
                    expect(text).toContain("2");
                    expect(text).toContain("3");
                    
                    // Should include extra keys
                    expect(text).toContain("customProp");
                    expect(text).toContain("anotherProp");
                    
                    resolve();
                }
            );

            // Process the queue to complete the inspection
            while (!queue.isEmpty()) {
                const task = queue.dequeue();
                if (task) {
                    // For primitives, complete immediately with simple text
                    const value = task.value;
                    if (typeof value === "number") {
                        task.onComplete({
                            type: "inline",
                            spans: [{ type: "text" as const, text: String(value) }],
                        });
                    } else if (typeof value === "string") {
                        task.onComplete({
                            type: "inline",
                            spans: [{ type: "text" as const, text: `'${value}'` }],
                        });
                    }
                }
            }
        });
    });

    test("handles array with extra keys in multi-line format", () => {
        return new Promise<void>((resolve) => {
            const arr: any = [1, 2, 3];
            arr.customProp = "value";
            arr.anotherProp = 42;
            
            const queue = new InspectionQueue();
            const optionsMultiLine = { ...defaultOptions, wrap: "multi-line" as const };

            inspectIterableIterative(
                arr,
                optionsMultiLine,
                defaultContext,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("block");
                    
                    // Convert spans to text to verify content
                    const text = inspection.spans
                        .map(s => 'text' in s ? s.text : '')
                        .join('');
                    
                    // Should include array elements with indices
                    expect(text).toContain("[0]");
                    expect(text).toContain("[1]");
                    expect(text).toContain("[2]");
                    
                    // Should include extra keys
                    expect(text).toContain("customProp");
                    expect(text).toContain("anotherProp");
                    
                    resolve();
                }
            );

            // Process the queue to complete the inspection
            while (!queue.isEmpty()) {
                const task = queue.dequeue();
                if (task) {
                    const value = task.value;
                    if (typeof value === "number") {
                        task.onComplete({
                            type: "inline",
                            spans: [{ type: "text" as const, text: String(value) }],
                        });
                    } else if (typeof value === "string") {
                        task.onComplete({
                            type: "inline",
                            spans: [{ type: "text" as const, text: `'${value}'` }],
                        });
                    }
                }
            }
        });
    });

    test("handles array with only extra keys (no numeric indices)", () => {
        return new Promise<void>((resolve) => {
            const arr: any = [];
            arr.customProp = "value";
            arr.anotherProp = 42;
            
            const queue = new InspectionQueue();
            const optionsSingleLine = { ...defaultOptions, wrap: "single-line" as const };

            inspectIterableIterative(
                arr,
                optionsSingleLine,
                defaultContext,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    
                    // Convert spans to text to verify content
                    const text = inspection.spans
                        .map(s => 'text' in s ? s.text : '')
                        .join('');
                    
                    // Should include extra keys
                    expect(text).toContain("customProp");
                    expect(text).toContain("anotherProp");
                    
                    // Should show array length as 0
                    expect(text).toContain("(0)");
                    
                    resolve();
                }
            );

            // Process the queue to complete the inspection
            while (!queue.isEmpty()) {
                const task = queue.dequeue();
                if (task) {
                    const value = task.value;
                    if (typeof value === "number") {
                        task.onComplete({
                            type: "inline",
                            spans: [{ type: "text" as const, text: String(value) }],
                        });
                    } else if (typeof value === "string") {
                        task.onComplete({
                            type: "inline",
                            spans: [{ type: "text" as const, text: `'${value}'` }],
                        });
                    }
                }
            }
        });
    });

    test("handles array with nested object as extra key value", () => {
        return new Promise<void>((resolve) => {
            const arr: any = [1, 2];
            arr.nested = { a: 1, b: 2 };
            
            const queue = new InspectionQueue();
            const optionsMultiLine = { ...defaultOptions, wrap: "multi-line" as const };

            inspectIterableIterative(
                arr,
                optionsMultiLine,
                defaultContext,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("block");
                    
                    // Convert spans to text to verify content
                    const text = inspection.spans
                        .map(s => 'text' in s ? s.text : '')
                        .join('');
                    
                    // Should include the nested key
                    expect(text).toContain("nested");
                    
                    resolve();
                }
            );

            // Process the queue to complete the inspection
            while (!queue.isEmpty()) {
                const task = queue.dequeue();
                if (task) {
                    const value = task.value;
                    if (typeof value === "number") {
                        task.onComplete({
                            type: "inline",
                            spans: [{ type: "text" as const, text: String(value) }],
                        });
                    } else if (typeof value === "object" && value !== null) {
                        // For objects, return a simple representation
                        task.onComplete({
                            type: "inline",
                            spans: [{ type: "text" as const, text: "{...}" }],
                        });
                    }
                }
            }
        });
    });

    test("handles extra keys with proper context updates", () => {
        return new Promise<void>((resolve) => {
            const arr: any = [1, 2];
            arr.customProp = "value";
            
            const queue = new InspectionQueue();
            const optionsSingleLine = { ...defaultOptions, wrap: "single-line" as const };

            inspectIterableIterative(
                arr,
                optionsSingleLine,
                defaultContext,
                queue,
                (inspection: ConsoleInspection) => {
                    resolve();
                }
            );

            // Verify that child tasks are created with proper context
            let extraKeyTaskFound = false;
            while (!queue.isEmpty()) {
                const task = queue.dequeue();
                if (task) {
                    // Check if this is a task for an extra key value
                    if (task.value === "value") {
                        extraKeyTaskFound = true;
                        // Verify depth is incremented
                        expect(task.context.depth).toBe(1);
                    }
                    
                    // Complete the task
                    const value = task.value;
                    if (typeof value === "number") {
                        task.onComplete({
                            type: "inline",
                            spans: [{ type: "text" as const, text: String(value) }],
                        });
                    } else if (typeof value === "string") {
                        task.onComplete({
                            type: "inline",
                            spans: [{ type: "text" as const, text: `'${value}'` }],
                        });
                    }
                }
            }
            
            expect(extraKeyTaskFound).toBe(true);
        });
    });
});
