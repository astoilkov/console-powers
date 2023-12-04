import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // run tests on root and in /test folder with .ts and .tsx extensions
        include: ["./test.ts?(x)", "./test/**/**.ts?(x)"],

        // restores original implementation (after each test is finished) when calling
        // `jest.spyOn()` inside of a test: https://vitest.dev/config/#restoremocks
        restoreMocks: true,

        // adds jsdom (https://github.com/jsdom/jsdom) APIs to tests
        environment: "jsdom",
    },
});
