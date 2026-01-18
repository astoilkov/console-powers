# Requirements Document

## Introduction

The inspect system currently uses recursive function calls to traverse nested data structures (objects, arrays, Maps, Sets). When inspecting deeply nested objects, this causes "Maximum call stack exceeded" errors. This feature refactors the inspection system to use an iterative approach with a work queue and while loops, enabling the system to handle arbitrarily deep nesting without stack overflow while maintaining all existing functionality.

## Glossary

- **Inspect_System**: The collection of functions responsible for converting JavaScript values into ConsoleSpan representations for display
- **Inspector**: A function that converts a specific type of value (primitive, iterable, object) into a ConsoleInspection
- **Work_Queue**: A data structure (stack or queue) that holds pending inspection tasks to be processed iteratively
- **Inspection_Task**: A unit of work representing a value that needs to be inspected along with its context
- **ConsoleInspection**: The output format from an inspector, containing type ("inline" or "block") and an array of ConsoleSpans
- **ConsoleSpan**: A display element (ConsoleText, ConsoleObject, ConsoleGroup, etc.)
- **Circular_Reference**: A situation where an object contains a reference to itself, either directly or through a chain of references
- **Depth_Tracking**: The mechanism for limiting how many levels deep the inspection will traverse into nested structures

## Requirements

### Requirement 1: Iterative Processing Architecture

**User Story:** As a developer, I want the inspect system to use iterative processing instead of recursion, so that deeply nested structures can be inspected without stack overflow errors.

#### Acceptance Criteria

1. THE Inspect_System SHALL use a Work_Queue to manage pending inspection tasks
2. THE Inspect_System SHALL process inspection tasks using while loops instead of recursive function calls
3. WHEN inspecting nested structures, THE Inspect_System SHALL add child inspection tasks to the Work_Queue
4. THE Inspect_System SHALL continue processing until the Work_Queue is empty
5. THE Inspect_System SHALL handle arbitrarily deep nesting without exceeding the call stack

### Requirement 2: Maintain Existing Functionality

**User Story:** As a user of the inspect system, I want all existing functionality to work exactly as before, so that the refactoring is transparent to me.

#### Acceptance Criteria

1. THE Inspect_System SHALL produce identical output for all previously supported input types
2. THE Inspect_System SHALL support all wrap modes: "auto", "single-line", and "multi-line"
3. THE Inspect_System SHALL respect the depth option for limiting inspection depth
4. THE Inspect_System SHALL respect the indent option for formatting nested structures
5. THE Inspect_System SHALL respect the keys option for filtering object properties
6. THE Inspect_System SHALL respect the theme option for styling output
7. THE Inspect_System SHALL handle primitives (undefined, null, boolean, number, bigint, string, symbol)
8. THE Inspect_System SHALL handle iterables (Array, Set, Map)
9. THE Inspect_System SHALL handle plain objects
10. THE Inspect_System SHALL handle non-plain objects (Date, RegExp, Error, class instances, functions)

### Requirement 3: Circular Reference Handling

**User Story:** As a developer, I want circular references to be detected and displayed correctly, so that the inspection doesn't enter infinite loops.

#### Acceptance Criteria

1. WHEN a value has already been encountered in the current inspection path, THE Inspect_System SHALL mark it as "[Circular]"
2. THE Inspect_System SHALL track circular references using the context.circular Set
3. THE Inspect_System SHALL add values to the circular Set before inspecting their children
4. THE Inspect_System SHALL display "[Circular]" with dimmed styling for circular references

### Requirement 4: Depth Tracking

**User Story:** As a user, I want to control how deep the inspection traverses into nested structures, so that I can limit output for very deep objects.

#### Acceptance Criteria

1. WHEN the current depth equals or exceeds the configured depth limit, THE Inspect_System SHALL stop expanding nested structures
2. THE Inspect_System SHALL display non-expanded objects using consoleObject representation
3. THE Inspect_System SHALL increment depth when inspecting children of objects and iterables
4. THE Inspect_System SHALL pass updated depth context to child inspection tasks

### Requirement 5: Output Format Preservation

**User Story:** As a consumer of the inspect system, I want the output format to remain unchanged, so that existing code continues to work.

#### Acceptance Criteria

1. THE Inspect_System SHALL return ConsoleInspection objects with type "inline" or "block"
2. THE Inspect_System SHALL return ConsoleInspection objects with a spans array
3. WHEN inspecting primitives, THE Inspect_System SHALL return inline inspections
4. WHEN inspecting objects and arrays that fit on one line, THE Inspect_System SHALL return inline inspections in "auto" mode
5. WHEN inspecting objects and arrays that don't fit on one line, THE Inspect_System SHALL return block inspections in "auto" mode
6. WHEN wrap mode is "single-line", THE Inspect_System SHALL return inline inspections for objects and arrays
7. WHEN wrap mode is "multi-line", THE Inspect_System SHALL return block inspections for objects and arrays

### Requirement 6: Test Compatibility

**User Story:** As a maintainer, I want all existing tests to pass after the refactoring, so that I can be confident the refactoring is correct.

#### Acceptance Criteria

1. THE Inspect_System SHALL pass all existing unit tests without modification
2. THE Inspect_System SHALL handle all edge cases covered by existing tests
3. THE Inspect_System SHALL maintain the same behavior for circular references as verified by tests
4. THE Inspect_System SHALL maintain the same behavior for depth limiting as verified by tests
5. THE Inspect_System SHALL maintain the same behavior for all wrap modes as verified by tests

### Requirement 7: Work Queue Implementation

**User Story:** As a developer implementing the iterative approach, I want a clear work queue structure, so that the implementation is maintainable and understandable.

#### Acceptance Criteria

1. THE Work_Queue SHALL store Inspection_Tasks containing the value, options, context, and result destination
2. THE Work_Queue SHALL support adding new tasks
3. THE Work_Queue SHALL support retrieving the next task to process
4. THE Work_Queue SHALL support checking if more tasks remain
5. THE Work_Queue SHALL use a stack (LIFO) or queue (FIFO) data structure based on desired traversal order

### Requirement 8: Context Management

**User Story:** As a developer, I want context (depth, circular references, wrap width) to be properly managed across the iterative processing, so that all inspection rules are correctly applied.

#### Acceptance Criteria

1. WHEN creating child inspection tasks, THE Inspect_System SHALL create new context objects with updated depth
2. WHEN creating child inspection tasks, THE Inspect_System SHALL create new circular Sets with the parent value added
3. WHEN creating child inspection tasks, THE Inspect_System SHALL calculate updated wrap width based on indentation
4. THE Inspect_System SHALL preserve the keys Set across all inspection tasks
