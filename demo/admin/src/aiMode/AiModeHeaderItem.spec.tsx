import { renderAdmin } from "@src/testing/renderAdmin";
import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AiModeProvider } from "./AiModeContext";
import { AiModeHeaderItem } from "./AiModeHeaderItem";

describe("AiModeHeaderItem", () => {
    afterEach(() => {
        localStorage.clear();
    });

    it("switches the AI Companion on and off", () => {
        renderAdmin(
            <AiModeProvider isEnabled isAvailable>
                <AiModeHeaderItem />
            </AiModeProvider>,
        );
        const toggle = screen.getByRole("switch", { name: "AI Companion" });

        expect(toggle).not.toBeChecked();

        fireEvent.click(toggle);
        expect(toggle).toBeChecked();

        fireEvent.click(toggle);
        expect(toggle).not.toBeChecked();
    });

    it("is switched off and disabled on a page without the AI Mode, and says so", async () => {
        localStorage.setItem("ai-mode-open", "true");
        renderAdmin(
            <AiModeProvider isEnabled isAvailable={false}>
                <AiModeHeaderItem />
            </AiModeProvider>,
        );
        const toggle = screen.getByRole("switch", { name: "AI Companion" });

        expect(toggle).not.toBeChecked();
        expect(toggle).toBeDisabled();

        fireEvent.mouseOver(toggle.parentElement as HTMLElement);
        expect(await screen.findByRole("tooltip")).toHaveTextContent(
            "The AI Companion isn't available here yet. For now, it works in the page tree only.",
        );
    });
});
