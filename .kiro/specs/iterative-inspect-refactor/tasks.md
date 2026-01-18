# Implementation Plan: Iterative Inspect System Refactor

## Overview

This implementation plan converts the recursive inspect system to an iterative one using a work queue. The approach is to build the infrastructure first, then refactor each inspector function incrementally, and finally integrate everything while ensuring all tests pass.

## Tasks

- [x] 1. Preserve original implementation for comparison testing
  - Create a copy of the current recursive implementation
  - Save `inspectAny.ts`, `inspectIterable.ts`, and `inspectObject.ts` as `inspectAny.original.ts`, etc.
  - These will be used for backward compatibility testing
  - _Requirements: 2.1, 6.1_

- [ ] 2. Create work queue infrastructure
  - [x] 2.1 Define InspectionTask interface
    - Create interface with value, options, context, and onComplete callback
    - Place in new file `src/inspect/iterative/InspectionTask.ts`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 2.2 Implement InspectionQueue class
    - Create class with enqueue, dequeue, and isEmpty methods
    - Use array with push/pop for LIFO (stack) behavior
    - Place in new file `src/inspect/iterative/InspectionQueue.ts`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 2.3 Write unit tests for InspectionQueue
    - Test enqueue, dequeue, isEmpty operations
    - Test LIFO ordering
    - Test empty queue behavior
    - _Requirements: 7.2, 7.3, 7.4_

- [ ] 3. Create main iterative inspection function
  - [x] 3.1 Implement inspectIterative function skeleton
    - Create function that takes value, options, context
    - Initialize work queue
    - Implement main processing loop (while queue not empty)
    - Place in new file `src/inspect/iterative/inspectIterative.ts`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 3.2 Implement primitive value handling
    - Handle primitives synchronously without queueing
    - Call inspectPrimitive and return immediately
    - _Requirements: 2.7_
  
  - [x] 3.3 Implement circular reference detection
    - Check context.circular before processing
    - Return "[Circular]" span if detected
    - _Requirements: 3.1, 3.4_

- [ ] 4. Refactor iterable inspection for iterative processing
  - [x] 4.1 Create iterative version of inspectIterable
    - Modify to create child tasks instead of calling inspectAny recursively
    - Implement result collection through callbacks
    - Handle single-line format
    - Handle multi-line format
    - Update context (depth, circular, wrap) for child tasks
    - _Requirements: 2.8, 4.1, 4.2, 5.6, 5.7, 8.1, 8.2, 8.3_
  
  - [x] 4.2 Handle depth limiting for iterables
    - Check if context.depth >= options.depth
    - Return consoleObject representation if limit exceeded
    - _Requirements: 2.3, 4.1, 4.2_
  
  - [x] 4.3 Handle array extra keys (non-numeric properties)
    - Process extra keys as separate child tasks
    - Maintain existing formatting for extra keys
    - _Requirements: 2.8_

- [ ] 5. Refactor object inspection for iterative processing
  - [x] 5.1 Create iterative version of inspectObject
    - Modify to create child tasks instead of calling inspectAny recursively
    - Implement result collection through callbacks
    - Handle single-line format
    - Handle multi-line format
    - Update context (depth, circular, wrap) for child tasks
    - _Requirements: 2.9, 4.1, 4.2, 5.6, 5.7, 8.1, 8.2, 8.3_
  
  - [x] 5.2 Handle depth limiting for objects
    - Check if context.depth >= options.depth
    - Return consoleObject representation if limit exceeded
    - Check isPlainObject before expanding
    - _Requirements: 2.3, 2.10, 4.1, 4.2_
  
  - [x] 5.3 Handle keys filtering
    - Respect context.keys Set when iterating object properties
    - Use existing keys() utility function
    - _Requirements: 2.5, 8.4_

- [ ] 6. Handle Map entry inspection iteratively
  - [x] 6.1 Refactor inspectEntry function
    - Modify to work with task-based approach
    - Handle non-primitive keys by creating object inspection tasks
    - Handle primitive keys with inline formatting
    - _Requirements: 2.8_

- [ ] 7. Integrate iterative implementation
  - [x] 7.1 Update inspectAny to use inspectIterative
    - Replace direct calls to inspectIterable and inspectObject
    - Route through inspectIterative for non-primitives
    - Maintain primitive fast path
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1_
  
  - [x] 7.2 Update consoleInspect to work with new implementation
    - Ensure top-level grouping still works correctly
    - Verify separator handling (space vs newline)
    - Test with single and multiple values
    - _Requirements: 2.1, 5.1, 5.2_

- [x] 8. Checkpoint - Run existing test suite
  - Run all tests in test/consoleInspect.test.ts
  - Verify all existing tests pass without modification
  - Fix any failures before proceeding
  - _Requirements: 6.1_

- [ ]* 9. Add property-based tests
  - [ ]* 9.1 Write property test for deep nesting
    - **Property 1: Deep Nesting Without Stack Overflow**
    - **Validates: Requirements 1.5**
    - Generate nested structures with depth 100-10000
    - Test nested objects, nested arrays, mixed nesting
    - Verify no stack overflow errors
    - Use fast-check with minimum 100 iterations
  
  - [ ]* 9.2 Write property test for backward compatibility
    - **Property 2: Backward Compatibility - Output Equivalence**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 3.1, 3.4, 4.1, 4.2, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7**
    - Generate random values (primitives, objects, arrays, circular refs)
    - Generate random options (depth, indent, wrap, theme, keys)
    - Compare output from original and refactored implementations
    - Define structural equivalence comparison
    - Use fast-check with minimum 100 iterations
  
  - [ ]* 9.3 Write unit tests for edge cases
    - Test empty work queue handling
    - Test single-element structures
    - Test specific circular reference patterns
    - Test boundary depth values (0, 1, max)
    - Test wrap width edge cases

- [ ] 10. Performance validation
  - [x] 10.1 Test deeply nested structures
    - Create test with 1000-level nesting
    - Create test with 5000-level nesting
    - Create test with 10000-level nesting
    - Verify all complete successfully
    - _Requirements: 1.5_
  
  - [x] 10.2 Compare performance with original
    - Measure time for shallow structures (should be similar)
    - Measure time for deep structures (iterative should succeed where recursive fails)
    - Document any performance differences

- [x] 11. Final checkpoint - Comprehensive validation
  - Ensure all existing tests pass
  - Ensure all new property tests pass
  - Verify deep nesting works without errors
  - Verify output is identical to original for all test cases
  - Ask the user if questions arise

- [ ] 12. Cleanup and documentation
  - [x] 12.1 Remove original implementation copies
    - Delete `*.original.ts` files used for comparison testing
    - Keep only the new iterative implementation
  
  - [x] 12.2 Add code comments
    - Document the work queue approach
    - Explain task creation and callback patterns
    - Document context management (depth, circular, wrap)
  
  - [x] 12.3 Update any relevant documentation
    - Note the change from recursive to iterative
    - Highlight the deep nesting capability
    - Document any performance characteristics

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The implementation follows an incremental approach: infrastructure → refactor → integrate → test
- Checkpoint at task 8 ensures existing functionality is preserved before adding new tests
- Property tests validate the core requirements: deep nesting capability and backward compatibility
- The original implementation is preserved temporarily for comparison testing, then removed
