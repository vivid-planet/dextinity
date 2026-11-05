import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Badge } from "./Badge";

afterEach(cleanup);

describe("Badge", () => {
    it("emits the variant as a data attribute and defaults the AI text", () => {
        render(<Badge variant="ai" />);

        const badge = screen.getByText("AI");
        expect([badge.className.includes("dextinityBadge"), badge.dataset.variant]).toStrictEqual([true, "ai"]);
    });

    it("names a badge without text by its tooltip and makes it focusable", () => {
        render(<Badge variant="warning" tooltip="Alt text missing" />);

        const badge = screen.getByRole("img", { name: "Alt text missing" });
        expect([badge.dataset.variant, badge.tabIndex]).toStrictEqual(["warning", 0]);
    });

    it("keeps a count's own text and adds the tooltip as a description", () => {
        render(
            <Badge variant="count" tooltip="Issues to fix" data-testid="badge">
                3
            </Badge>,
        );

        expect(screen.getByTestId("badge").textContent).toBe("3Issues to fix");
        expect(screen.queryByRole("img")).toBeNull();
    });
});
