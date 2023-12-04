import consoleInspect from "../inspect/consoleInspect";
import consolePrint from "../core/consolePrint";
import consoleQuote from "../extras/consoleQuote";
import consoleUnorderedList from "../extras/consoleUnorderedList";
import { consoleText } from "../core/consoleText";

export default function testConsoleInspect(): void {
    // array (primitive values)
    inspect([
        1,
        2,
        3,
        "first",
        "second",
        "third",
        undefined,
        null,
        Symbol("test"),
    ]);

    // array (length 102)
    inspect(new Array(102).fill(0));

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

    consolePrint([
        consoleText(
            "hello",
            "color: hsl(330, 100%, 50%)",
            "font-size: 200px;",
            "text-shadow: 0 2px 0 hsl(330, 100%, 25%), 0 3px 2px hsla(330, 100%, 15%, 0.5), /* next */ 0 3px 0 hsl(350, 100%, 50%), 0 5px 0 hsl(350, 100%, 25%), 0 6px 2px hsla(350, 100%, 15%, 0.5), /* next */ 0 6px 0 hsl(20, 100%, 50%), 0 8px 0 hsl(20, 100%, 25%), 0 9px 2px hsla(20, 100%, 15%, 0.5), /* next */ 0 9px 0 hsl(50, 100%, 50%), 0 11px 0 hsl(50, 100%, 25%), 0 12px 2px hsla(50, 100%, 15%, 0.5), /* next */ 0 12px 0 hsl(70, 100%, 50%), 0 14px 0 hsl(70, 100%, 25%), 0 15px 2px hsla(70, 100%, 15%, 0.5), /* next */ 0 15px 0 hsl(90, 100%, 50%), 0 17px 0 hsl(90, 100%, 25%), 0 17px 2px hsla(90, 100%, 15%, 0.5)",
            'fontFamily: "Permanent Marker", cursive',
        ),
    ]);
}

function inspect(value: unknown): unknown {
    console.log(value);
    consoleInspect(value);
    return value;
}
