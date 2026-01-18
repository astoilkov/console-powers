import { InspectionTask } from "./InspectionTask";

/**
 * A work queue for managing inspection tasks in the iterative inspection system.
 * 
 * **LIFO (Stack) Strategy:**
 * 
 * Uses a stack (LIFO - Last In, First Out) data structure to maintain depth-first
 * traversal order, which matches the behavior of the original recursive implementation.
 * This ensures that output ordering remains identical to the recursive approach.
 * 
 * Why LIFO?
 * - When inspecting { a: 1, b: { c: 2 } }, we want to fully process "a" before "b"
 * - With LIFO: enqueue(a), enqueue(b) → dequeue returns b, then a
 * - This processes the most recently added task first (depth-first)
 * - Matches recursive behavior: inspect(obj) → inspect(b) → inspect(c) → back to b → back to obj → inspect(a)
 * 
 * Alternative (FIFO) would process breadth-first:
 * - Would process all properties at the same level before going deeper
 * - Would change output ordering compared to recursive implementation
 * 
 * **Task Flow Example:**
 * 
 * For object { x: 1, y: { z: 2 } }:
 * 1. Enqueue root task
 * 2. Dequeue root → enqueue x task, enqueue y task
 * 3. Dequeue y task (LIFO) → enqueue z task
 * 4. Dequeue z task → process primitive 2
 * 5. Dequeue x task → process primitive 1
 * 6. Results assembled via callbacks
 * 
 * The queue stores InspectionTask objects that contain the value to inspect,
 * options, context, and a callback to handle the result.
 */
export class InspectionQueue {
    /**
     * Internal array storing the tasks. New tasks are added to the end (push)
     * and removed from the end (pop) to achieve LIFO behavior.
     */
    private tasks: InspectionTask[] = [];
    
    /**
     * Adds a new inspection task to the queue.
     * Tasks are added to the end of the array for LIFO processing.
     * 
     * @param task - The inspection task to add to the queue
     */
    enqueue(task: InspectionTask): void {
        this.tasks.push(task);
    }
    
    /**
     * Removes and returns the next task to process from the queue.
     * Returns the most recently added task (LIFO/stack behavior).
     * 
     * @returns The next task to process, or undefined if the queue is empty
     */
    dequeue(): InspectionTask | undefined {
        return this.tasks.pop();
    }
    
    /**
     * Checks whether the queue has any remaining tasks to process.
     * 
     * @returns true if the queue is empty, false if tasks remain
     */
    isEmpty(): boolean {
        return this.tasks.length === 0;
    }
}
