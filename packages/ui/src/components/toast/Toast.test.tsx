import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Toast } from "./Toast";
import { ToastViewport } from "./ToastViewport";
import { useToasts } from "./useToasts";

afterEach(cleanup);

describe("Toast", () => {
    it("renders the contract classes and the tone", () => {
        render(<Toast message="Saved" tone="error" icon={<span>i</span>} action={{ label: "Undo", onClick: vi.fn() }} className="consumer-class" />);

        const toast = screen.getByRole("alert");
        expect(toast.className).toContain("dextinityToast");
        expect(toast.className).toContain("consumer-class");
        expect(toast.dataset.tone).toBe("error");
        expect(screen.getByText("i").parentElement?.className).toContain("dextinityToast__icon");
        expect(screen.getByText("Saved").className).toContain("dextinityToast__message");
        expect(screen.getByRole("button", { name: "Undo" }).className).toContain("dextinityToast__action");
    });
});

describe("ToastViewport", () => {
    it("renders a labeled region with the contract classes", () => {
        render(<ToastViewport toasts={[{ id: "a", message: "Saved" }]} onDismiss={vi.fn()} labels={{ region: "Messages" }} />);

        const region = screen.getByRole("region", { name: "Messages" });
        expect(region.className).toContain("dextinityToastViewport");
        expect(screen.getByRole("list").className).toContain("dextinityToastViewport__list");
    });
});

describe("useToasts", () => {
    it("adds a toast in place of the current one and dismisses it by id", () => {
        const { result } = renderHook(() => useToasts());

        act(() => {
            result.current.add({ message: "First" });
        });
        let secondId = "";
        act(() => {
            secondId = result.current.add({ message: "Second", tone: "info" });
        });
        expect(result.current.toasts).toEqual([{ id: secondId, message: "Second", tone: "info" }]);

        act(() => result.current.dismiss(secondId));
        expect(result.current.toasts).toEqual([]);
    });
});
