import ConsoleStyle from "../../core/ConsoleStyle";
import createTableCell, { ConsoleTableCell } from "./createTableCell";
import consoleApply from "../../core/consoleApply";

export default class CellBorder {
    #borderStyle: string;
    #style: ConsoleStyle = { lineHeight: '1.8' };

    constructor(theme: "light" | "dark") {
        this.#borderStyle = theme === "light" ? "black" : "#474747";
    }

    setVertical(rows: ConsoleTableCell[][], index: number): void {
        if (index === 0) {
            this.#style.borderTop = `1px solid ${this.#borderStyle}`;
        }
        if (index === rows.length - 1) {
            this.#style.borderBottom = `1px solid ${this.#borderStyle}`;
        }
    }

    setHorizontal(cells: ConsoleTableCell[], index: number): void {
        if (index === 0) {
            this.#style.borderLeft = `1px solid ${this.#borderStyle}`;
        }
        if (index === cells.length - 1) {
            this.#style.borderRight = `1px solid ${this.#borderStyle}`;
        }
    }

    apply(cell: ConsoleTableCell): ConsoleTableCell {
        if (cell.spans.length > 1) {
            const { borderLeft, borderRight, ...restStyle } = this.#style;
            return createTableCell([
                ...consoleApply(cell.spans[0]!, { ...restStyle, borderLeft }),
                ...consoleApply(cell.spans.slice(1, -1), restStyle),
                ...consoleApply(cell.spans.at(-1)!, {
                    ...restStyle,
                    borderRight,
                }),
            ]);
        }

        return createTableCell(consoleApply(cell.spans, this.#style));
    }
}
