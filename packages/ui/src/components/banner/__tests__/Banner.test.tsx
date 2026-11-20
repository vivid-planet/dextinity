import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Banner } from "../Banner";

afterEach(cleanup);

describe("Banner", () => {
    it("renders the contract classes and the color attribute", () => {
        render(
            <Banner className="consumer-class" action={<button type="button">Try again</button>}>
                No connection.
            </Banner>,
        );

        const root = screen.getByRole("status");
        expect(root.className).toContain("dextinityBanner");
        expect(root.className).toContain("consumer-class");
        expect(root).toHaveAttribute("data-color", "warning");
        expect(screen.getByText("No connection.").className).toContain("dextinityBanner__message");
        expect(root.querySelector(".dextinityBanner__icon")).not.toBeNull();
        expect(screen.getByRole("button").parentElement?.className).toContain("dextinityBanner__action");
    });

    it("announces errors as alerts", () => {
        render(<Banner color="error">Saving failed.</Banner>);

        expect(screen.getByRole("alert")).toHaveAttribute("data-color", "error");
    });
});
