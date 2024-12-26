# `console-powers`

> Better debugging experience in the browser's console. Ditch `console.log`.

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

## Why

- **Quicker debugging for large objects.** Have you spent time clicking on the expand button in DevTools every time you `console.log()` a big object, or have you spent time doing data drilling so it's easier to see? With `ii()` and it's `depth` and `keys` options you can see an entire object with only the keys you want.
- **Better table printing.** `connsole.table()` always displays `(index)` column that adds clutter. Also, `console.table()` doesn't support displaying nested objects in the table cell making it's use limited.
- **Write less, use inline.** You can sneak in `ii()` — `return ii(data)` — and it will print and return the value so you don't need to make a separate variable, print the value, and then return it. Also, if your don't have a shorthand for `console.log`, writing `ii` is faster.
- **And many more.** Better date/time printing, more readable `Map` printing, adaptive string trimming, and many more improvements over default logging methods.

## TL;DR

You can replace `console.log()` with `ii()` & `console.table()` with `tt()` for a better debugging experience. Just add the two methods to the global scope and start experimenting:
```ts
import { addToGlobalScope, addNoopToGlobalScope } from 'console-powers/global'

if (import.meta.env.DEV) {
    addToGlobalScope()
    ii.defaults.depth = 8 // if you like, change the default options
} else {
    addNoopToGlobalScope()
}
```

The library also has additional methods for doing advanced printing in the browser console — see the [API section](#api) if you wanna dive deeper.

## Examples

### Inspect

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/img/light/inspect.png">
  <source media="(prefers-color-scheme: light)" srcset="/img/dark/inspect.png">
  <img src="/img/light/inspect.png" width="320" />
</picture>

```ts
import { ii } from "console-powers";

// inspect-inspect
ii({
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

### Tables

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="/img/light/table.png">
    <source media="(prefers-color-scheme: light)" srcset="/img/dark/table.png">
    <img src="/img/light/table.png" width="380" />
</picture>

```ts
import { tt } from "console-powers";

// table-table
tt([
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

### Styling

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/img/light/print.png">
  <source media="(prefers-color-scheme: light)" srcset="/img/dark/print.png">
  <img src="/img/light/print.png" width="240" />
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

## API

### `ii()`

`ii()` (inspect-inspect) is an all-in-one utility function encompassing the entire library. It's the easiest and recommended way to use the library. You can start using `ii()` instead of `console.log()`. It uses `consoleInspect()` under the hood.

#### `ii<T>(value: T, ...args: any[]): T`

**Tip:** Use `ii()` inside expressions – it returns the first argument your pass to it:
```ts
function getData() {
    // ii() will return the first parameter, instead of needing to create a variable for it
    return ii(data)
}
```

##### `ii.defaults`

Type: `ConsoleInspectOptions`

The default options passed to `consoleInspect()`. Expand `consoleInspect` docs for list of all options and what they do.

##### `ii.depth(depth: number): InspectInspect`

Alias: `ii.d(depth: number): InspectInspect`

Changes how many levels of a nested object are expanded by default. Returns itself to allow chaining:
```ts
ii.depth(6)(nestedObject)
```

##### `ii.keys(...keys: string[]): InspectInspect`

Alias: `ii.k(...keys: string[]): InspectInspect`

Whitelist keys to include in the log. For nested object, `keys` work per level — at particular level of nesting if no key matches any of the `keys` the whole level is shown. For nested object, showing a key also shows its children. Returns itself to allow chaining:
```ts
ii.keys('start', 'end', 'type')({
    type: 'paragraph',
    start: 0,
    end: 10,
    nodes: [{
        ...
    }]
})
```

##### `ii.pre(value: unknown): unknown`

Allows you to manipulate the value before printing it. For example, in Solid.js Signals are functions with no parameters and you can ensure it always prints the value and not the Signal itself:
```ts
ii.pre = (value: unknown): unknown => {
    // is it a Solid.js Signal?
    return typeof value === 'function' && value.length === 0
        ? value()
        : value
}
```

### `tt()`

`tt()` (table-table) aims to replace `console.table()` by providing extra features and cleaner design.  It uses `consoleTable()` under the hood.

#### `tt<T>(value: T, ...args: any[]): T`

**Tip:** Use `tt()` inside expressions – it returns the first argument your pass to it:
```ts
function getData() {
    // tt() will return the first parameter, instead of needing to create a variable for it
    return tt(data)
}
```

##### `tt.defaults`

Type: `ConsoleTableOptions`

The default options passed to `consoleTable()`. Expand `consoleTable` docs for list of all options and what they do.

##### `tt.pre(value: unknown): unknown`

Allows you to manipulate the value before printing it. For example, in Solid.js Signals are functions with no parameters and you can ensure it always prints the value and not the Signal itself:
```ts
tt.pre = (value: unknown): unknown => {
    // is it a Solid.js Signal?
    return typeof value === 'function' && value.length === 0
        ? value()
        : value
}
```

<details>
<summary><h3><code>consoleInspect()</code><h3></summary>

#### `consoleInspect(values: any[], options?: ConsoleInspectOptions): ConsoleSpan[]`

##### `ConsoleInspectOptions.depth`

Type: `number`  
Default: `2`

For nested objects, how many levels are expanded by default. Levels after that will be collapsed.

##### `ConsoleInspectOptions.keys`

Type: `string[]`
Default: `undefined`

Whitelist keys to include in the log. For nested object, `keys` work per level — at particular level of nesting if no key matches any of the `keys` the whole level is shown. For nested object, showing a key also shows its children.

##### `ConsoleInspectOptions.wrap`

Type: `"auto" | "single-line" | "multi-line" | number`  
Default: `"auto"`

Configure when the algorithm puts things on new lines:
- `"auto"` — tries to guess the available space and wraps based on it.
- `"single-line"` — never wraps on new lines, the entire output is a single line.
- `"multi-line"` — always starts a new line when dwelling into a new object/array.
- `number` — set the maximum number of characters per line before it wraps to the next line.

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

</details>

<details>
<summary><h3><code>consoleTable()</code></h3></summary>

Great for debugging. Especially great when you have an array of objects that aren't deeply nested.

#### `consoleTable(value: any, options: ConsoleTableOptions): ConsoleSpan[]`

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

</details>

<details>
<summary><h3>API <i>(core)</i></h3></summary>

#### `consolePrint(spans: ConsoleSpan[]): void`

Prints the provided spans to the console.

#### `consoleText(text: string, style?: ConsoleStyle): ConsoleSpan`

Creates a styled text span.

#### `consoleObject(object: object): ConsoleSpan`

An object, class, HTML element. It shows a preview of the object and an option to expand it to see it's properties. The same thing as `console.dirxml(object)`.

#### `consoleApply(spans: ConsoleSpan | ConsoleSpan[], style: ConsoleStyle): ConsoleSpan[]`

Apply additional styles to all provided spans.

#### `consoleGroup(options: ConsoleGroupOptions): ConsoleSpan`

It creates a group using `console.group()` or `console.groupCollapsed()` with the provided `header` and `body`.

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

Calls `console.log()` on all spans provided before it. Internally, `consolePrint()` uses `consoleFlush()` at the end.

```ts
consolePrint(
    consoleText('take a look at'),
    consoleObject(object),
    consoleFlush(),
    consoleText('this is a new line and a new console.log() statement')
)
```

#### `ConsoleStyle`

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

</details>