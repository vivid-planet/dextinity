import { type ComponentType, useState } from "react";
import { MemoryRouter } from "react-router";
import { cleanup, fireEvent, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { PageTreeSelectDialogProps } from "../../pages/pageTreeSelect/PageTreeSelectDialog";
import { ExternalLinkBlock } from "../ExternalLinkBlock";
import { InternalLinkBlock } from "../InternalLinkBlock";
import type { BlockAdminComponentProps } from "../types";

const anchors = vi.hoisted(() => ({ current: undefined as string[] | undefined }));

vi.mock("../../pages/usePageTreeDocumentAnchors", () => ({
    usePageTreeNodeDocumentAnchors: (page: unknown) => (page == null ? [] : anchors.current),
}));

vi.mock("../../pages/pageTreeSelect/PageTreeSelectDialog", () => ({
    PageTreeSelectDialog: ({ open, onChange }: PageTreeSelectDialogProps) =>
        open ? (
            <div role="dialog" aria-label="Pages">
                <button type="button" onClick={() => onChange({ id: "about", name: "About us", path: "/about", documentType: "Page" })}>
                    Choose About us
                </button>
            </div>
        ) : null,
}));

function renderBlock<State>(AdminComponent: ComponentType<BlockAdminComponentProps<State>>, initialState: State) {
    const onUpdate = vi.fn<(state: State) => void>();

    function Harness() {
        const [state, setState] = useState<State>(initialState);
        return (
            <AdminComponent
                state={state}
                updateState={(action) => {
                    const newState = typeof action === "function" ? (action as (previous: State) => State)(state) : action;
                    onUpdate(newState);
                    setState(newState);
                }}
            />
        );
    }

    render(
        <MemoryRouter>
            <Harness />
        </MemoryRouter>,
    );

    return onUpdate;
}

afterEach(() => {
    cleanup();
    anchors.current = undefined;
});

describe("ExternalLinkBlock AdminComponent", () => {
    it("updates the URL and the switches", async () => {
        const onUpdate = renderBlock(ExternalLinkBlock.AdminComponent, ExternalLinkBlock.defaultValues());

        fireEvent.change(screen.getByRole("textbox", { name: "URL" }), { target: { value: "https://www.dextinity.com" } });
        await waitFor(() => expect(onUpdate).toHaveBeenLastCalledWith(expect.objectContaining({ targetUrl: "https://www.dextinity.com" })));

        fireEvent.click(screen.getByRole("switch", { name: /Open in new window/ }));
        await waitFor(() => expect(onUpdate).toHaveBeenLastCalledWith(expect.objectContaining({ openInNewWindow: true })));
    });

    it("shows an error for an invalid link target", async () => {
        renderBlock(ExternalLinkBlock.AdminComponent, ExternalLinkBlock.defaultValues());

        fireEvent.change(screen.getByRole("textbox", { name: "URL" }), { target: { value: "javascript:alert(1)" } });

        expect(await screen.findByText("Invalid link target")).toBeTruthy();
    });
});

describe("InternalLinkBlock AdminComponent", () => {
    it("sets the page chosen in the dialog", async () => {
        const onUpdate = renderBlock(InternalLinkBlock.AdminComponent, InternalLinkBlock.defaultValues());

        fireEvent.click(screen.getByRole("button", { name: /^Page/ }));
        fireEvent.click(screen.getByRole("button", { name: "Choose About us" }));

        await waitFor(() =>
            expect(onUpdate).toHaveBeenLastCalledWith({
                targetPage: expect.objectContaining({ id: "about", name: "About us" }),
                targetPageAnchor: undefined,
            }),
        );
    });

    it("keeps the anchor while the anchors load and clears it when the page is removed", async () => {
        const targetPage = { id: "about", name: "About us", path: "/about", documentType: "Page" };
        const onUpdate = renderBlock(InternalLinkBlock.AdminComponent, { targetPage, targetPageAnchor: "team" });

        expect(onUpdate).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole("button", { name: "Remove page" }));

        await waitFor(() => expect(onUpdate).toHaveBeenLastCalledWith({ targetPage: undefined, targetPageAnchor: undefined }));
    });
});
