import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ScopeSwitcher, type ScopeSwitcherDimension } from "../ScopeSwitcher";

const dimensions: ScopeSwitcherDimension[] = [
    { key: "country", label: "Country", options: [{ value: "at", label: "Austria", shortLabel: "AT" }] },
    { key: "language", label: "Language", options: [{ value: "de", label: "German" }] },
];

afterEach(cleanup);

describe("ScopeSwitcher render contract", () => {
    it("names the trigger after the scope and renders the long and the short form as parts", () => {
        render(<ScopeSwitcher dimensions={dimensions} value={["at", "de"]} onChange={vi.fn()} open={false} onOpenChange={vi.fn()} />);

        const trigger = screen.getByRole("button", { name: "Change scope: Austria · German" });
        expect(trigger.className).toContain("dextinityScopeSwitcher");
        expect(trigger.dataset.searchable).toBe("");
        expect(trigger.querySelector(".dextinityScopeSwitcher__longText")?.textContent).toBe("Austria · German");
        expect(trigger.querySelector(".dextinityScopeSwitcher__shortText")?.textContent).toBe("AT · German");
    });

    it("leaves out the searchable attribute without search", () => {
        render(
            <ScopeSwitcher dimensions={dimensions} value={["at", "de"]} onChange={vi.fn()} open={false} onOpenChange={vi.fn()} searchable={false} />,
        );

        expect(screen.getByRole("button").hasAttribute("data-searchable")).toBe(false);
    });
});
