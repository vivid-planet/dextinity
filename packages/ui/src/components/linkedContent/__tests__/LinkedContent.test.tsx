import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LinkedContent } from "../LinkedContent";

afterEach(cleanup);

describe("LinkedContent", () => {
    it("renders a link named by its title and description with the contract classes", () => {
        render(<LinkedContent title="Job postings" description="12 entries are shown here" href="/jobs" className="consumer-class" />);

        const link = screen.getByRole("link", { name: /^Job postings/ });
        expect(link.getAttribute("href")).toBe("/jobs");
        expect(link.className).toContain("dextinityLinkedContent");
        expect(link.className).toContain("consumer-class");
        expect(link.dataset.hasDescription).toBe("");
        expect(screen.getByText("Job postings").className).toContain("dextinityLinkedContent__title");
        expect(link.querySelector(".dextinityLinkedContent__icon")?.getAttribute("aria-hidden")).toBe("true");
    });
});
