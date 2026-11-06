import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AIPanel, type AIPanelProps } from "./AIPanel";

const requiredProps: AIPanelProps = {
    open: true,
    onOpenChange: vi.fn(),
    context: "Page tree · Austria · German",
    messages: [
        { id: "1", role: "user", content: "What is unpublished?" },
        { id: "2", role: "assistant", content: "4 pages." },
    ],
    value: "",
    onValueChange: vi.fn(),
    onSend: vi.fn(),
};

afterEach(cleanup);

describe("AIPanel render contract", () => {
    it("names the panel after its title and marks each message with its role", () => {
        render(<AIPanel {...requiredProps} pending />);

        const panel = screen.getByRole("complementary", { name: "AI assistant" });
        expect(panel.className).toContain("dextinityAIPanel");
        expect([panel.dataset.open, panel.dataset.pending]).toStrictEqual(["", ""]);
        const roles = [...panel.querySelectorAll<HTMLElement>(".dextinityAIPanel__message")].map((message) => message.dataset.role);
        expect(roles).toStrictEqual(["user", "assistant", "assistant"]);
        expect(screen.getByRole("status", { name: "The assistant is answering" })).toBeTruthy();
    });

    it("is hidden while closed", () => {
        render(<AIPanel {...requiredProps} open={false} />);

        expect(screen.queryByRole("complementary")).toBeNull();
    });
});
