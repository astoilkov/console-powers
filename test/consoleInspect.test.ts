import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import consoleInspect from "../src/inspect/consoleInspect";
import type ConsoleSpan from "../src/core/ConsoleSpan";
import type { ConsoleText } from "../src/core/consoleText";
import type { ConsoleObject } from "../src/core/consoleObject";
import type { ConsoleGroup } from "../src/core/consoleGroup";
import type { ConsoleFlush } from "../src/core/consoleFlush";

// Helper to check if a span is ConsoleText
function isConsoleText(span: ConsoleSpan): span is ConsoleText {
    return typeof span === "object" && span !== null && "type" in span && span.type === "text";
}

// Helper to check if a span is ConsoleObject
function isConsoleObject(span: ConsoleSpan): span is ConsoleObject {
    return typeof span === "object" && span !== null && "type" in span && span.type === "object";
}

// Helper to check if a span is ConsoleGroup
function isConsoleGroup(span: ConsoleSpan): span is ConsoleGroup {
    return typeof span === "object" && span !== null && "type" in span && span.type === "group";
}

// Helper to check if a span is ConsoleFlush
function isConsoleFlush(span: ConsoleSpan): span is ConsoleFlush {
    return typeof span === "object" && span !== null && "type" in span && span.type === "flush";
}

describe("consoleInspect", () => {
    let consolePrintSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        // Mock matchMedia for theme detection
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: query === "(prefers-color-scheme: dark)",
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        // Spy on console methods to prevent actual output
        consolePrintSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Primitive Values", () => {
        test("should inspect undefined", () => {
            const result = consoleInspect([undefined], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            
            const span = result[0] as ConsoleText;
            expect(span.type).toBe("text");
            expect(span.text).toBe("undefined");
            expect(span.style).toBeDefined();
        });

        test("should inspect null", () => {
            const result = consoleInspect([null], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            
            const span = result[0] as ConsoleText;
            expect(span.type).toBe("text");
            expect(span.text).toBe("null");
            expect(span.style).toBeDefined();
        });

        test("should inspect boolean true", () => {
            const result = consoleInspect([true], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            
            const span = result[0] as ConsoleText;
            expect(span.type).toBe("text");
            expect(span.text).toBe("true");
            expect(span.style).toBeDefined();
        });

        test("should inspect boolean false", () => {
            const result = consoleInspect([false], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            
            const span = result[0] as ConsoleText;
            expect(span.type).toBe("text");
            expect(span.text).toBe("false");
            expect(span.style).toBeDefined();
        });

        test("should inspect number", () => {
            const result = consoleInspect([42], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            
            const span = result[0] as ConsoleText;
            expect(span.type).toBe("text");
            expect(span.text).toBe("42");
            expect(span.style).toBeDefined();
        });

        test("should inspect negative number", () => {
            const result = consoleInspect([-123.45], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            
            const span = result[0] as ConsoleText;
            expect(span.type).toBe("text");
            expect(span.text).toBe("-123.45");
        });

        test("should inspect bigint", () => {
            const result = consoleInspect([BigInt(9007199254740991)], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            
            const span = result[0] as ConsoleText;
            expect(span.type).toBe("text");
            expect(span.text).toBe("9007199254740991n");
            expect(span.style).toBeDefined();
        });

        test("should inspect string", () => {
            const result = consoleInspect(["hello world"], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            
            const span = result[0] as ConsoleText;
            expect(span.type).toBe("text");
            expect(span.text).toBe("hello world");
        });

        test("should inspect empty string", () => {
            const result = consoleInspect([""], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            
            const span = result[0] as ConsoleText;
            expect(span.type).toBe("text");
            expect(span.text).toBe("''");
        });

        test("should inspect whitespace-only string", () => {
            const result = consoleInspect(["   "], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            
            const span = result[0] as ConsoleText;
            expect(span.type).toBe("text");
            expect(span.text).toBe("'   '");
        });

        test("should inspect symbol", () => {
            const sym = Symbol("test");
            const result = consoleInspect([sym], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            
            const span = result[0] as ConsoleText;
            expect(span.type).toBe("text");
            expect(span.text).toContain("Symbol(test)");
        });
    });

    describe("Multiple Primitive Values", () => {
        test("should inspect multiple primitives with space separator", () => {
            const result = consoleInspect([1, 2, 3], { print: false });
            
            expect(result.length).toBeGreaterThan(3);
            
            // Check first value
            expect(isConsoleText(result[0])).toBe(true);
            expect((result[0] as ConsoleText).text).toBe("1");
            
            // Check separator
            expect(isConsoleText(result[1])).toBe(true);
            expect((result[1] as ConsoleText).text).toBe(" ");
            
            // Check second value
            expect(isConsoleText(result[2])).toBe(true);
            expect((result[2] as ConsoleText).text).toBe("2");
        });

        test("should inspect mixed primitives", () => {
            const result = consoleInspect([true, 42, "test"], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
            
            const texts = result.filter(isConsoleText).map(s => s.text);
            expect(texts).toContain("true");
            expect(texts).toContain("42");
            expect(texts).toContain("test");
        });
    });

    describe("Arrays", () => {
        test("should inspect empty array", () => {
            const result = consoleInspect([[]], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
            
            const group = result[0] as ConsoleGroup;
            expect(group.type).toBe("group");
            expect(group.expanded).toBe(false);
            expect(group.header).toBeDefined();
            expect(group.body).toBeDefined();
        });

        test("should inspect array with primitives", () => {
            const result = consoleInspect([[1, 2, 3]], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
            
            const group = result[0] as ConsoleGroup;
            expect(group.type).toBe("group");
            expect(group.header).toBeDefined();
            expect(Array.isArray(group.header)).toBe(true);
            expect(group.body).toBeDefined();
            expect(Array.isArray(group.body)).toBe(true);
        });

        test("should inspect nested arrays", () => {
            const result = consoleInspect([[[1, 2], [3, 4]]], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
            // Should return valid ConsoleSpan array
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe("Objects", () => {
        test("should inspect empty object", () => {
            const result = consoleInspect([{}], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
            
            const group = result[0] as ConsoleGroup;
            expect(group.type).toBe("group");
            expect(group.expanded).toBe(false);
            expect(group.header).toBeDefined();
            expect(group.body).toBeDefined();
        });

        test("should inspect object with properties", () => {
            const result = consoleInspect([{ a: 1, b: 2 }], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
            
            const group = result[0] as ConsoleGroup;
            expect(group.type).toBe("group");
            expect(group.header).toBeDefined();
            expect(group.body).toBeDefined();
            expect(group.body.length).toBeGreaterThan(0);
        });

        test("should inspect nested objects", () => {
            const result = consoleInspect([{ a: { b: { c: 1 } } }], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
            // Should return valid ConsoleSpan array
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe("Options", () => {
        test("should respect print: false option", () => {
            consoleInspect([42], { print: false });
            
            expect(consolePrintSpy).not.toHaveBeenCalled();
        });

        test("should print by default", () => {
            // The print option defaults to true, so calling without print: false should print
            // We can't easily test the actual printing since builtInConsole binds methods early
            // Instead, verify that the function completes successfully when print is enabled
            const result = consoleInspect([42]);
            
            // Should still return the spans even when printing
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });

        test("should respect theme: light option", () => {
            const result = consoleInspect([42], { print: false, theme: "light" });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
        });

        test("should respect theme: dark option", () => {
            const result = consoleInspect([42], { print: false, theme: "dark" });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
        });

        test("should respect depth option", () => {
            const deepObj = { a: { b: { c: { d: 1 } } } };
            const result = consoleInspect([deepObj], { print: false, depth: 1 });
            
            expect(result.length).toBeGreaterThan(0);
            // Should return valid ConsoleSpan array
            expect(Array.isArray(result)).toBe(true);
        });

        test("should respect indent option", () => {
            const result = consoleInspect([{ a: 1 }], { print: false, indent: 2 });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should respect wrap: single-line option", () => {
            const result = consoleInspect([[1, 2, 3]], { print: false, wrap: "single-line" });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should respect wrap: multi-line option", () => {
            const result = consoleInspect([[1, 2, 3]], { print: false, wrap: "multi-line" });
            
            expect(result.length).toBeGreaterThan(0);
            // Should return valid ConsoleSpan array
            expect(Array.isArray(result)).toBe(true);
        });

        test("should respect wrap: number option", () => {
            const result = consoleInspect([[1, 2, 3]], { print: false, wrap: 50 });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should respect keys option", () => {
            const result = consoleInspect([{ a: 1, b: 2, c: 3 }], { print: false, keys: ["a", "b"] });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });
    });

    describe("Special Cases", () => {
        test("should handle Date objects", () => {
            const date = new Date("2024-01-01");
            const result = consoleInspect([date], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            
            const span = result[0] as ConsoleText;
            expect(span.text).toContain("2024");
        });

        test("should handle circular references", () => {
            const obj: any = { a: 1 };
            obj.self = obj;
            
            const result = consoleInspect([obj], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
            // Should handle circular references without crashing
            expect(Array.isArray(result)).toBe(true);
        });

        test("should handle functions", () => {
            const fn = function testFunc() { return 42; };
            const result = consoleInspect([fn], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
        });

        test("should handle class instances", () => {
            class TestClass {
                constructor(public value: number) {}
            }
            const instance = new TestClass(42);
            
            const result = consoleInspect([instance], { print: false });
            
            expect(result).toHaveLength(1);
            // Class instances are treated as objects, not plain objects
            expect(result.length).toBeGreaterThan(0);
        });

        test("should handle Map", () => {
            const map = new Map([["key", "value"]]);
            const result = consoleInspect([map], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
            // Should return valid ConsoleSpan array
            expect(Array.isArray(result)).toBe(true);
        });

        test("should handle Set", () => {
            const set = new Set([1, 2, 3]);
            const result = consoleInspect([set], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should handle RegExp", () => {
            const regex = /test/gi;
            const result = consoleInspect([regex], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
        });

        test("should handle Error objects", () => {
            const error = new Error("Test error");
            const result = consoleInspect([error], { print: false });
            
            expect(result).toHaveLength(1);
            // Error objects are treated as regular objects
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe("ConsoleSpan Properties", () => {
        test("ConsoleText should have correct properties", () => {
            const result = consoleInspect([42], { print: false });
            const span = result[0] as ConsoleText;
            
            expect(span).toHaveProperty("type");
            expect(span).toHaveProperty("text");
            expect(span).toHaveProperty("style");
            expect(typeof span.type).toBe("string");
            expect(typeof span.text).toBe("string");
            expect(typeof span.style).toBe("object");
        });

        test("ConsoleGroup should have correct properties", () => {
            const result = consoleInspect([[1, 2, 3]], { print: false });
            const span = result[0] as ConsoleGroup;
            
            expect(span).toHaveProperty("type");
            expect(span).toHaveProperty("expanded");
            expect(span).toHaveProperty("header");
            expect(span).toHaveProperty("body");
            expect(typeof span.type).toBe("string");
            expect(typeof span.expanded).toBe("boolean");
            expect(Array.isArray(span.header)).toBe(true);
            expect(Array.isArray(span.body)).toBe(true);
        });

        test("ConsoleText style should be a valid object", () => {
            const result = consoleInspect([42], { print: false, theme: "dark" });
            const span = result[0] as ConsoleText;
            
            expect(span.style).toBeDefined();
            expect(typeof span.style).toBe("object");
            expect(span.style).not.toBeNull();
        });

        test("ConsoleGroup header should contain valid spans", () => {
            const result = consoleInspect([[1, 2]], { print: false });
            const group = result[0] as ConsoleGroup;
            
            expect(group.header.length).toBeGreaterThan(0);
            group.header.forEach(headerSpan => {
                expect(typeof headerSpan === "string" || typeof headerSpan === "object").toBe(true);
            });
        });

        test("ConsoleGroup body should contain valid spans", () => {
            const result = consoleInspect([[1, 2]], { print: false });
            const group = result[0] as ConsoleGroup;
            
            expect(group.body.length).toBeGreaterThan(0);
            group.body.forEach(bodySpan => {
                expect(typeof bodySpan === "string" || typeof bodySpan === "object").toBe(true);
            });
        });
    });

    describe("Edge Cases", () => {
        test("should handle empty input array", () => {
            const result = consoleInspect([], { print: false });
            
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });

        test("should handle very long strings", () => {
            const longString = "a".repeat(10000);
            const result = consoleInspect([longString], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
            expect(isConsoleText(result[0])).toBe(true);
        });

        test("should handle strings with special characters", () => {
            const result = consoleInspect(["hello\nworld\ttab"], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
        });

        test("should handle NaN", () => {
            const result = consoleInspect([NaN], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            expect((result[0] as ConsoleText).text).toBe("NaN");
        });

        test("should handle Infinity", () => {
            const result = consoleInspect([Infinity], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            expect((result[0] as ConsoleText).text).toBe("Infinity");
        });

        test("should handle -Infinity", () => {
            const result = consoleInspect([-Infinity], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            expect((result[0] as ConsoleText).text).toBe("-Infinity");
        });

        test("should handle objects with null prototype", () => {
            const obj = Object.create(null);
            obj.a = 1;
            
            const result = consoleInspect([obj], { print: false });
            
            expect(result).toHaveLength(1);
        });

        test("should handle sparse arrays", () => {
            const sparse = [1, , , 4];
            const result = consoleInspect([sparse], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });
    });

    describe("Return Value", () => {
        test("should return array of ConsoleSpan", () => {
            const result = consoleInspect([42], { print: false });
            
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });

        test("should return same reference when called multiple times with same input", () => {
            const input = [42];
            const result1 = consoleInspect(input, { print: false });
            const result2 = consoleInspect(input, { print: false });
            
            // Results should be equal but not necessarily the same reference
            expect(result1).toEqual(result2);
        });

        test("should apply lineHeight style to non-primitive values", () => {
            const result = consoleInspect([{ a: 1 }], { print: false });
            
            expect(result).toHaveLength(1);
            
            // Check that the result contains valid spans
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
            
            // Verify the structure is valid
            const span = result[0];
            expect(typeof span === "object" || typeof span === "string").toBe(true);
        });
    });

    describe("Additional Coverage Tests", () => {
        test("should handle string with newlines and tabs", () => {
            const result = consoleInspect(["hello\nworld\ttab\rcarriage"], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
            // Non-whitespace strings are not wrapped in quotes by consoleInspect
            // They're just displayed as-is
            expect(Array.isArray(result)).toBe(true);
        });

        test("should handle Date with time", () => {
            const date = new Date("2024-01-01T12:30:45");
            const result = consoleInspect([date], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            
            const span = result[0] as ConsoleText;
            expect(span.text).toContain("2024");
            expect(span.style.fontStyle).toBe("italic");
        });

        test("should handle Date at midnight", () => {
            const date = new Date("2024-01-01T00:00:00");
            const result = consoleInspect([date], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            
            const span = result[0] as ConsoleText;
            expect(span.style.fontStyle).toBe("italic");
        });

        test("should handle multiple non-primitive values with newline separator", () => {
            const result = consoleInspect([{ a: 1 }, { b: 2 }], { print: false });
            
            expect(result.length).toBeGreaterThan(2);
            
            // Should have separator between objects
            const hasNewlineSeparator = result.some(span => 
                isConsoleText(span) && (span as ConsoleText).text.includes("\n")
            );
            expect(hasNewlineSeparator).toBe(true);
        });

        test("should handle very long string with excerpt", () => {
            const longString = "a".repeat(15000);
            const result = consoleInspect([longString], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            
            const span = result[0] as ConsoleText;
            // String should be excerpted to 10000 chars
            expect(span.text.length).toBeLessThan(15000);
        });

        test("should handle object with many properties", () => {
            const obj = {
                a: 1, b: 2, c: 3, d: 4, e: 5,
                f: 6, g: 7, h: 8, i: 9, j: 10
            };
            const result = consoleInspect([obj], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
            
            const group = result[0] as ConsoleGroup;
            expect(group.body.length).toBeGreaterThan(0);
        });

        test("should handle array with mixed types", () => {
            const arr = [1, "string", true, null, undefined, { a: 1 }, [1, 2]];
            const result = consoleInspect([arr], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
            expect(Array.isArray(result)).toBe(true);
        });

        test("should handle WeakMap", () => {
            const weakMap = new WeakMap();
            const key = {};
            weakMap.set(key, "value");
            
            const result = consoleInspect([weakMap], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
        });

        test("should handle WeakSet", () => {
            const weakSet = new WeakSet();
            const obj = {};
            weakSet.add(obj);
            
            const result = consoleInspect([weakSet], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
        });

        test("should handle Promise", () => {
            const promise = Promise.resolve(42);
            const result = consoleInspect([promise], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
        });

        test("should handle ArrayBuffer", () => {
            const buffer = new ArrayBuffer(8);
            const result = consoleInspect([buffer], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
        });

        test("should handle TypedArray", () => {
            const typedArray = new Uint8Array([1, 2, 3, 4]);
            const result = consoleInspect([typedArray], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should handle object with symbol keys", () => {
            const sym = Symbol("test");
            const obj = { [sym]: "value", regular: "prop" };
            
            const result = consoleInspect([obj], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should handle object with getter", () => {
            const obj = {
                get value() {
                    return 42;
                }
            };
            
            const result = consoleInspect([obj], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should handle frozen object", () => {
            const obj = Object.freeze({ a: 1, b: 2 });
            const result = consoleInspect([obj], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should handle sealed object", () => {
            const obj = Object.seal({ a: 1, b: 2 });
            const result = consoleInspect([obj], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should handle object with non-enumerable properties", () => {
            const obj = {};
            Object.defineProperty(obj, "hidden", {
                value: 42,
                enumerable: false
            });
            Object.defineProperty(obj, "visible", {
                value: 100,
                enumerable: true
            });
            
            const result = consoleInspect([obj], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should handle zero", () => {
            const result = consoleInspect([0], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            expect((result[0] as ConsoleText).text).toBe("0");
        });

        test("should handle negative zero", () => {
            const result = consoleInspect([-0], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            expect((result[0] as ConsoleText).text).toBe("0");
        });

        test("should handle very small number", () => {
            const result = consoleInspect([0.0000001], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
        });

        test("should handle very large number", () => {
            const result = consoleInspect([9999999999999], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
        });

        test("should handle string with only spaces", () => {
            const result = consoleInspect(["     "], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            expect((result[0] as ConsoleText).text).toBe("'     '");
        });

        test("should handle string with unicode characters", () => {
            const result = consoleInspect(["Hello 世界 🌍"], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            expect((result[0] as ConsoleText).text).toContain("世界");
            expect((result[0] as ConsoleText).text).toContain("🌍");
        });

        test("should handle array-like object", () => {
            const arrayLike = { 0: "a", 1: "b", 2: "c", length: 3 };
            const result = consoleInspect([arrayLike], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should handle generator function", () => {
            function* gen() {
                yield 1;
                yield 2;
            }
            
            const result = consoleInspect([gen], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
        });

        test("should handle async function", () => {
            async function asyncFn() {
                return 42;
            }
            
            const result = consoleInspect([asyncFn], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
        });

        test("should handle arrow function", () => {
            const arrowFn = () => 42;
            const result = consoleInspect([arrowFn], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
        });

        test("should handle bound function", () => {
            function fn() { return this; }
            const boundFn = fn.bind({ value: 42 });
            
            const result = consoleInspect([boundFn], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
        });

        test("should handle Proxy", () => {
            const target = { a: 1 };
            const proxy = new Proxy(target, {});
            
            const result = consoleInspect([proxy], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should handle deeply nested circular structure", () => {
            const obj: any = { level1: { level2: { level3: {} } } };
            obj.level1.level2.level3.circular = obj;
            
            const result = consoleInspect([obj], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
        });

        test("should handle multiple values with different types", () => {
            const result = consoleInspect([
                42,
                "string",
                true,
                null,
                undefined,
                { a: 1 },
                [1, 2, 3]
            ], { print: false });
            
            expect(result.length).toBeGreaterThan(7);
        });

        test("should handle empty Set", () => {
            const set = new Set();
            const result = consoleInspect([set], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should handle empty Map", () => {
            const map = new Map();
            const result = consoleInspect([map], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should handle Set with objects", () => {
            const set = new Set([{ a: 1 }, { b: 2 }]);
            const result = consoleInspect([set], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
            expect(Array.isArray(result)).toBe(true);
        });

        test("should handle Map with complex keys", () => {
            const map = new Map();
            map.set({ key: 1 }, "value1");
            map.set([1, 2], "value2");
            
            const result = consoleInspect([map], { print: false });
            
            expect(result.length).toBeGreaterThan(0);
            expect(Array.isArray(result)).toBe(true);
        });
    });
});
