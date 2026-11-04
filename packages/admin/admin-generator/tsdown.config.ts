import { defineConfig } from "tsdown";

export default defineConfig([
    {
        entry: "src/index.ts",
        dts: true,
        tsconfig: true,
    },
    {
        entry: "src/adminGenerator.ts",
        tsconfig: true,
    },
]);
