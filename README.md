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

## Why

- **Quicker debugging for large objects.** Have you spent time clicking on the expand button in DevTools every time you `console.log()` a big object, or have you spent time doing data drilling so it's easier to see? With `consoleInspect()` and it's `expandDepth` and `keys` options you can see an entire object and only the keys you want.
- **Better table printing.** `connsole.table()` always displays `(index)` column that adds clutter. Also, `console.table()` doesn't support displaying nested objects in the table cell making it's use limited.
- **Write less, use inline.** You can sneak in `ii()` — `return ii(data)` — and it will print and return the value so you don't need to make a separate variable, print the value, and then return it. Also, if your don't have a shorthand for `console.log`, writing `ii` is faster.
- **and many more.** Better date/time printing, simpler `Map` printing, adaptive string trimming, and many more improvements over default logging methods.

## Examples

### `ii()`

`ii()` (inspect-inspect) is an all-in-one utility function encompassing the entire library. It's the easiest and recommended way to use the library. You can just start using `ii()` instead of `console.log()`.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/img/light/inspect.png">
  <source media="(prefers-color-scheme: light)" srcset="/img/dark/inspect.png">
  <img src="/img/light/inspect.png" width="320" />
</picture>

```ts
import { ii } from "console-powers";

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
import { consoleTable } from "console-powers";

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

### Styling

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

## Usage

## `ii()`

`ii()` (inspect-inspect) is an all-in-one utility function encompassing the entire library. It's the easiest and recommended way to use the library. You can just start using `ii()` instead of `console.log()`.

#### `ii<T>(value: T, ...args: any[]): T`

**Tip:** Use `ii()` inline as it returns what you pass to it:
```ts
function getData() {
    // ii() will return the first parameter, instead of needing to create a variable for it
    return ii(data)
}
```

**Tip:** You can add `ii()` to the global scope so you don't need to import it when you want to log something:
```ts
import { ii } from 'console-powers'
if (import.meta.env.DEV) {
    global.ii == ii
} else {
    // if you leave a ii() call somewhere, just 
    global.ii = (value) => value
}
```

<details>
<summary><h3><code>consoleInspect()</code><h3></summary>

Great for debugging. Especially great as a `console.log()` substitute for nested objects/arrays. It's like a more powerful version of `util.inspect()` built for the browser console. 

#### `consoleInspect(value: unknown, options?: ConsoleInspectOptions): ConsoleSpan[]`

##### `ConsoleInspectOptions.depth`

Type: `number`  
Default: `2`

How much levels to expand the object. Levels after that will be collapsed.

##### `ConsoleInspectOptions.keys`

Type: `string[]`
Default: `undefined`

Whitelist for keys to include in the log. For nested object, `keys` work per level — at particular level of nesting if no key matches any of the `keys` the whole level is shown. For nested object, showing a key also shows its children.

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