import consoleInspect, {
    type ConsoleInspectOptions,
} from "../src/inspect/consoleInspect";
import consolePrint from "../src/core/consolePrint";
import consoleQuote from "../src/extras/consoleQuote";
import consoleUnorderedList from "../src/extras/consoleUnorderedList";
import { consoleText } from "../src/core/consoleText";
import consoleTable from "../src/extras/consoleTable";
import slicedownResult from "./fixtures/slicedownResult";
import consoleOrderedList from "../src/extras/consoleOrderedList";
import examples from "./examples";

function inspect(value: unknown, options?: ConsoleInspectOptions): unknown {
    console.log(value);
    consoleInspect(value, options);
    return value;
}

examples.make(() => {
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
});

examples.make(() => {
    // example 2
    consoleInspect(
        {
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
        },
        {
            depth: 3,
        },
    );
});

examples.make(() => {
    // example 3
    consolePrint(
        consoleText("9Os", {
            fontSize: "200px",
            color: "hsl(330, 100%, 50%)",
            textShadow:
                "0 2px 0 hsl(330, 100%, 25%), 0 3px 2px hsla(330, 100%, 15%, 0.5), /* next */ 0 3px 0 hsl(350, 100%, 50%), 0 5px 0 hsl(350, 100%, 25%), 0 6px 2px hsla(350, 100%, 15%, 0.5), /* next */ 0 6px 0 hsl(20, 100%, 50%), 0 8px 0 hsl(20, 100%, 25%), 0 9px 2px hsla(20, 100%, 15%, 0.5), /* next */ 0 9px 0 hsl(50, 100%, 50%), 0 11px 0 hsl(50, 100%, 25%), 0 12px 2px hsla(50, 100%, 15%, 0.5), /* next */ 0 12px 0 hsl(70, 100%, 50%), 0 14px 0 hsl(70, 100%, 25%), 0 15px 2px hsla(70, 100%, 15%, 0.5), /* next */ 0 15px 0 hsl(90, 100%, 50%), 0 17px 0 hsl(90, 100%, 25%), 0 17px 2px hsla(90, 100%, 15%, 0.5)",
        }),
    );
});

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

examples.make(() => {
    // example 4
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
});

examples.make(() => {
    inspect(
        `The European languages are members of the same family. Their separate existence is a myth. For science, music, sport, etc, Europe uses the same vocabulary. The languages only differ in their grammar, their pronunciation and their most common words. Everyone realizes why a new common language would be desirable: one could refuse to pay expensive translators. To achieve this, it would be necessary to have uniform grammar, pronunciation and more common words. If several languages coalesce, the grammar of the resulting language is more simple and regular than that of the individual languages. The new common language will be more simple and regular than the existing European languages. It will be as simple as Occidental; in fact, it will be Occidental.

To an English person, it will seem like simplified English, as a skeptical Cambridge friend of mine told me what Occidental is. The European languages are members of the same family. Their separate existence is a myth. For science, music, sport, etc, Europe uses the same vocabulary. The languages only differ in their grammar, their pronunciation and their most common words. Everyone realizes why a new common language would be desirable: one could refuse to pay expensive translators. To achieve this, it would be necessary to have uniform grammar, pronunciation and more common words. If several languages coalesce, the grammar of the resulting language is more simple and regular than that of the individual languages. The new common language will be more simple and regular than the existing European languages.`,
    );
});

examples.make(() => {
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
});

examples.make(() => {
    // primitive object
    inspect({
        a: 1,
        b: "two",
        c: true,
        d: undefined,
        e: null,
        f: Symbol("test"),
    });
});

examples.make(() => {
    // array (objects)
    // console.table(
    inspect([
        { value: "how to", index: 1 },
        { value: "tell me", index: 0 },
    ]);
    // )
});

examples.make(() => {
    consoleInspect(slicedownResult);
});

examples.make(() => {
    // array of arrays
    const obj1 = { start: 7, end: 23 };
    consoleInspect(
        [
            [obj1, obj1],
            [obj1, obj1],
        ],
        {
            depth: 2,
        },
    );
});

examples.make(() => {
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
        object: { type: "value", increment: 1 },
        priorities: [3, 7],
        type: "group",
        withNewLine: "- 1\n-2",
        onePropertyObject: { value: [] },
    };
    consoleInspect(nestedObject1);
    consoleInspect(nestedObject1, {
        depth: 3,
        indent: 4,
    });
    consoleTable(nestedObject1);
});

examples.make(() => {
    consolePrint(
        consoleOrderedList([
            "🥑 avocado",
            "🍌 banana",
            "🍍 pineapple",
            "🍓 strawberry",
        ]),
    );
});

examples.make(() => {
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
});

examples.make(() => {
    consoleTable(["John", "Jake", "Jack"]);
});

examples.make(() => {
    consoleTable({ name: "John", age: 24 });
});

examples.make(() => {
    consoleTable([
        {
            model: 'MacBook Air 13"',
            year: new Date(2020, 10, 23),
            price: { currency: "USD", amount: 999 },
            owner: "astoilkov",
        },
        {
            model: 'MacBook Air 15"',
            year: new Date(2023, 9, 18),
            price: { currency: "USD", amount: 1299 },
            owner: "erusev",
        },
        {
            model: 'MacBook Pro 13"',
            year: new Date(2019, 11, 2),
            price: { currency: "USD", amount: 1499 },
            owner: "astoilkov",
        },
    ]);
});

examples.make(() => {
    consoleTable([1]);
    consoleTable([{ type: "new" }]);
});

examples.make(() => {
    // Map
    inspect(
        new Map([
            ["today", new Date()],
            ["tomorrow", new Date()],
        ]),
    );
});

examples.make(() => {
    // Map
    inspect(
        new Map([
            [{ value: "🥑 avocado" }, { value: "🍌 banana" }],
            [{ value: "🍍 pineapple" }, { value: "🍓 strawberry" }],
        ]),
    );
});

examples.make(() => {
    // Set
    inspect(
        new Set(["🥑 avocado", "🍌 banana", "🍍 pineapple", "🍓 strawberry"]),
    );
});

examples.make(() => {
    // options.keys
    consoleInspect(
        [
            {
                model: 'MacBook Air 13"',
                year: new Date(2020, 10, 23),
                price: { currency: "USD", amount: 999 },
                owner: "astoilkov",
            },
            {
                model: 'MacBook Air 15"',
                year: new Date(2023, 9, 18),
                price: { currency: "USD", amount: 1299 },
                owner: "erusev",
            },
            {
                model: 'MacBook Pro 13"',
                year: new Date(2019, 11, 2),
                price: { currency: "USD", amount: 1499 },
                owner: "astoilkov",
            },
        ],
        {
            depth: 3,
            keys: ["price", "year", "amount"],
        },
    );
});

examples.make(() => {
    // Error (inspect)
    consoleInspect(new Error("Hello world!"));
});

examples.make(() => {
    // long object keys
    consoleInspect(
        {
            longLongVeryLongObjectKeyThatWrapsIfWeDontDoAnythingLongLongVeryLongObjectKeyThatWrapsIfWeDontDoAnythingLongLongVeryLongObjectKeyThatWrapsIfWeDontDoAnything:
                true,
            longlongverylongobjectkeythatwrapsifwedontdoanythinglonglongverylongobjectkeythatwrapsifwedontdoanythinglonglongverylongobjectkeythatwrapsifwedontdoanything:
                true,
            shortKey: false,
        },
        { wrap: "multi-line" },
    );
});

examples.make(() => {
    // long object values
    consoleInspect(
        {
            a: "longLongVeryLongObjectValueThatWrapsIfWeDontDoAnythingLongLongVeryLongObjectValueThatWrapsIfWeDontDoAnythingLongLongVeryLongObjectValueThatWrapsIfWeDontDoAnything",
            b: "2",
        },
        { wrap: "multi-line" },
    );
});

examples.make(() => {
    // array with object keys/properties
    const array = [1, 2, 3];
    (array as any).someObjectKey = "someObjectValue";
    consoleInspect(array);
    (array as any).innerObj = { a: 1 };
    consoleInspect(array);
});

examples.make(() => {
    // circular refs
    const objCircular = { a: 1, b: { a: 3 }, c: [] };
    objCircular.b = objCircular;
    const arrCircular = [1, 2, 3];
    arrCircular.push(arrCircular as any);
    objCircular.c = arrCircular as any;
    consoleInspect(objCircular, {
        depth: 5,
    });
});
