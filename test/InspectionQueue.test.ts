import { describe, expect, test } from "vitest";
import { InspectionQueue } from "../src/inspect/iterative/InspectionQueue";
import { InspectionTask } from "../src/inspect/iterative/InspectionTask";
import type ConsoleInspection from "../src/inspect/utils/ConsoleInspection";

describe("InspectionQueue", () => {
    test("isEmpty returns true for new queue", () => {
        const queue = new InspectionQueue();
        expect(queue.isEmpty()).toBe(true);
    });

    test("isEmpty returns false after enqueue", () => {
        const queue = new InspectionQueue();
        const task: InspectionTask = {
            value: 42,
            options: {
                depth: 3,
                indent: 2,
                wrap: "auto" as const,
                theme: "dark" as const,
                keys: undefined,
            },
            context: {
                depth: 0,
                wrap: 80,
                keys: new Set(),
                circular: new Set(),
            },
            onComplete: () => {},
        };
        
        queue.enqueue(task);
        expect(queue.isEmpty()).toBe(false);
    });

    test("dequeue returns undefined for empty queue", () => {
        const queue = new InspectionQueue();
        expect(queue.dequeue()).toBeUndefined();
    });

    test("dequeue returns enqueued task", () => {
        const queue = new InspectionQueue();
        const task: InspectionTask = {
            value: "test",
            options: {
                depth: 3,
                indent: 2,
                wrap: "auto" as const,
                theme: "dark" as const,
                keys: undefined,
            },
            context: {
                depth: 0,
                wrap: 80,
                keys: new Set(),
                circular: new Set(),
            },
            onComplete: () => {},
        };
        
        queue.enqueue(task);
        const dequeued = queue.dequeue();
        
        expect(dequeued).toBe(task);
        expect(queue.isEmpty()).toBe(true);
    });

    test("LIFO ordering - last in, first out", () => {
        const queue = new InspectionQueue();
        const results: number[] = [];
        
        const task1: InspectionTask = {
            value: 1,
            options: {
                depth: 3,
                indent: 2,
                wrap: "auto" as const,
                theme: "dark" as const,
                keys: undefined,
            },
            context: {
                depth: 0,
                wrap: 80,
                keys: new Set(),
                circular: new Set(),
            },
            onComplete: (inspection: ConsoleInspection) => {
                results.push(1);
            },
        };
        
        const task2: InspectionTask = {
            value: 2,
            options: {
                depth: 3,
                indent: 2,
                wrap: "auto" as const,
                theme: "dark" as const,
                keys: undefined,
            },
            context: {
                depth: 0,
                wrap: 80,
                keys: new Set(),
                circular: new Set(),
            },
            onComplete: (inspection: ConsoleInspection) => {
                results.push(2);
            },
        };
        
        const task3: InspectionTask = {
            value: 3,
            options: {
                depth: 3,
                indent: 2,
                wrap: "auto" as const,
                theme: "dark" as const,
                keys: undefined,
            },
            context: {
                depth: 0,
                wrap: 80,
                keys: new Set(),
                circular: new Set(),
            },
            onComplete: (inspection: ConsoleInspection) => {
                results.push(3);
            },
        };
        
        // Enqueue in order: 1, 2, 3
        queue.enqueue(task1);
        queue.enqueue(task2);
        queue.enqueue(task3);
        
        // Dequeue should return in reverse order: 3, 2, 1 (LIFO)
        const dequeued1 = queue.dequeue();
        const dequeued2 = queue.dequeue();
        const dequeued3 = queue.dequeue();
        
        expect(dequeued1?.value).toBe(3);
        expect(dequeued2?.value).toBe(2);
        expect(dequeued3?.value).toBe(1);
        expect(queue.isEmpty()).toBe(true);
    });

    test("multiple enqueue and dequeue operations", () => {
        const queue = new InspectionQueue();
        
        const createTask = (value: number): InspectionTask => ({
            value,
            options: {
                depth: 3,
                indent: 2,
                wrap: "auto" as const,
                theme: "dark" as const,
                keys: undefined,
            },
            context: {
                depth: 0,
                wrap: 80,
                keys: new Set(),
                circular: new Set(),
            },
            onComplete: () => {},
        });
        
        // Enqueue 1, 2
        queue.enqueue(createTask(1));
        queue.enqueue(createTask(2));
        
        // Dequeue 2
        expect(queue.dequeue()?.value).toBe(2);
        expect(queue.isEmpty()).toBe(false);
        
        // Enqueue 3, 4
        queue.enqueue(createTask(3));
        queue.enqueue(createTask(4));
        
        // Dequeue 4, 3, 1
        expect(queue.dequeue()?.value).toBe(4);
        expect(queue.dequeue()?.value).toBe(3);
        expect(queue.dequeue()?.value).toBe(1);
        expect(queue.isEmpty()).toBe(true);
    });

    test("isEmpty returns true after all tasks dequeued", () => {
        const queue = new InspectionQueue();
        
        const task: InspectionTask = {
            value: "test",
            options: {
                depth: 3,
                indent: 2,
                wrap: "auto" as const,
                theme: "dark" as const,
                keys: undefined,
            },
            context: {
                depth: 0,
                wrap: 80,
                keys: new Set(),
                circular: new Set(),
            },
            onComplete: () => {},
        };
        
        queue.enqueue(task);
        expect(queue.isEmpty()).toBe(false);
        
        queue.dequeue();
        expect(queue.isEmpty()).toBe(true);
    });
});
