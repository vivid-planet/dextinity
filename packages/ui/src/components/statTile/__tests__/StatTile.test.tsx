import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { StatTile } from "../StatTile";

afterEach(cleanup);

describe("StatTile", () => {
    it("renders the contract classes and the trend as owner state", () => {
        const { container } = render(
            <StatTile value={79} unit="ms" label="Changes" context="Last 30 days" trend="down" className="consumer-class" />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityStatTile");
        expect(root.className).toContain("consumer-class");
        expect(root.dataset.trend).toBe("down");
        expect(screen.getByText("79").className).toContain("dextinityStatTile__number");
        expect(screen.getByText("ms").className).toContain("dextinityStatTile__unit");
        expect(screen.getByText("Changes").className).toContain("dextinityStatTile__label");
        expect(screen.getByText("Last 30 days").className).toContain("dextinityStatTile__context");
        expect(screen.getByRole("img", { name: "Falling" }).parentElement?.className).toContain("dextinityStatTile__trend");
    });

    it("emits no trend without one", () => {
        const { container } = render(<StatTile value={79} label="Changes" />);

        expect((container.firstElementChild as HTMLElement).hasAttribute("data-trend")).toBe(false);
    });
});
