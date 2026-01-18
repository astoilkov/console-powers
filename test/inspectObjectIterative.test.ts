import { describe, test, expect } from "vitest";
import { inspectObjectIterative } from "../src/inspect/iterative/inspectObjectIterative";
import { ConsoleInspectContext } from "../src/inspect/consoleInspect";
import { InspectionQueue } from "../src/inspect/iterative/InspectionQueue";
import ConsoleInspection from "../src/inspect/utils/ConsoleInspection";
import { consoleText } from "../src/core/consoleText";

describe("inspectObjectIterative - depth limiting", () => {
    const defaultOptions = {
        depth: 2,
        indent: 2,
        wrap: "auto" as const,
        keys: [] as string[],
        theme: "dark" as const,
        print: false,
    };

    test("returns consoleObject when depth limit is reached", () => {
        return new Promise<void>((resolve) => {
            const obj = { a: 1, b: 2, c: 3 };
            const context: ConsoleInspectContext = {
                depth: 2, // At the depth limit
                wrap: 80,
                keys: new Set<string>(),
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();

            inspectObjectIterative(
                obj,
                defaultOptions,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    expect(inspection.spans).toHaveLength(1);
                    expect(inspection.spans[0]).toHaveProperty("type", "object");
                    expect(inspection.spans[0]).toHaveProperty("object", obj);
                    resolve();
                }
            );
        });
    });

    test("returns consoleObject when depth exceeds limit", () => {
        return new Promise<void>((resolve) => {
            const obj = { a: 1, b: 2, c: 3 };
            const context: ConsoleInspectContext = {
                depth: 3, // Exceeds the depth limit of 2
                wrap: 80,
                keys: new Set<string>(),
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();

            inspectObjectIterative(
                obj,
                defaultOptions,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    expect(inspection.spans).toHaveLength(1);
                    expect(inspection.spans[0]).toHaveProperty("type", "object");
                    expect(inspection.spans[0]).toHaveProperty("object", obj);
                    resolve();
                }
            );
        });
    });

    test("inspects object normally when depth is below limit", () => {
        return new Promise<void>((resolve) => {
            const obj = { a: 1, b: 2, c: 3 };
            const context: ConsoleInspectContext = {
                depth: 0, // Well below the depth limit
                wrap: 80,
                keys: new Set<string>(),
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();

            inspectObjectIterative(
                obj,
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
                        spans: [consoleText(String(task.value))],
                    });
                }
            }
        });
    });

    test("returns consoleObject for non-plain objects", () => {
        return new Promise<void>((resolve) => {
            const date = new Date();
            const context: ConsoleInspectContext = {
                depth: 0, // Below depth limit
                wrap: 80,
                keys: new Set<string>(),
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();

            inspectObjectIterative(
                date,
                defaultOptions,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    expect(inspection.spans).toHaveLength(1);
                    expect(inspection.spans[0]).toHaveProperty("type", "object");
                    expect(inspection.spans[0]).toHaveProperty("object", date);
                    resolve();
                }
            );
        });
    });

    test("respects depth limit with nested objects", () => {
        return new Promise<void>((resolve) => {
            const nestedObj = { a: { x: 1 }, b: { y: 2 } };
            const context: ConsoleInspectContext = {
                depth: 1, // One level below limit
                wrap: 80,
                keys: new Set<string>(),
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();
            const optionsWithDepth2 = { ...defaultOptions, depth: 2 };

            inspectObjectIterative(
                nestedObj,
                optionsWithDepth2,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    // The outer object should be inspected
                    expect(inspection.type).toBeTruthy();
                    expect(inspection.spans.length).toBeGreaterThan(0);
                    resolve();
                }
            );

            // Process the queue - child objects should hit depth limit
            while (!queue.isEmpty()) {
                const task = queue.dequeue();
                if (task) {
                    // Child objects at depth 2 should return consoleObject
                    if (task.context.depth >= optionsWithDepth2.depth) {
                        task.onComplete({
                            type: "inline",
                            spans: [{ type: "object" as const, object: task.value as object }],
                        });
                    } else {
                        task.onComplete({
                            type: "inline",
                            spans: [consoleText(String(task.value))],
                        });
                    }
                }
            }
        });
    });

    test("depth limit applies to empty objects", () => {
        return new Promise<void>((resolve) => {
            const obj = {};
            const context: ConsoleInspectContext = {
                depth: 2, // At the depth limit
                wrap: 80,
                keys: new Set<string>(),
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();

            inspectObjectIterative(
                obj,
                defaultOptions,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    expect(inspection.spans).toHaveLength(1);
                    expect(inspection.spans[0]).toHaveProperty("type", "object");
                    expect(inspection.spans[0]).toHaveProperty("object", obj);
                    resolve();
                }
            );
        });
    });

    test("depth limit applies regardless of wrap mode", () => {
        return new Promise<void>((resolve) => {
            const obj = { a: 1, b: 2, c: 3 };
            const context: ConsoleInspectContext = {
                depth: 2, // At the depth limit
                wrap: 80,
                keys: new Set<string>(),
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();
            const optionsMultiLine = { ...defaultOptions, wrap: "multi-line" as const };

            inspectObjectIterative(
                obj,
                optionsMultiLine,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    expect(inspection.spans).toHaveLength(1);
                    expect(inspection.spans[0]).toHaveProperty("type", "object");
                    expect(inspection.spans[0]).toHaveProperty("object", obj);
                    resolve();
                }
            );
        });
    });
});

describe("inspectObjectIterative - basic functionality", () => {
    const defaultOptions = {
        depth: 3,
        indent: 2,
        wrap: "auto" as const,
        keys: [] as string[],
        theme: "dark" as const,
        print: false,
    };

    const defaultContext: ConsoleInspectContext = {
        depth: 0,
        wrap: 80,
        keys: new Set<string>(),
        circular: new Set<unknown>(),
    };

    test("handles empty object", () => {
        return new Promise<void>((resolve) => {
            const obj = {};
            const queue = new InspectionQueue();

            inspectObjectIterative(
                obj,
                defaultOptions,
                defaultContext,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    expect(inspection.spans.length).toBeGreaterThan(0);
                    // Should have empty object braces
                    const text = inspection.spans.map(s => 'text' in s ? s.text : '').join('');
                    expect(text).toBe('{}');
                    resolve();
                }
            );
        });
    });

    test("handles object with single property in single-line format", () => {
        return new Promise<void>((resolve) => {
            const obj = { a: 1 };
            const queue = new InspectionQueue();
            const optionsSingleLine = { ...defaultOptions, wrap: "single-line" as const };

            inspectObjectIterative(
                obj,
                optionsSingleLine,
                defaultContext,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    
                    // Convert spans to text to verify content
                    const text = inspection.spans
                        .map(s => 'text' in s ? s.text : '')
                        .join('');
                    
                    // Should include property name and value
                    expect(text).toContain("a");
                    expect(text).toContain("1");
                    expect(text).toContain("{");
                    expect(text).toContain("}");
                    
                    resolve();
                }
            );

            // Process the queue to complete the inspection
            while (!queue.isEmpty()) {
                const task = queue.dequeue();
                if (task) {
                    task.onComplete({
                        type: "inline",
                        spans: [consoleText(String(task.value))],
                    });
                }
            }
        });
    });

    test("handles object with multiple properties in single-line format", () => {
        return new Promise<void>((resolve) => {
            const obj = { a: 1, b: 2, c: 3 };
            const queue = new InspectionQueue();
            const optionsSingleLine = { ...defaultOptions, wrap: "single-line" as const };

            inspectObjectIterative(
                obj,
                optionsSingleLine,
                defaultContext,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("inline");
                    
                    // Convert spans to text to verify content
                    const text = inspection.spans
                        .map(s => 'text' in s ? s.text : '')
                        .join('');
                    
                    // Should include all property names
                    expect(text).toContain("a");
                    expect(text).toContain("b");
                    expect(text).toContain("c");
                    
                    resolve();
                }
            );

            // Process the queue to complete the inspection
            while (!queue.isEmpty()) {
                const task = queue.dequeue();
                if (task) {
                    task.onComplete({
                        type: "inline",
                        spans: [consoleText(String(task.value))],
                    });
                }
            }
        });
    });

    test("handles object in multi-line format", () => {
        return new Promise<void>((resolve) => {
            const obj = { a: 1, b: 2, c: 3 };
            const queue = new InspectionQueue();
            const optionsMultiLine = { ...defaultOptions, wrap: "multi-line" as const };

            inspectObjectIterative(
                obj,
                optionsMultiLine,
                defaultContext,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("block");
                    
                    // Convert spans to text to verify content
                    const text = inspection.spans
                        .map(s => 'text' in s ? s.text : '')
                        .join('');
                    
                    // Should include all property names
                    expect(text).toContain("a");
                    expect(text).toContain("b");
                    expect(text).toContain("c");
                    
                    // Should have newlines
                    expect(text).toContain("\n");
                    
                    resolve();
                }
            );

            // Process the queue to complete the inspection
            while (!queue.isEmpty()) {
                const task = queue.dequeue();
                if (task) {
                    task.onComplete({
                        type: "inline",
                        spans: [consoleText(String(task.value))],
                    });
                }
            }
        });
    });

    test("handles nested objects", () => {
        return new Promise<void>((resolve) => {
            const obj = { a: { x: 1 }, b: 2 };
            const queue = new InspectionQueue();
            const optionsMultiLine = { ...defaultOptions, wrap: "multi-line" as const };

            inspectObjectIterative(
                obj,
                optionsMultiLine,
                defaultContext,
                queue,
                (inspection: ConsoleInspection) => {
                    expect(inspection.type).toBe("block");
                    
                    // Convert spans to text to verify content
                    const text = inspection.spans
                        .map(s => 'text' in s ? s.text : '')
                        .join('');
                    
                    // Should include property names
                    expect(text).toContain("a");
                    expect(text).toContain("b");
                    
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
                            spans: [consoleText(String(value))],
                        });
                    } else if (typeof value === "object" && value !== null) {
                        // For nested objects, return a simple representation
                        task.onComplete({
                            type: "inline",
                            spans: [consoleText("{...}")],
                        });
                    }
                }
            }
        });
    });
});

describe("inspectObjectIterative - context updates", () => {
    const defaultOptions = {
        depth: 3,
        indent: 2,
        wrap: "auto" as const,
        keys: [] as string[],
        theme: "dark" as const,
        print: false,
    };

    const defaultContext: ConsoleInspectContext = {
        depth: 0,
        wrap: 80,
        keys: new Set<string>(),
        circular: new Set<unknown>(),
    };

    test("increments depth for child tasks", () => {
        return new Promise<void>((resolve) => {
            const obj = { a: 1, b: 2 };
            const queue = new InspectionQueue();
            const optionsSingleLine = { ...defaultOptions, wrap: "single-line" as const };

            inspectObjectIterative(
                obj,
                optionsSingleLine,
                defaultContext,
                queue,
                () => {
                    resolve();
                }
            );

            // Verify that child tasks are created with proper context
            let childTaskFound = false;
            while (!queue.isEmpty()) {
                const task = queue.dequeue();
                if (task) {
                    // Check if this is a child task
                    if (task.value === 1 || task.value === 2) {
                        childTaskFound = true;
                        // Verify depth is incremented
                        expect(task.context.depth).toBe(1);
                    }
                    
                    // Complete the task
                    task.onComplete({
                        type: "inline",
                        spans: [consoleText(String(task.value))],
                    });
                }
            }
            
            expect(childTaskFound).toBe(true);
        });
    });

    test("updates wrap width for multi-line format", () => {
        return new Promise<void>((resolve) => {
            const obj = { longPropertyName: 1, b: 2 };
            const queue = new InspectionQueue();
            const optionsMultiLine = { ...defaultOptions, wrap: "multi-line" as const };

            inspectObjectIterative(
                obj,
                optionsMultiLine,
                defaultContext,
                queue,
                () => {
                    resolve();
                }
            );

            // Verify that child tasks have updated wrap width
            let childTaskFound = false;
            while (!queue.isEmpty()) {
                const task = queue.dequeue();
                if (task) {
                    if (task.value === 1 || task.value === 2) {
                        childTaskFound = true;
                        // Verify wrap width is reduced
                        expect(task.context.wrap).toBeLessThan(defaultContext.wrap);
                    }
                    
                    // Complete the task
                    task.onComplete({
                        type: "inline",
                        spans: [consoleText(String(task.value))],
                    });
                }
            }
            
            expect(childTaskFound).toBe(true);
        });
    });
});

describe("inspectObjectIterative - keys filtering", () => {
    const defaultOptions = {
        depth: 3,
        indent: 2,
        wrap: "auto" as const,
        keys: [] as string[],
        theme: "dark" as const,
        print: false,
    };

    test("respects keys filter in context", () => {
        return new Promise<void>((resolve) => {
            const obj = { a: 1, b: 2, c: 3 };
            const context: ConsoleInspectContext = {
                depth: 0,
                wrap: 80,
                keys: new Set<string>(["a", "c"]), // Only inspect a and c
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();
            const optionsSingleLine = { ...defaultOptions, wrap: "single-line" as const };

            inspectObjectIterative(
                obj,
                optionsSingleLine,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    const text = inspection.spans
                        .map(s => 'text' in s ? s.text : '')
                        .join('');
                    
                    // Should include filtered keys
                    expect(text).toContain("a");
                    expect(text).toContain("c");
                    
                    // Should NOT include b
                    expect(text).not.toContain("b");
                    
                    resolve();
                }
            );

            // Process the queue to complete the inspection
            while (!queue.isEmpty()) {
                const task = queue.dequeue();
                if (task) {
                    task.onComplete({
                        type: "inline",
                        spans: [consoleText(String(task.value))],
                    });
                }
            }
        });
    });

    test("respects keys filter in multi-line format", () => {
        return new Promise<void>((resolve) => {
            const obj = { a: 1, b: 2, c: 3 };
            const context: ConsoleInspectContext = {
                depth: 0,
                wrap: 80,
                keys: new Set<string>(["a", "c"]), // Only inspect a and c
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();
            const optionsMultiLine = { ...defaultOptions, wrap: "multi-line" as const };

            inspectObjectIterative(
                obj,
                optionsMultiLine,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    const text = inspection.spans
                        .map(s => 'text' in s ? s.text : '')
                        .join('');
                    
                    // Should include filtered keys
                    expect(text).toContain("a");
                    expect(text).toContain("c");
                    
                    // Should NOT include b
                    expect(text).not.toContain("b");
                    
                    resolve();
                }
            );

            // Process the queue to complete the inspection
            while (!queue.isEmpty()) {
                const task = queue.dequeue();
                if (task) {
                    task.onComplete({
                        type: "inline",
                        spans: [consoleText(String(task.value))],
                    });
                }
            }
        });
    });

    test("keys filter is preserved in nested objects", () => {
        return new Promise<void>((resolve) => {
            const obj = { a: { x: 1, y: 2 }, b: { x: 3, y: 4 }, c: { x: 5, y: 6 } };
            const context: ConsoleInspectContext = {
                depth: 0,
                wrap: 80,
                keys: new Set<string>(["a", "c"]), // Only inspect a and c
                circular: new Set<unknown>(),
            };
            const queue = new InspectionQueue();
            const optionsSingleLine = { ...defaultOptions, wrap: "single-line" as const };

            inspectObjectIterative(
                obj,
                optionsSingleLine,
                context,
                queue,
                (inspection: ConsoleInspection) => {
                    const text = inspection.spans
                        .map(s => 'text' in s ? s.text : '')
                        .join('');
                    
                    // Should include filtered keys
                    expect(text).toContain("a");
                    expect(text).toContain("c");
                    
                    // Should NOT include b
                    expect(text).not.toContain("b");
                    
                    resolve();
                }
            );

            // Process the queue to complete the inspection
            while (!queue.isEmpty()) {
                const task = queue.dequeue();
                if (task) {
                    // For nested objects, we need to process them recursively
                    if (typeof task.value === 'object' && task.value !== null && !Array.isArray(task.value)) {
                        inspectObjectIterative(
                            task.value,
                            task.options,
                            task.context,
                            queue,
                            task.onComplete
                        );
                    } else {
                        task.onComplete({
                            type: "inline",
                            spans: [consoleText(String(task.value))],
                        });
                    }
                }
            }
        });
    });
});
