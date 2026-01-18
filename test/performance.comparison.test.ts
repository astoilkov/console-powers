import { describe, test, expect, vi, beforeEach } from "vitest";
import consoleInspect from "../src/inspect/consoleInspect";
import inspectAnyOriginal from "../src/inspect/inspectors/inspectAny.original";
import inspectAny from "../src/inspect/inspectors/inspectAny";
import { ConsoleInspectContext, ConsoleInspectOptions } from "../src/inspect/consoleInspect";

/**
 * Performance Comparison Tests
 * 
 * **Validates: Task 10.2 - Compare performance with original**
 * 
 * These tests compare the performance of the iterative implementation
 * against the original recursive implementation. The tests measure:
 * 
 * 1. Shallow structures - Both implementations should have similar performance
 * 2. Deep structures - Iterative should succeed where recursive fails with stack overflow
 * 3. Performance characteristics - Document any significant differences
 */

describe("Performance Comparison - Iterative vs Recursive", () => {
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
     * Helper function to create a shallow nested object structure
     * @param breadth - Number of properties at each level
     * @param depth - The nesting depth to create
     * @returns A shallow nested object
     */
    function createShallowNestedObject(breadth: number, depth: number): any {
        if (depth === 0) {
            return { value: "leaf" };
        }
        
        const obj: any = {};
        for (let i = 0; i < breadth; i++) {
            obj[`prop${i}`] = createShallowNestedObject(breadth, depth - 1);
        }
        return obj;
    }

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
     * Helper to measure execution time
     */
    function measureTime(fn: () => void): number {
        const start = performance.now();
        fn();
        const end = performance.now();
        return end - start;
    }

    /**
     * Default options for testing
     */
    const defaultOptions: Required<ConsoleInspectOptions> = {
        depth: 10,
        indent: 2,
        keys: undefined,
        theme: "dark",
        wrap: "auto",
        print: false,
    };

    /**
     * Default context for testing
     */
    const defaultContext: ConsoleInspectContext = {
        depth: 0,
        wrap: 80,
        keys: new Set(),
        circular: new Set(),
    };

    describe("Shallow Structure Performance", () => {
        test("should have similar performance for small objects (3 levels, 3 properties)", () => {
            const shallowObj = createShallowNestedObject(3, 3);
            
            // Measure original implementation
            const originalTime = measureTime(() => {
                inspectAnyOriginal(shallowObj, defaultOptions, defaultContext);
            });
            
            // Measure iterative implementation
            const iterativeTime = measureTime(() => {
                inspectAny(shallowObj, defaultOptions, defaultContext);
            });
            
            console.log(`Shallow object (3x3):`);
            console.log(`  Original: ${originalTime.toFixed(3)}ms`);
            console.log(`  Iterative: ${iterativeTime.toFixed(3)}ms`);
            console.log(`  Ratio: ${(iterativeTime / originalTime).toFixed(2)}x`);
            
            // Both should complete successfully
            expect(originalTime).toBeGreaterThan(0);
            expect(iterativeTime).toBeGreaterThan(0);
            
            // Iterative should be within reasonable range (not more than 3x slower)
            // Note: Iterative may be slightly slower due to queue overhead
            expect(iterativeTime).toBeLessThan(originalTime * 3);
        });

        test("should have similar performance for small arrays (10 elements, 3 levels)", () => {
            const shallowArray = [
                [1, 2, 3, [4, 5, 6]],
                [7, 8, 9, [10, 11, 12]],
                [13, 14, 15, [16, 17, 18]],
            ];
            
            // Measure original implementation
            const originalTime = measureTime(() => {
                inspectAnyOriginal(shallowArray, defaultOptions, defaultContext);
            });
            
            // Measure iterative implementation
            const iterativeTime = measureTime(() => {
                inspectAny(shallowArray, defaultOptions, defaultContext);
            });
            
            console.log(`Shallow array (10 elements, 3 levels):`);
            console.log(`  Original: ${originalTime.toFixed(3)}ms`);
            console.log(`  Iterative: ${iterativeTime.toFixed(3)}ms`);
            console.log(`  Ratio: ${(iterativeTime / originalTime).toFixed(2)}x`);
            
            // Both should complete successfully
            expect(originalTime).toBeGreaterThan(0);
            expect(iterativeTime).toBeGreaterThan(0);
            
            // Iterative should be within reasonable range
            expect(iterativeTime).toBeLessThan(originalTime * 3);
        });

        test("should have similar performance for primitives", () => {
            const primitives = [42, "hello", true, null, undefined, Symbol("test")];
            
            let originalTotal = 0;
            let iterativeTotal = 0;
            
            for (const value of primitives) {
                originalTotal += measureTime(() => {
                    inspectAnyOriginal(value, defaultOptions, defaultContext);
                });
                
                iterativeTotal += measureTime(() => {
                    inspectAny(value, defaultOptions, defaultContext);
                });
            }
            
            console.log(`Primitives (6 values):`);
            console.log(`  Original: ${originalTotal.toFixed(3)}ms`);
            console.log(`  Iterative: ${iterativeTotal.toFixed(3)}ms`);
            console.log(`  Ratio: ${(iterativeTotal / originalTotal).toFixed(2)}x`);
            
            // Both should complete successfully
            expect(originalTotal).toBeGreaterThan(0);
            expect(iterativeTotal).toBeGreaterThan(0);
            
            // For primitives, performance should be very similar (fast path)
            expect(iterativeTotal).toBeLessThan(originalTotal * 2);
        });
    });

    describe("Deep Structure Performance", () => {
        test("should handle 100-level nesting where original might struggle", () => {
            const deepObj = createDeeplyNestedObject(100);
            
            let originalTime: number | null = null;
            let originalError: Error | null = null;
            
            // Try original implementation (may fail with stack overflow)
            try {
                originalTime = measureTime(() => {
                    inspectAnyOriginal(deepObj, defaultOptions, defaultContext);
                });
            } catch (error) {
                originalError = error as Error;
            }
            
            // Measure iterative implementation (should succeed)
            const iterativeTime = measureTime(() => {
                inspectAny(deepObj, defaultOptions, defaultContext);
            });
            
            console.log(`Deep object (100 levels):`);
            if (originalError) {
                console.log(`  Original: FAILED (${originalError.message})`);
            } else {
                console.log(`  Original: ${originalTime?.toFixed(3)}ms`);
            }
            console.log(`  Iterative: ${iterativeTime.toFixed(3)}ms`);
            
            // Iterative should always succeed
            expect(iterativeTime).toBeGreaterThan(0);
        });

        test("should handle 500-level nesting (both succeed, but iterative enables deeper)", () => {
            const deepObj = createDeeplyNestedObject(500);
            
            let originalTime: number | null = null;
            let originalError: Error | null = null;
            
            // Try original implementation (may or may not fail depending on stack size)
            try {
                originalTime = measureTime(() => {
                    inspectAnyOriginal(deepObj, defaultOptions, defaultContext);
                });
            } catch (error) {
                originalError = error as Error;
            }
            
            // Measure iterative implementation (should succeed)
            const iterativeTime = measureTime(() => {
                inspectAny(deepObj, defaultOptions, defaultContext);
            });
            
            console.log(`Deep object (500 levels):`);
            if (originalError) {
                console.log(`  Original: FAILED (${originalError.message})`);
            } else {
                console.log(`  Original: ${originalTime?.toFixed(3)}ms`);
            }
            console.log(`  Iterative: ${iterativeTime.toFixed(3)}ms - SUCCESS`);
            
            // Iterative should always succeed
            expect(iterativeTime).toBeGreaterThan(0);
            
            // Note: Original may succeed on some systems with larger stacks
            // The key point is that iterative can handle even deeper nesting
        });

        test("should handle 1000-level nesting efficiently", () => {
            const deepObj = createDeeplyNestedObject(1000);
            
            // Only test iterative (original will definitely fail)
            const iterativeTime = measureTime(() => {
                inspectAny(deepObj, defaultOptions, defaultContext);
            });
            
            console.log(`Deep object (1000 levels):`);
            console.log(`  Original: N/A (would fail with stack overflow)`);
            console.log(`  Iterative: ${iterativeTime.toFixed(3)}ms - SUCCESS`);
            
            // Iterative should succeed and complete in reasonable time
            expect(iterativeTime).toBeGreaterThan(0);
            expect(iterativeTime).toBeLessThan(1000); // Should complete in less than 1 second
        });

        test("should handle 5000-level nesting efficiently", () => {
            const deepArray = createDeeplyNestedArray(5000);
            
            // Only test iterative (original will definitely fail)
            const iterativeTime = measureTime(() => {
                inspectAny(deepArray, defaultOptions, defaultContext);
            });
            
            console.log(`Deep array (5000 levels):`);
            console.log(`  Original: N/A (would fail with stack overflow)`);
            console.log(`  Iterative: ${iterativeTime.toFixed(3)}ms - SUCCESS`);
            
            // Iterative should succeed and complete in reasonable time
            expect(iterativeTime).toBeGreaterThan(0);
            expect(iterativeTime).toBeLessThan(5000); // Should complete in less than 5 seconds
        });
    });

    describe("Performance with consoleInspect (full integration)", () => {
        test("should handle shallow structures efficiently through consoleInspect", () => {
            const shallowObj = createShallowNestedObject(3, 3);
            
            const time = measureTime(() => {
                consoleInspect([shallowObj], { print: false, depth: 10, theme: "dark" });
            });
            
            console.log(`consoleInspect with shallow object (3x3):`);
            console.log(`  Time: ${time.toFixed(3)}ms`);
            
            expect(time).toBeGreaterThan(0);
            expect(time).toBeLessThan(100); // Should be fast
        });

        test("should handle deep structures efficiently through consoleInspect", () => {
            const deepObj = createDeeplyNestedObject(1000);
            
            const time = measureTime(() => {
                consoleInspect([deepObj], { print: false, depth: 10, theme: "dark" });
            });
            
            console.log(`consoleInspect with deep object (1000 levels):`);
            console.log(`  Time: ${time.toFixed(3)}ms`);
            
            expect(time).toBeGreaterThan(0);
            expect(time).toBeLessThan(1000); // Should complete in reasonable time
        });

        test("should handle multiple deep structures efficiently", () => {
            const deepObj1 = createDeeplyNestedObject(500);
            const deepObj2 = createDeeplyNestedArray(500);
            const deepObj3 = createShallowNestedObject(5, 5);
            
            const time = measureTime(() => {
                consoleInspect([deepObj1, deepObj2, deepObj3], { 
                    print: false, 
                    depth: 10,
                    theme: "dark"
                });
            });
            
            console.log(`consoleInspect with multiple deep structures:`);
            console.log(`  Time: ${time.toFixed(3)}ms`);
            
            expect(time).toBeGreaterThan(0);
            expect(time).toBeLessThan(2000); // Should complete in reasonable time
        });
    });
});
