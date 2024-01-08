import consoleInspect from "../src/inspect/consoleInspect";
import consolePrint from "../src/core/consolePrint";
import consoleQuote from "../src/extras/consoleQuote";
import consoleUnorderedList from "../src/extras/consoleUnorderedList";
import { consoleText } from "../src/core/consoleText";
import consoleTable from "../src/extras/consoleTable";
import slicedownResult from "./fixtures/slicedownResult";
import consoleOrderedList from "../src/extras/consoleOrderedList";

function inspect(value: unknown): unknown {
    console.log(value);
    consoleInspect(value);
    return value;
}

// example 1
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
]);

// example 2
consoleInspect({
    type: "group",
    level: 1,
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

// example 3
consolePrint(
    consoleText("9Os", {
        fontSize: "200px",
        color: "hsl(330, 100%, 50%)",
        textShadow:
            "0 2px 0 hsl(330, 100%, 25%), 0 3px 2px hsla(330, 100%, 15%, 0.5), /* next */ 0 3px 0 hsl(350, 100%, 50%), 0 5px 0 hsl(350, 100%, 25%), 0 6px 2px hsla(350, 100%, 15%, 0.5), /* next */ 0 6px 0 hsl(20, 100%, 50%), 0 8px 0 hsl(20, 100%, 25%), 0 9px 2px hsla(20, 100%, 15%, 0.5), /* next */ 0 9px 0 hsl(50, 100%, 50%), 0 11px 0 hsl(50, 100%, 25%), 0 12px 2px hsla(50, 100%, 15%, 0.5), /* next */ 0 12px 0 hsl(70, 100%, 50%), 0 14px 0 hsl(70, 100%, 25%), 0 15px 2px hsla(70, 100%, 15%, 0.5), /* next */ 0 15px 0 hsl(90, 100%, 50%), 0 17px 0 hsl(90, 100%, 25%), 0 17px 2px hsla(90, 100%, 15%, 0.5)",
    }),
);
// consolePrint([
//     consoleText("9Os", {
//         color: "hsl(330, 100%, 50%)",
//         fontSize: "200px",
//         textShadow: [
//             "0 2px 0 hsl(330, 100%, 25%)",
//             "0 3px 2px hsla(330, 100%, 15%, 0.5)",
//             "0 3px 0 hsl(350, 100%, 50%)",
//             "0 5px 0 hsl(350, 100%, 25%)",
//             "0 6px 2px hsla(350, 100%, 15%, 0.5)",
//             "0 6px 0 hsl(20, 100%, 50%)",
//             "0 8px 0 hsl(20, 100%, 25%)",
//             "0 9px 2px hsla(20, 100%, 15%, 0.5)",
//             "0 9px 0 hsl(50, 100%, 50%)",
//             "0 11px 0 hsl(50, 100%, 25%)",
//             "0 12px 2px hsla(50, 100%, 15%, 0.5)",
//             "0 12px 0 hsl(70, 100%, 50%)",
//             "0 14px 0 hsl(70, 100%, 25%)",
//             "0 15px 2px hsla(70, 100%, 15%, 0.5)",
//             "0 15px 0 hsl(90, 100%, 50%)",
//             "0 17px 0 hsl(90, 100%, 25%)",
//             "0 17px 2px hsla(90, 100%, 15%, 0.5)",
//         ].join(", "),
//     }),
// ]);

// // example 4
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

// array (primitive values)
inspect([
    351,
    BigInt(9999),
    "string",
    false,
    undefined,
    null,
    Symbol("test"),
    new Date(),
]);

// Map
inspect(
    new Map([
        ["today", new Date()],
        ["tomorrow", new Date()],
    ]),
);

inspect(new Set(["🥑 avocado", "🍌 banana", "🍍 pineapple", "🍓 strawberry"]));

// primitive object
inspect({
    a: 1,
    b: "two",
    c: true,
    d: undefined,
    e: null,
    f: Symbol("test"),
});

// array (objects)
// console.table(
inspect([
    { value: "how to", index: 1 },
    { value: "tell me", index: 0 },
]);
// )

consoleInspect(slicedownResult);

// array of arrays
const obj1 = { start: 7, end: 23 };
consoleInspect(
    [
        [obj1, obj1],
        [obj1, obj1],
    ],
    {
        expandDepth: 2,
    },
);

const nestedObject1 = {
    items: [{ type: "delimiter" }, { type: "new" }],
    location: {
        start: {
            line: {},
            column: 1,
        },
        end: {
            line: {},
            column: 1,
        },
    },
    priorities: [3, 7],
    type: "group",
};
consoleInspect(nestedObject1);
consoleInspect(nestedObject1, {
    expandDepth: 3,
    indent: 4,
});
consoleTable(nestedObject1);

consolePrint(
    consoleOrderedList([
        "🥑 avocado",
        "🍌 banana",
        "🍍 pineapple",
        "🍓 strawberry",
    ]),
);

consolePrint([
    ...consoleQuote(
        "This is really what it means to love which is to be generous in the interpretation of the behavior of another person",
        "Alain De Botton",
    ),
    consoleText("\n\n"),
    ...consoleUnorderedList([
        //
        "🥑 avocado",
        "🍌 banana",
        "🍍 pineapple",
        "🍓 strawberry",
    ]),
]);

consoleTable(["John", "Jake", "Jack"]);

consoleTable({ name: "John", age: 24 });
