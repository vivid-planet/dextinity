import { transformAsync } from "@babel/core";
import { describe, expect, it } from "vitest";

import preset from "./index.js";

function transform(code, options) {
    return transformAsync(code, { babelrc: false, configFile: false, presets: [preset], ...options });
}

describe("@dextinity/admin-babel-preset", () => {
    it("parses generic arrow functions in .ts files", async () => {
        const result = await transform("export const identity = <T>(value: T): T => value;", { filename: "identity.ts" });

        expect(result.code).toContain("export const identity = value => value;");
    });

    it("applies the Emotion transform to .ts files", async () => {
        const result = await transform('import { styled } from "@mui/material/styles";\nexport const Root = styled("div")`color: red;`;', {
            filename: "Root.styles.ts",
        });

        expect(result.code).toMatch(/target: "e\w+"/);
    });

    it("uses the production JSX runtime in .tsx files when no environment is set", async () => {
        const result = await transform("export const Component = () => <div />;", { filename: "Component.tsx", envName: "development" });

        expect(result.code).toContain('from "react/jsx-runtime"');
        expect(result.code).not.toContain("jsx-dev-runtime");
    });
});
