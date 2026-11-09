import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Theme } from "../theme/Theme";
import { FormHelperText } from "./FormHelperText";

afterEach(cleanup);

describe("FormHelperText", () => {
    it("emits the error state as a presence-only data attribute", () => {
        render(
            <Theme>
                <FormHelperText data-testid="hint">Shown in search results.</FormHelperText>
                <FormHelperText data-testid="error" error>
                    Enter a title
                </FormHelperText>
            </Theme>,
        );

        expect([screen.getByTestId("hint").dataset.error, screen.getByTestId("error").dataset.error]).toStrictEqual([undefined, ""]);
    });

    it("renders a slot as the element chosen in `slots`, merging the contract class with consumer props", () => {
        render(
            <FormHelperText slots={{ text: "a" }} slotProps={{ text: { href: "/help", className: "consumer-class" } }}>
                Read the guide
            </FormHelperText>,
        );

        const text = screen.getByRole("link", { name: "Read the guide" });
        expect(text.getAttribute("href")).toBe("/help");
        expect(text.className).toContain("consumer-class");
        expect(text.className).toContain("text");
    });
});
