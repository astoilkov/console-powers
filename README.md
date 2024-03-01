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

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="/img/light/table.png">
    <source media="(prefers-color-scheme: light)" srcset="/img/dark/table.png">
    <img src="/img/light/table.png" width="320" />
</picture>

```ts
consoleTable([
    {
        model: 'MacBook Air 13"',
        year: new Date(2020, 10, 23),
        price: 999,
    },
    {
        model: 'MacBook Air 15"',
        year: new Date(2023, 9, 18),
        price: 1299,
    },
    {
        model: 'MacBook Pro 13"',
        year: new Date(2019, 11, 2),
        price: 1499,
    },
])
```

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/img/light/inspect.png">
  <source media="(prefers-color-scheme: light)" srcset="/img/dark/inspect.png">
  <img src="/img/light/inspect.png" width="320" />
</picture>

```ts
import { consoleInspect } from "console-powers";

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
});
```

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/img/light/print.png">
  <source media="(prefers-color-scheme: light)" srcset="/img/dark/print.png">
  <img src="/img/light/print.png" width="320" />
</picture>

```ts
import { consolePrint, consoleText } from "console-powers";

consolePrint(
    consoleText("90s", {
        fontSize: "200px",
        color: "hsl(330, 100%, 50%)",
        textShadow:
            "0 2px 0 hsl(330, 100%, 25%), 0 3px 2px hsla(330, 100%, 15%, 0.5), /* next */ 0 3px 0 hsl(350, 100%, 50%), 0 5px 0 hsl(350, 100%, 25%), 0 6px 2px hsla(350, 100%, 15%, 0.5), /* next */ 0 6px 0 hsl(20, 100%, 50%), 0 8px 0 hsl(20, 100%, 25%), 0 9px 2px hsla(20, 100%, 15%, 0.5), /* next */ 0 9px 0 hsl(50, 100%, 50%), 0 11px 0 hsl(50, 100%, 25%), 0 12px 2px hsla(50, 100%, 15%, 0.5), /* next */ 0 12px 0 hsl(70, 100%, 50%), 0 14px 0 hsl(70, 100%, 25%), 0 15px 2px hsla(70, 100%, 15%, 0.5), /* next */ 0 15px 0 hsl(90, 100%, 50%), 0 17px 0 hsl(90, 100%, 25%), 0 17px 2px hsla(90, 100%, 15%, 0.5)",
    }),
);
```

## `consoleInspect()`

A great substitute for `console.log()`. Great for debugging. Similar to `util.inspect()`. 

#### `consoleInspect(value: unknown, options?: ConsoleInspectOptions): ConsoleSpan[]`

##### `ConsoleInspectOptions.depth`

Type: `number`  
Default: `2`

How much levels to expand the object. Levels after that will be collapsed.

##### `ConsoleInspectOptions.wrap`

Type: `"auto" | "single-line" | "multi-line" | number`  
Default: `"auto"`

Configure when the algorithm puts things on new lines:
- `"auto"` — tries to guess the available space and wraps based on it.
- `"single-line"` — never wraps on new lines, the entire output is a single line.
- `"multi-line"` — always starts a new line when dwelling into a new object/array.
- `number` — set the maximum number of characters per line, when it it can't place it, it creates a new line.

##### `ConsoleInspectOptions.indent`

Type: `number`  
Default: `4`

How much spaces to add when going down a level.

##### `ConsoleInspectOptions.theme`

Type: `'light' | 'dark'`  
Default: automatically determined based on the system theme.

Determines the colors that will be used to style the output.

##### `ConsoleInspectOptions.print`

Type: `boolean`  
Default: `true`

If set to `false`, the method won't print to the console. In this case, you probably want to get the return value of the method and use it.

## `consoleTable()`

#### `consoleTable(value: object, options: ConsoleTableOptions): ConsoleSpan[]`

##### `ConsoleTableOptions.wrap`

Type: `"auto" | number`  
Default: `"auto"`

##### `ConsoleTableOptions.theme`

Type: `'light' | 'dark'`  
Default: automatically determined based on the system theme.

Determines the colors that will be used to style the output.

##### `ConsoleTableOptions.print`

Type: `boolean`  
Default: `true`

If set to `false`, the method won't print to the console. In this case, you probably want to get the return value of the method and use it.

## API _(core)_

#### `consolePrint(spans: ConsoleSpan[]): void`

Prints the provided spans to the console.

#### `consoleText(text: string, style?: ConsoleStyle): ConsoleSpan`

Creates a styled text in the console.

#### `consoleObject(object: object): ConsoleSpan`

An object, class, HTML element. It shows a preview of the object and an option to expand it to see it's properties (the same thing as doing `console.log(element)` for example).

#### `consoleApply(spans: ConsoleSpan | ConsoleSpan[], style: ConsoleStyle): ConsoleSpan[]`

Add additional style to all spans.

#### `consoleGroup(options: ConsoleGroupOptions): ConsoleSpan`

```ts
consolePrint(
    consoleGroup({
        expanded: false, // default "false"
        header: "Expand me",
        body: "Here I am",
    }),
);
```

_Note: The method calls `consoleFlush()` and flushes everything up until now before starting a new group._

#### `consoleFlush(): ConsoleSpan`

Flushes everything up until now and starts a new `console.log()` line.

#### `ConsoleStyle`

-   [`background`](https://developer.mozilla.org/en-US/docs/Web/CSS/background) and its longhand equivalents
-   [`border`](https://developer.mozilla.org/en-US/docs/Web/CSS/border) and its longhand equivalents
-   [`border-radius`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius)
-   [`box-decoration-break`](https://developer.mozilla.org/en-US/docs/Web/CSS/box-decoration-break)
-   [`box-shadow`](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow)
-   [`clear`](https://developer.mozilla.org/en-US/docs/Web/CSS/clear) and [`float`](https://developer.mozilla.org/en-US/docs/Web/CSS/float)
-   [`color`](https://developer.mozilla.org/en-US/docs/Web/CSS/color)
-   [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display)
-   [`font`](https://developer.mozilla.org/en-US/docs/Web/CSS/font) and its longhand equivalents
-   [`line-height`](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height)
-   [`margin`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin)
-   [`outline`](https://developer.mozilla.org/en-US/docs/Web/CSS/outline) and its longhand equivalents
-   [`padding`](https://developer.mozilla.org/en-US/docs/Web/CSS/padding)
-   `text-*` properties such as [`text-transform`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform)
-   [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
-   [`word-spacing`](https://developer.mozilla.org/en-US/docs/Web/CSS/word-spacing) and [`word-break`](https://developer.mozilla.org/en-US/docs/Web/CSS/word-break)
-   [`writing-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/writing-mode)
