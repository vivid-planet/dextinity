import { ContentTranslationServiceProvider } from "@dextinity/admin";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createCompositeBlockTextField } from "./createCompositeBlockTextField";

function renderTextField(block: ReturnType<typeof createCompositeBlockTextField>[0], initialState: string, onUpdate: (state: string) => void) {
    function Harness() {
        const [state, setState] = useState(initialState);
        return (
            <block.AdminComponent
                state={state}
                updateState={(action) => {
                    const newState = typeof action === "function" ? action(state) : action;
                    onUpdate(newState);
                    setState(newState);
                }}
            />
        );
    }
    return render(<Harness />);
}

afterEach(cleanup);

describe("createCompositeBlockTextField", () => {
    it("updates the state after every change", async () => {
        const [block] = createCompositeBlockTextField({ label: "Title" });
        const onUpdate = vi.fn();
        renderTextField(block, "", onUpdate);

        const input = screen.getByRole("textbox", { name: "Title" });
        fireEvent.change(input, { target: { value: "H" } });
        await waitFor(() => expect(onUpdate).toHaveBeenLastCalledWith("H"));
        fireEvent.change(input, { target: { value: "Hi" } });
        await waitFor(() => expect(onUpdate).toHaveBeenLastCalledWith("Hi"));
    });

    it("updates the state and shows the error without touching when a required field is emptied", async () => {
        const [block] = createCompositeBlockTextField({ label: "Title", required: true });
        const onUpdate = vi.fn();
        renderTextField(block, "Hello", onUpdate);

        const input = screen.getByRole("textbox", { name: /Title/ });
        expect(input.getAttribute("aria-invalid")).not.toBe("true");
        fireEvent.change(input, { target: { value: "" } });

        await waitFor(() => expect(onUpdate).toHaveBeenLastCalledWith(""));
        await waitFor(() => expect(input.getAttribute("aria-invalid")).toBe("true"));
        expect(screen.getByText("Required")).toBeTruthy();
    });

    it("shows a textarea with multiline", () => {
        const [block] = createCompositeBlockTextField({ label: "Text", multiline: true });
        renderTextField(block, "Line", vi.fn());

        expect(screen.getByRole("textbox", { name: "Text" }).tagName).toBe("TEXTAREA");
    });

    it("translates the content in place with the content translation service", async () => {
        const [block] = createCompositeBlockTextField({ label: "Title" });
        const onUpdate = vi.fn();
        const translate = vi.fn(async (text: string) => `${text} (translated)`);
        function Harness() {
            const [state, setState] = useState("Hello");
            return (
                <ContentTranslationServiceProvider enabled translate={translate}>
                    <block.AdminComponent
                        state={state}
                        updateState={(action) => {
                            const newState = typeof action === "function" ? action(state) : action;
                            onUpdate(newState);
                            setState(newState);
                        }}
                    />
                </ContentTranslationServiceProvider>
            );
        }
        render(<Harness />);

        fireEvent.click(screen.getByRole("button", { name: "Translate" }));

        await waitFor(() => expect(onUpdate).toHaveBeenLastCalledWith("Hello (translated)"));
        expect(translate).toHaveBeenCalledWith("Hello");
    });

    it("hides the translate action with disableContentTranslation", () => {
        const [block] = createCompositeBlockTextField({ label: "Code", disableContentTranslation: true });
        render(
            <ContentTranslationServiceProvider enabled translate={async (text) => text}>
                <block.AdminComponent state="ABC" updateState={vi.fn()} />
            </ContentTranslationServiceProvider>,
        );

        expect(screen.queryByRole("button", { name: "Translate" })).toBeNull();
    });
});
