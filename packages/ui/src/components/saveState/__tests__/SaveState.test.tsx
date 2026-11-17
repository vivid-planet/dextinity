import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SaveState } from "../SaveState";

afterEach(cleanup);

describe("SaveState", () => {
    it("renders the state as a live status with the contract classes", () => {
        render(<SaveState state="dirty" className="consumer-class" />);

        const root = screen.getByRole("status");
        expect(root.className).toContain("dextinitySaveState");
        expect(root.className).toContain("consumer-class");
        expect(root.dataset.state).toBe("dirty");
        expect(root.textContent).toBe("Unsaved changes");
        expect(root.hasAttribute("tabindex")).toBe(false);
        expect(root.querySelector(".dextinitySaveState__dot")?.getAttribute("aria-hidden")).toBe("true");
    });

    it("becomes focusable for its tooltip when the time of the last save is known", () => {
        render(<SaveState state="saved" savedAt={new Date()} labels={{ saved: "Saved" }} />);

        const root = screen.getByRole("status");
        expect(root.getAttribute("tabindex")).toBe("0");
        expect(root.textContent).toBe("Saved");
    });
});
