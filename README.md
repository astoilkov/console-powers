# `console-powers`

> Console messages for cool kinds

<!--
[![Gzipped Size](https://img.shields.io/bundlephobia/minzip/{{data.name}})](https://bundlephobia.com/result?p={{data.name}})
[![Build Status](https://img.shields.io/github/actions/workflow/status/astoilkov/{{data.name}}/main.yml?branch=main)](https://github.com/astoilkov/{{data.name}}/actions/workflows/main.yml)


## Install

```bash
npm install {{data.name}}
```

## Why

## Usage

## API

## Alternatives

## Related

-->

## Examples

```ts
import { consolePrint, consoleText } from 'console-powers'

consolePrint(
    consoleText('Cool kids', {
        fontSize: 200,
    	color: 'hsl(330, 100%, 50%)',
    	textShadow: '0 2px 0 hsl(330, 100%, 25%), 0 3px 2px hsla(330, 100%, 15%, 0.5), /* next */ 0 3px 0 hsl(350, 100%, 50%), 0 5px 0 hsl(350, 100%, 25%), 0 6px 2px hsla(350, 100%, 15%, 0.5), /* next */ 0 6px 0 hsl(20, 100%, 50%), 0 8px 0 hsl(20, 100%, 25%), 0 9px 2px hsla(20, 100%, 15%, 0.5), /* next */ 0 9px 0 hsl(50, 100%, 50%), 0 11px 0 hsl(50, 100%, 25%), 0 12px 2px hsla(50, 100%, 15%, 0.5), /* next */ 0 12px 0 hsl(70, 100%, 50%), 0 14px 0 hsl(70, 100%, 25%), 0 15px 2px hsla(70, 100%, 15%, 0.5), /* next */ 0 15px 0 hsl(90, 100%, 50%), 0 17px 0 hsl(90, 100%, 25%), 0 17px 2px hsla(90, 100%, 15%, 0.5)',
    })
)
```

```ts
import { consolePrint, consoleText } from 'console-powers'

consolePrint([
    consoleText("Arguments mismatch:", { background: "yellow" }),
    consoleText(" "),
    consoleText("addTodo(", { background: "#eee" }),
    consoleText(" ? ", { background: "red", color: "white" }),
    consoleText(")", { background: "#eee" }),
    consoleText(" - "),
    consoleText("less arguments than the required specified", {
        color: "red",
    }),
]);
```

## API

#### `consolePrint(messages: ConsoleMessage[])`

Prints the provided messages to the console.

#### `consoleText(text: string, style?: ConsoleStyle)`

#### `consoleObject(object: object)`

An object, class, HTML element. It shows a preview of the object and an option to expand it to see it's properties (the same thing as doing `console.log(element)` for example).

#### `consoleGroup(options)`

```ts
consolePrint(consoleGroup({
    expanded: false, // default "false"
    header: 'Expand me',
    body: 'Here I am'
}))
```

#### `consoleLine()`

Flushes everything up until now and starts a new `console.log()` line.

#### `ConsoleStyle`

- [`background`](https://developer.mozilla.org/en-US/docs/Web/CSS/background) and its longhand equivalents
- [`border`](https://developer.mozilla.org/en-US/docs/Web/CSS/border) and its longhand equivalents
- [`border-radius`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius)
- [`box-decoration-break`](https://developer.mozilla.org/en-US/docs/Web/CSS/box-decoration-break)
- [`box-shadow`](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow)
- [`clear`](https://developer.mozilla.org/en-US/docs/Web/CSS/clear) and [`float`](https://developer.mozilla.org/en-US/docs/Web/CSS/float)
- [`color`](https://developer.mozilla.org/en-US/docs/Web/CSS/color)
<!-- - [`cursor`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor) -->
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
