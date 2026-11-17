import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FieldValidationMessage } from "../FieldValidationMessage";

afterEach(cleanup);

describe("FieldValidationMessage", () => {
    it("emits the state as a data attribute", () => {
        render(
            <FieldValidationMessage data-testid="message" state="warning">
                Search engines may cut long titles.
            </FieldValidationMessage>,
        );

        expect(screen.getByTestId("message").dataset.state).toBe("warning");
    });

    it("renders a slot as the element chosen in `slots`, merging the contract class with consumer props", () => {
        render(
            <FieldValidationMessage state="error" slots={{ text: "a" }} slotProps={{ text: { href: "/help", className: "consumer-class" } }}>
                Read the guide
            </FieldValidationMessage>,
        );

        const text = screen.getByRole("link", { name: "Read the guide" });
        expect(text.getAttribute("href")).toBe("/help");
        expect(text.className).toContain("consumer-class");
        expect(text.className).toContain("text");
    });
});
