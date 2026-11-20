import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MiniChart } from "../MiniChart";

afterEach(cleanup);

describe("MiniChart", () => {
    it("renders one bar per value and marks the last and the highlighted ones", () => {
        render(<MiniChart data={[1, 2, 3, 4]} highlighted={[1]} aria-label="Changes" startLabel="Start" className="consumer-class" />);

        const root = screen.getByRole("img", { name: "Changes" });
        expect(root.className).toContain("dextinityMiniChart");
        expect(root.className).toContain("consumer-class");
        expect(root.dataset.variant).toBe("bars");
        const bars = root.querySelectorAll(".dextinityMiniChart__bar");
        expect(bars).toHaveLength(4);
        expect([...bars].map((bar) => [bar.hasAttribute("data-highlighted"), bar.hasAttribute("data-last")])).toStrictEqual([
            [false, false],
            [true, false],
            [false, false],
            [false, true],
        ]);
        expect(screen.getByText("Start").parentElement?.className).toContain("dextinityMiniChart__labels");
    });

    it("draws a line with points only for the last and the highlighted values", () => {
        render(<MiniChart variant="line" data={[1, 2, 3, 4]} highlighted={[0]} aria-label="Response time" />);

        const root = screen.getByRole("img", { name: "Response time" });
        expect(root.dataset.variant).toBe("line");
        expect(root.querySelector(".dextinityMiniChart__line")).not.toBeNull();
        expect(root.querySelectorAll(".dextinityMiniChart__point")).toHaveLength(2);
    });
});
