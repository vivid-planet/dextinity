import { describe, expect, it } from "vitest";

import { generateScopedName } from "./generateScopedName";

const buttonModuleFilename = "/project/packages/ui/src/components/button/Button.module.scss";

describe("generateScopedName", () => {
    it("maps `root` in a component module to the component's root class", () => {
        expect(generateScopedName("root", buttonModuleFilename)).toBe("dextinityButton");
    });

    it("maps a part name in a component module to the component's part class", () => {
        expect(generateScopedName("startIcon", buttonModuleFilename)).toBe("dextinityButton__startIcon");
    });

    it("maps a non-contract module deterministically", () => {
        const storyModuleFilename = "/project/packages/ui/src/components/button/__stories__/customization.dev.module.scss";

        expect(generateScopedName("root", storyModuleFilename)).toBe(generateScopedName("root", storyModuleFilename));
    });

    it("maps the same local name in different non-contract modules to different names", () => {
        const firstFilename = "/project/packages/ui/src/theme/first.module.scss";
        const secondFilename = "/project/packages/ui/src/theme/second.module.scss";

        expect(generateScopedName("root", firstFilename)).not.toBe(generateScopedName("root", secondFilename));
    });
});
