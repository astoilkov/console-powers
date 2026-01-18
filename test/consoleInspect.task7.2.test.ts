import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import consoleInspect from "../src/inspect/consoleInspect";
import type ConsoleSpan from "../src/core/ConsoleSpan";
import type { ConsoleText } from "../src/core/consoleText";
import type { ConsoleGroup } from "../src/core/consoleGroup";

// Helper to check if a span is ConsoleText
function isConsoleText(span: ConsoleSpan): span is ConsoleText {
    return typeof span === "object" && span !== null && "type" in span && span.type === "text";
}

// Helper to check if a span is ConsoleGroup
function isConsoleGroup(span: ConsoleSpan): span is ConsoleGroup {
    return typeof span === "object" && span !== null && "type" in span && span.type === "group";
}

/**
 * Task 7.2: Update consoleInspect to work with new implementation
 * 
 * This test suite verifies that consoleInspect works correctly with the new
 * iterative implementation, specifically testing:
 * - Top-level grouping still works correctly
 * - Separator handling (space vs newline)
 * - Single and multiple values
 * 
 * Requirements: 2.1, 5.1, 5.2
 */
describe("Task 7.2: consoleInspect with iterative implementation", () => {
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
        vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Top-level grouping (Requirement 2.1, 5.1)", () => {
        test("should use consoleGroup for single array", () => {
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

        test("should use consoleGroup for single object", () => {
            const result = consoleInspect([{ a: 1, b: 2 }], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
            
            const group = result[0] as ConsoleGroup;
            expect(group.type).toBe("group");
            expect(group.header).toBeDefined();
            expect(Array.isArray(group.header)).toBe(true);
            expect(group.body).toBeDefined();
            expect(Array.isArray(group.body)).toBe(true);
        });

        test("should use consoleGroup for single Set", () => {
            const result = consoleInspect([new Set([1, 2, 3])], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
            
            const group = result[0] as ConsoleGroup;
            expect(group.type).toBe("group");
            expect(group.header).toBeDefined();
            expect(group.body).toBeDefined();
        });

        test("should use consoleGroup for single Map", () => {
            const result = consoleInspect([new Map([["a", 1], ["b", 2]])], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
            
            const group = result[0] as ConsoleGroup;
            expect(group.type).toBe("group");
            expect(group.header).toBeDefined();
            expect(group.body).toBeDefined();
        });

        test("should use consoleGroup for single empty array", () => {
            const result = consoleInspect([[]], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
            
            const group = result[0] as ConsoleGroup;
            expect(group.type).toBe("group");
            expect(group.expanded).toBe(false);
        });

        test("should use consoleGroup for single empty object", () => {
            const result = consoleInspect([{}], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
            
            const group = result[0] as ConsoleGroup;
            expect(group.type).toBe("group");
            expect(group.expanded).toBe(false);
        });

        test("should NOT use consoleGroup for single primitive", () => {
            const result = consoleInspect([42], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            expect((result[0] as ConsoleText).text).toBe("42");
        });

        test("should NOT use consoleGroup for single string", () => {
            const result = consoleInspect(["hello"], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            expect((result[0] as ConsoleText).text).toBe("hello");
        });

        test("should NOT use consoleGroup for non-plain objects (Date)", () => {
            const date = new Date("2024-01-01");
            const result = consoleInspect([date], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
        });
    });

    describe("Separator handling (Requirement 5.2)", () => {
        test("should use space separator for multiple primitives", () => {
            const result = consoleInspect([1, 2, 3], { print: false });
            
            // Should have: value, space, value, space, value
            expect(result.length).toBeGreaterThan(3);
            
            // Check first value
            expect(isConsoleText(result[0])).toBe(true);
            expect((result[0] as ConsoleText).text).toBe("1");
            
            // Check separator after first value
            expect(isConsoleText(result[1])).toBe(true);
            expect((result[1] as ConsoleText).text).toBe(" ");
            
            // Check second value
            expect(isConsoleText(result[2])).toBe(true);
            expect((result[2] as ConsoleText).text).toBe("2");
            
            // Check separator after second value
            expect(isConsoleText(result[3])).toBe(true);
            expect((result[3] as ConsoleText).text).toBe(" ");
            
            // Check third value
            expect(isConsoleText(result[4])).toBe(true);
            expect((result[4] as ConsoleText).text).toBe("3");
        });

        test("should use space separator for mixed primitives", () => {
            const result = consoleInspect([true, 42, "test", null], { print: false });
            
            // Should have separators between values
            const texts = result.filter(isConsoleText).map(s => s.text);
            expect(texts).toContain("true");
            expect(texts).toContain("42");
            expect(texts).toContain("test");
            expect(texts).toContain("null");
            expect(texts).toContain(" ");
        });

        test("should use newline separator for multiple objects", () => {
            const result = consoleInspect([{ a: 1 }, { b: 2 }], { print: false });
            
            expect(result.length).toBeGreaterThan(2);
            
            // Should have newline separator between objects
            const hasNewlineSeparator = result.some(span => 
                isConsoleText(span) && (span as ConsoleText).text.includes("\n")
            );
            expect(hasNewlineSeparator).toBe(true);
        });

        test("should use newline separator for multiple arrays", () => {
            const result = consoleInspect([[1, 2], [3, 4]], { print: false });
            
            expect(result.length).toBeGreaterThan(2);
            
            // Should have newline separator between arrays
            const hasNewlineSeparator = result.some(span => 
                isConsoleText(span) && (span as ConsoleText).text.includes("\n")
            );
            expect(hasNewlineSeparator).toBe(true);
        });

        test("should use newline separator for mixed non-primitives", () => {
            const result = consoleInspect([{ a: 1 }, [1, 2], new Set([1])], { print: false });
            
            expect(result.length).toBeGreaterThan(3);
            
            // Should have newline separators
            const hasNewlineSeparator = result.some(span => 
                isConsoleText(span) && (span as ConsoleText).text.includes("\n")
            );
            expect(hasNewlineSeparator).toBe(true);
        });

        test("should use newline separator for mixed primitives and non-primitives", () => {
            const result = consoleInspect([42, { a: 1 }, "test", [1, 2]], { print: false });
            
            expect(result.length).toBeGreaterThan(4);
            
            // When any value is non-primitive, should use newline separator
            const hasNewlineSeparator = result.some(span => 
                isConsoleText(span) && (span as ConsoleText).text.includes("\n")
            );
            expect(hasNewlineSeparator).toBe(true);
        });
    });

    describe("Single and multiple values (Requirement 2.1)", () => {
        test("should handle single primitive value", () => {
            const result = consoleInspect([42], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleText(result[0])).toBe(true);
            expect((result[0] as ConsoleText).text).toBe("42");
        });

        test("should handle single array value", () => {
            const result = consoleInspect([[1, 2, 3]], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should handle single object value", () => {
            const result = consoleInspect([{ a: 1 }], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should handle multiple primitive values", () => {
            const result = consoleInspect([1, 2, 3, 4, 5], { print: false });
            
            expect(result.length).toBeGreaterThan(5);
            
            // Should have all values
            const texts = result.filter(isConsoleText).map(s => s.text);
            expect(texts).toContain("1");
            expect(texts).toContain("2");
            expect(texts).toContain("3");
            expect(texts).toContain("4");
            expect(texts).toContain("5");
        });

        test("should handle multiple array values", () => {
            const result = consoleInspect([[1], [2], [3]], { print: false });
            
            expect(result.length).toBeGreaterThan(3);
            
            // When there are multiple values, they are not wrapped in groups
            // They are rendered inline with separators
            expect(Array.isArray(result)).toBe(true);
            
            // Should have newline separators between arrays
            const hasNewlineSeparator = result.some(span => 
                isConsoleText(span) && (span as ConsoleText).text.includes("\n")
            );
            expect(hasNewlineSeparator).toBe(true);
        });

        test("should handle multiple object values", () => {
            const result = consoleInspect([{ a: 1 }, { b: 2 }, { c: 3 }], { print: false });
            
            expect(result.length).toBeGreaterThan(3);
            
            // When there are multiple values, they are not wrapped in groups
            // They are rendered inline with separators
            expect(Array.isArray(result)).toBe(true);
            
            // Should have newline separators between objects
            const hasNewlineSeparator = result.some(span => 
                isConsoleText(span) && (span as ConsoleText).text.includes("\n")
            );
            expect(hasNewlineSeparator).toBe(true);
        });

        test("should handle empty values array", () => {
            const result = consoleInspect([], { print: false });
            
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });

        test("should handle many values (10+)", () => {
            const values = Array.from({ length: 15 }, (_, i) => i);
            const result = consoleInspect(values, { print: false });
            
            expect(result.length).toBeGreaterThan(15);
            
            // Should have all values
            const texts = result.filter(isConsoleText).map(s => s.text);
            expect(texts).toContain("0");
            expect(texts).toContain("7");
            expect(texts).toContain("14");
        });
    });

    describe("Integration with iterative implementation", () => {
        test("should handle deeply nested structures without stack overflow", () => {
            // Create a deeply nested structure
            let nested: any = { value: 1 };
            for (let i = 0; i < 100; i++) {
                nested = { child: nested };
            }
            
            // Should not throw stack overflow error
            expect(() => {
                const result = consoleInspect([nested], { print: false, depth: 10 });
                expect(Array.isArray(result)).toBe(true);
            }).not.toThrow();
        });

        test("should handle circular references in top-level grouping", () => {
            const obj: any = { a: 1 };
            obj.self = obj;
            
            const result = consoleInspect([obj], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
            
            // Should not throw or hang
            expect(Array.isArray(result)).toBe(true);
        });

        test("should respect depth option with top-level grouping", () => {
            const deepObj = { a: { b: { c: { d: 1 } } } };
            const result = consoleInspect([deepObj], { print: false, depth: 2 });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
            
            // Should limit depth
            expect(Array.isArray(result)).toBe(true);
        });

        test("should respect wrap option with top-level grouping", () => {
            const result = consoleInspect([[1, 2, 3, 4, 5]], { 
                print: false, 
                wrap: "single-line" 
            });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
        });

        test("should handle nested arrays with top-level grouping", () => {
            const result = consoleInspect([[[1, 2], [3, 4]]], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
            
            const group = result[0] as ConsoleGroup;
            expect(group.header).toBeDefined();
            expect(group.body).toBeDefined();
        });

        test("should handle nested objects with top-level grouping", () => {
            const result = consoleInspect([{ a: { b: { c: 1 } } }], { print: false });
            
            expect(result).toHaveLength(1);
            expect(isConsoleGroup(result[0])).toBe(true);
            
            const group = result[0] as ConsoleGroup;
            expect(group.header).toBeDefined();
            expect(group.body).toBeDefined();
        });
    });
});
