import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Link } from "./Link";

afterEach(cleanup);

describe("Link", () => {
    it("renders the contract classes and owner state", () => {
        render(
            <>
                <Link href="/pages" startIcon={<span>s</span>} endIcon={<span>e</span>} className="consumer-class">
                    Pages
                </Link>
                <Link href="https://example.com" color="accent" external>
                    Example
                </Link>
            </>,
        );

        const pages = screen.getByRole("link", { name: "Pages" });
        expect(pages.className).toContain("dextinityLink");
        expect(pages.className).toContain("consumer-class");
        expect(pages.dataset.color).toBe("secondary");
        expect(pages.hasAttribute("data-external")).toBe(false);
        expect(screen.getByText("s").parentElement?.className).toContain("dextinityLink__startIcon");
        expect(screen.getByText("e").parentElement?.className).toContain("dextinityLink__endIcon");

        const example = screen.getByRole("link", { name: /^Example.*opens in a new tab/ });
        expect([example.dataset.color, example.dataset.external]).toStrictEqual(["accent", ""]);
        expect(example.querySelector(".dextinityLink__endIcon")).not.toBeNull();
    });
});
