import { describe, test, expect, vi, beforeEach } from "vitest";
import consoleInspect from "../src/inspect/consoleInspect";

/**
 * Deep Nesting Tests
 * 
 * **Validates: Requirements 1.5**
 * 
 * These tests verify that the iterative inspect implementation can handle
 * arbitrarily deep nesting without stack overflow errors. The recursive
 * implementation would fail on these tests with "Maximum call stack exceeded".
 */

describe("Deep Nesting - Performance Validation", () => {
    beforeEach(() => {
        // Mock matchMedia for theme detection
        Object.defineProperty(window, "matchMedia", {
            configurable: true,
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
    });
    /**
     * Helper function to create a deeply nested object structure
     * @param depth - The nesting depth to create
     * @returns A deeply nested object
     */
    function createDeeplyNestedObject(depth: number): any {
        let nested: any = { value: depth };
        for (let i = depth - 1; i >= 0; i--) {
            nested = { level: i, child: nested };
        }
        return nested;
    }

    /**
     * Helper function to create a deeply nested array structure
     * @param depth - The nesting depth to create
     * @returns A deeply nested array
     */
    function createDeeplyNestedArray(depth: number): any {
        let nested: any = [depth];
        for (let i = depth - 1; i >= 0; i--) {
            nested = [i, nested];
        }
        return nested;
    }

    /**
     * Helper function to create a mixed deeply nested structure (objects and arrays)
     * @param depth - The nesting depth to create
     * @returns A deeply nested mixed structure
     */
    function createDeeplyNestedMixed(depth: number): any {
        let nested: any = { value: depth };
        for (let i = depth - 1; i >= 0; i--) {
            if (i % 2 === 0) {
                nested = { level: i, child: nested };
            } else {
                nested = [i, nested];
            }
        }
        return nested;
    }

    test("should handle 1000-level nested objects without stack overflow", () => {
        const nested = createDeeplyNestedObject(1000);
        
        // Should not throw stack overflow error
        expect(() => {
            const result = consoleInspect([nested], { print: false, depth: 10, theme: "dark" });
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        }).not.toThrow();
    });

    test("should handle 1000-level nested arrays without stack overflow", () => {
        const nested = createDeeplyNestedArray(1000);
        
        // Should not throw stack overflow error
        expect(() => {
            const result = consoleInspect([nested], { print: false, depth: 10, theme: "dark" });
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        }).not.toThrow();
    });

    test("should handle 1000-level mixed nested structures without stack overflow", () => {
        const nested = createDeeplyNestedMixed(1000);
        
        // Should not throw stack overflow error
        expect(() => {
            const result = consoleInspect([nested], { print: false, depth: 10, theme: "dark" });
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        }).not.toThrow();
    });

    test("should handle 5000-level nested objects without stack overflow", () => {
        const nested = createDeeplyNestedObject(5000);
        
        // Should not throw stack overflow error
        expect(() => {
            const result = consoleInspect([nested], { print: false, depth: 10, theme: "dark" });
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        }).not.toThrow();
    });

    test("should handle 5000-level nested arrays without stack overflow", () => {
        const nested = createDeeplyNestedArray(5000);
        
        // Should not throw stack overflow error
        expect(() => {
            const result = consoleInspect([nested], { print: false, depth: 10, theme: "dark" });
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        }).not.toThrow();
    });

    test("should handle 5000-level mixed nested structures without stack overflow", () => {
        const nested = createDeeplyNestedMixed(5000);
        
        // Should not throw stack overflow error
        expect(() => {
            const result = consoleInspect([nested], { print: false, depth: 10, theme: "dark" });
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        }).not.toThrow();
    });

    test("should handle 10000-level nested objects without stack overflow", () => {
        const nested = createDeeplyNestedObject(10000);
        
        // Should not throw stack overflow error
        expect(() => {
            const result = consoleInspect([nested], { print: false, depth: 10, theme: "dark" });
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        }).not.toThrow();
    });

    test("should handle 10000-level nested arrays without stack overflow", () => {
        const nested = createDeeplyNestedArray(10000);
        
        // Should not throw stack overflow error
        expect(() => {
            const result = consoleInspect([nested], { print: false, depth: 10, theme: "dark" });
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        }).not.toThrow();
    });

    test("should handle 10000-level mixed nested structures without stack overflow", () => {
        const nested = createDeeplyNestedMixed(10000);
        
        // Should not throw stack overflow error
        expect(() => {
            const result = consoleInspect([nested], { print: false, depth: 10, theme: "dark" });
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        }).not.toThrow();
    });

    test("should respect depth limit even with deeply nested structures", () => {
        const nested = createDeeplyNestedObject(1000);
        
        // With depth limit of 3, should only expand 3 levels
        const result = consoleInspect([nested], { print: false, depth: 3, theme: "dark" });
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        
        // The result should be finite and not expand all 1000 levels
        // With depth 3, we should see a reasonable output size (not expanding all 1000 levels)
        const resultStr = JSON.stringify(result);
        expect(resultStr.length).toBeLessThan(50000); // Should be much smaller than full expansion
    });

    test("should handle deeply nested structures with circular references", () => {
        // Create a deeply nested structure
        let nested: any = { value: 100 };
        for (let i = 99; i >= 0; i--) {
            nested = { level: i, child: nested };
        }
        
        // Add a circular reference at the top
        nested.circular = nested;
        
        // Should not throw stack overflow error or infinite loop
        expect(() => {
            const result = consoleInspect([nested], { print: false, depth: 10, theme: "dark" });
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        }).not.toThrow();
    });

    test("should handle deeply nested structures with multiple values", () => {
        const nested1 = createDeeplyNestedObject(1000);
        const nested2 = createDeeplyNestedArray(1000);
        const nested3 = createDeeplyNestedMixed(1000);
        
        // Should handle multiple deeply nested values
        expect(() => {
            const result = consoleInspect([nested1, nested2, nested3], { 
                print: false, 
                depth: 10,
                theme: "dark"
            });
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        }).not.toThrow();
    });

    test("should handle deeply nested structures with different wrap modes", () => {
        const nested = createDeeplyNestedObject(1000);
        
        // Test with single-line wrap
        expect(() => {
            const result = consoleInspect([nested], { 
                print: false, 
                depth: 10,
                wrap: "single-line",
                theme: "dark"
            });
            expect(Array.isArray(result)).toBe(true);
        }).not.toThrow();
        
        // Test with multi-line wrap
        expect(() => {
            const result = consoleInspect([nested], { 
                print: false, 
                depth: 10,
                wrap: "multi-line",
                theme: "dark"
            });
            expect(Array.isArray(result)).toBe(true);
        }).not.toThrow();
        
        // Test with auto wrap
        expect(() => {
            const result = consoleInspect([nested], { 
                print: false, 
                depth: 10,
                wrap: "auto",
                theme: "dark"
            });
            expect(Array.isArray(result)).toBe(true);
        }).not.toThrow();
    });
});
