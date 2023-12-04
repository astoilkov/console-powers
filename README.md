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
    //
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
