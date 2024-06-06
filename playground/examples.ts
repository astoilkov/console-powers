class Examples {
    #examples: Function[] = [];
    #only: Function[] = [];

    constructor() {
        window.addEventListener(
            "load",
            () => {
                if (this.#only.length > 0) {
                    this.#only.forEach((fn) => fn());
                } else {
                    this.#examples.forEach((fn) => fn());
                }
            },
            { once: true },
        );
    }

    make(fn: () => void): void {
        this.#examples.push(fn);
    }

    only(fn: () => void): void {
        this.#only.push(fn);
    }
}

const examples = new Examples();
export default examples;
