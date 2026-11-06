import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ProgressBar } from "../ProgressBar";

afterEach(cleanup);

describe("ProgressBar", () => {
    it("emits the tone and size and connects the label", () => {
        render(<ProgressBar value={40} label="Uploading" tone="success" size="small" showValue />);

        const bar = screen.getByRole("progressbar", { name: "Uploading" });
        expect(bar.className).toContain("dextinityProgressBar");
        expect([bar.dataset.tone, bar.dataset.size]).toStrictEqual(["success", "small"]);
        expect(bar.getAttribute("aria-valuenow")).toBe("40");
        expect(bar.querySelector(".dextinityProgressBar__value")?.textContent).toBe("40%");
    });

    it("is indeterminate without a value and hides the value then", () => {
        render(<ProgressBar value={null} aria-label="Importing" showValue />);

        const bar = screen.getByRole("progressbar", { name: "Importing" });
        expect([bar.dataset.tone, bar.dataset.size, bar.hasAttribute("data-indeterminate")]).toStrictEqual(["accent", "default", true]);
        expect(bar.hasAttribute("aria-valuenow")).toBe(false);
        expect(bar.querySelector(".dextinityProgressBar__value")).toBeNull();
    });
});
