# `console-powers`

> Craft beautiful browser console messages.  
> Debug & inspect data with elegant outputs.  
> Small & tree-shakable.

[![Gzipped Size](https://img.shields.io/bundlephobia/minzip/console-powers)](https://bundlephobia.com/result?p=console-powers)
[![Build Status](https://img.shields.io/github/actions/workflow/status/astoilkov/console-powers/main.yml?branch=main)](https://github.com/astoilkov/console-powers/actions/workflows/main.yml)

<!--
## Why
## Usage
## API
## Alternatives
## Related
-->

## Install

```bash
npm install console-powers
```

## Examples

### `consolePrint()`

<img src="/img/90s.png" width="320" />

```ts
import { consolePrint, consoleText } from "console-powers"

consolePrint(
    consoleText("90s", {
        fontSize: "200px",
    	color: "hsl(330, 100%, 50%)",
    	textShadow: "0 2px 0 hsl(330, 100%, 25%), 0 3px 2px hsla(330, 100%, 15%, 0.5), /* next */ 0 3px 0 hsl(350, 100%, 50%), 0 5px 0 hsl(350, 100%, 25%), 0 6px 2px hsla(350, 100%, 15%, 0.5), /* next */ 0 6px 0 hsl(20, 100%, 50%), 0 8px 0 hsl(20, 100%, 25%), 0 9px 2px hsla(20, 100%, 15%, 0.5), /* next */ 0 9px 0 hsl(50, 100%, 50%), 0 11px 0 hsl(50, 100%, 25%), 0 12px 2px hsla(50, 100%, 15%, 0.5), /* next */ 0 12px 0 hsl(70, 100%, 50%), 0 14px 0 hsl(70, 100%, 25%), 0 15px 2px hsla(70, 100%, 15%, 0.5), /* next */ 0 15px 0 hsl(90, 100%, 50%), 0 17px 0 hsl(90, 100%, 25%), 0 17px 2px hsla(90, 100%, 15%, 0.5)",
    })
)
```

### `consoleInspect()`

<img src="/img/inspect.png" width="320" />

```ts
import { consoleInspect } from "console-powers"

consoleInspect({
    type: "group",
    priority: 1,
    items: [{ type: "new" }, { type: "delimiter" }, { type: "value" }],
    location: {
        start: {
            line: 1,
            column: 0,
        },
        end: {
            line: 4,
            column: 10,
        },
    },
})
```

## API

#### `consolePrint(messages: ConsoleSpan[]): void`

Prints the provided messages to the console.

#### `consoleText(text: string, style?: ConsoleStyle): ConsoleSpan`

Creates a styled text in the console.

##### `ConsoleStyle`

- [`background`](https://developer.mozilla.org/en-US/docs/Web/CSS/background) and its longhand equivalents
- [`border`](https://developer.mozilla.org/en-US/docs/Web/CSS/border) and its longhand equivalents
- [`border-radius`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius)
- [`box-decoration-break`](https://developer.mozilla.org/en-US/docs/Web/CSS/box-decoration-break)
- [`box-shadow`](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow)
- [`clear`](https://developer.mozilla.org/en-US/docs/Web/CSS/clear) and [`float`](https://developer.mozilla.org/en-US/docs/Web/CSS/float)
- [`color`](https://developer.mozilla.org/en-US/docs/Web/CSS/color)
- [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display)
- [`font`](https://developer.mozilla.org/en-US/docs/Web/CSS/font) and its longhand equivalents
- [`line-height`](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height)
- [`margin`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin)
- [`outline`](https://developer.mozilla.org/en-US/docs/Web/CSS/outline) and its longhand equivalents
- [`padding`](https://developer.mozilla.org/en-US/docs/Web/CSS/padding)
- `text-*` properties such as [`text-transform`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform)
- [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
- [`word-spacing`](https://developer.mozilla.org/en-US/docs/Web/CSS/word-spacing) and [`word-break`](https://developer.mozilla.org/en-US/docs/Web/CSS/word-break)
- [`writing-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/writing-mode)

#### `consoleObject(object: object): ConsoleSpan`

An object, class, HTML element. It shows a preview of the object and an option to expand it to see it's properties (the same thing as doing `console.log(element)` for example).

#### `consoleGroup(options): ConsoleSpan`

```ts
consolePrint(consoleGroup({
    expanded: false, // default "false"
    header: 'Expand me',
    body: 'Here I am'
}))
```

_Note: The method calls `consoleFlush()` and flushes everything up until now before starting a new group._

#### `consoleFlush(): ConsoleSpan`

Flushes everything up until now and starts a new `console.log()` line.

#### `consoleInspect(value: unknown, options?: ConsoleInspectOptions): void`

Inspects a value. Great for debugging. Similar to `util.inspect()`. A substitute for `console.log()`.

##### `ConsoleInspectOptions.expandDepth`

Type: `number`
Default: `2`

How much levels to expand the object. Levels after that will be collapsed.

##### `ConsoleInspectOptions.indent`

Type: `number`
Default: `4`

How much spaces to add when going down a level.
