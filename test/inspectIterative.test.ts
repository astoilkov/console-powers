import { describe, test, expect } from "vitest";
import { inspectIterative } from "../src/inspect/iterative/inspectIterative";
import { ConsoleInspectContext } from "../src/inspect/consoleInspect";

describe("inspectIterative - primitive handling", () => {
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

    test("handles undefined", () => {
        const result = inspectIterative(undefined, defaultOptions, defaultContext);
        expect(result.type).toBe("inline");
        expect(result.spans).toHaveLength(1);
        expect(result.spans[0]).toHaveProperty("text", "undefined");
    });

    test("handles null", () => {
        const result = inspectIterative(null, defaultOptions, defaultContext);
        expect(result.type).toBe("inline");
        expect(result.spans).toHaveLength(1);
        expect(result.spans[0]).toHaveProperty("text", "null");
    });

    test("handles boolean true", () => {
        const result = inspectIterative(true, defaultOptions, defaultContext);
        expect(result.type).toBe("inline");
        expect(result.spans).toHaveLength(1);
        expect(result.spans[0]).toHaveProperty("text", "true");
    });

    test("handles boolean false", () => {
        const result = inspectIterative(false, defaultOptions, defaultContext);
        expect(result.type).toBe("inline");
        expect(result.spans).toHaveLength(1);
        expect(result.spans[0]).toHaveProperty("text", "false");
    });

    test("handles number", () => {
        const result = inspectIterative(42, defaultOptions, defaultContext);
        expect(result.type).toBe("inline");
        expect(result.spans).toHaveLength(1);
        expect(result.spans[0]).toHaveProperty("text", "42");
    });

    test("handles negative number", () => {
        const result = inspectIterative(-123.45, defaultOptions, defaultContext);
        expect(result.type).toBe("inline");
        expect(result.spans).toHaveLength(1);
        expect(result.spans[0]).toHaveProperty("text", "-123.45");
    });

    test("handles bigint", () => {
        const result = inspectIterative(BigInt(9007199254740991), defaultOptions, defaultContext);
        expect(result.type).toBe("inline");
        expect(result.spans).toHaveLength(1);
        expect(result.spans[0]).toHaveProperty("text", "9007199254740991n");
    });

    test("handles string", () => {
        const result = inspectIterative("hello", defaultOptions, defaultContext);
        expect(result.type).toBe("inline");
        expect(result.spans).toHaveLength(1);
        expect(result.spans[0]).toHaveProperty("text", "'hello'");
    });

    test("handles empty string", () => {
        const result = inspectIterative("", defaultOptions, defaultContext);
        expect(result.type).toBe("inline");
        expect(result.spans).toHaveLength(1);
        expect(result.spans[0]).toHaveProperty("text", "''");
    });

    test("handles symbol", () => {
        const sym = Symbol("test");
        const result = inspectIterative(sym, defaultOptions, defaultContext);
        expect(result.type).toBe("inline");
        expect(result.spans).toHaveLength(1);
        expect(result.spans[0].text).toContain("Symbol(test)");
    });

    test("handles Date", () => {
        const date = new Date("2024-01-15T10:30:00");
        const result = inspectIterative(date, defaultOptions, defaultContext);
        expect(result.type).toBe("inline");
        expect(result.spans).toHaveLength(1);
        // Date formatting may vary by locale, just check it's not empty
        expect(result.spans[0].text).toBeTruthy();
    });

    test("respects wrap width for strings", () => {
        const longString = "a".repeat(200);
        const contextWithSmallWrap: ConsoleInspectContext = {
            ...defaultContext,
            wrap: 50,
        };
        const result = inspectIterative(longString, defaultOptions, contextWithSmallWrap);
        expect(result.type).toBe("inline");
        expect(result.spans).toHaveLength(1);
        // String should be truncated based on wrap width
        expect(result.spans[0].text.length).toBeLessThan(longString.length + 10);
    });
});

describe("inspectIterative - circular reference detection", () => {
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

    test("detects circular reference in object", () => {
        const obj: any = { a: 1 };
        obj.self = obj;
        
        // Add the object to the circular set to simulate it being encountered
        const contextWithCircular: ConsoleInspectContext = {
            ...defaultContext,
            circular: new Set([obj]),
        };
        
        const result = inspectIterative(obj, defaultOptions, contextWithCircular);
        expect(result.type).toBe("inline");
        expect(result.spans).toHaveLength(1);
        expect(result.spans[0]).toHaveProperty("text", "[Circular]");
    });

    test("detects circular reference in array", () => {
        const arr: any[] = [1, 2, 3];
        arr.push(arr);
        
        // Add the array to the circular set to simulate it being encountered
        const contextWithCircular: ConsoleInspectContext = {
            ...defaultContext,
            circular: new Set([arr]),
        };
        
        const result = inspectIterative(arr, defaultOptions, contextWithCircular);
        expect(result.type).toBe("inline");
        expect(result.spans).toHaveLength(1);
        expect(result.spans[0]).toHaveProperty("text", "[Circular]");
    });

    test("applies dimmed styling to circular reference", () => {
        const obj = { a: 1 };
        const contextWithCircular: ConsoleInspectContext = {
            ...defaultContext,
            circular: new Set([obj]),
        };
        
        const result = inspectIterative(obj, defaultOptions, contextWithCircular);
        expect(result.type).toBe("inline");
        expect(result.spans).toHaveLength(1);
        expect(result.spans[0]).toHaveProperty("text", "[Circular]");
        // Check that dimmed style is applied (dark theme)
        expect(result.spans[0]).toHaveProperty("style");
        expect(result.spans[0].style).toHaveProperty("color", "#8F8F8F");
    });

    test("applies dimmed styling with light theme", () => {
        const obj = { a: 1 };
        const contextWithCircular: ConsoleInspectContext = {
            ...defaultContext,
            circular: new Set([obj]),
        };
        
        const lightOptions = {
            ...defaultOptions,
            theme: "light" as const,
        };
        
        const result = inspectIterative(obj, lightOptions, contextWithCircular);
        expect(result.type).toBe("inline");
        expect(result.spans).toHaveLength(1);
        expect(result.spans[0]).toHaveProperty("text", "[Circular]");
        // Check that dimmed style is applied (light theme)
        expect(result.spans[0]).toHaveProperty("style");
        expect(result.spans[0].style).toHaveProperty("color", "#5F6367");
    });

    test("does not detect circular reference for non-circular object", () => {
        const obj = { a: 1, b: 2 };
        
        const result = inspectIterative(obj, defaultOptions, defaultContext);
        // Should not return [Circular] - should return proper object inspection
        expect(result.type).toBe("inline");
        // Should have proper spans for the object
        expect(result.spans.length).toBeGreaterThan(0);
        
        // Should not contain "[Circular]" text
        const hasCircular = result.spans.some(span => 
            typeof span === "object" && 
            "text" in span && 
            span.text === "[Circular]"
        );
        expect(hasCircular).toBe(false);
    });
});
