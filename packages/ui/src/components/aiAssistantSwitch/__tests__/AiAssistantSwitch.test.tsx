import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AiAssistantSwitch } from "../AiAssistantSwitch";

afterEach(cleanup);

describe("AiAssistantSwitch", () => {
    it("renders the contract classes and attributes", () => {
        render(<AiAssistantSwitch checked iconOnly onChange={() => undefined} className="consumer-class" />);

        const root = screen.getByRole("switch", { name: "AI assistant" });
        expect(root.getAttribute("aria-checked")).toBe("true");
        expect(root.hasAttribute("data-icononly")).toBe(true);
        expect(root.className).toContain("dextinityAiAssistantSwitch");
        expect(root.className).toContain("consumer-class");
        expect(root.children[0]?.className).toContain("dextinityAiAssistantSwitch__icon");
        expect(screen.getByText("AI assistant").className).toContain("dextinityAiAssistantSwitch__label");
        expect(root.children[2]?.className).toContain("dextinityAiAssistantSwitch__track");
    });
});
