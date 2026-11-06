import { RouterPromptHandler } from "@dextinity/admin";
import { createMemoryHistory } from "history";
import type { ComponentProps } from "react";
import { Route, Router } from "react-router";
import { act, cleanup, fireEvent, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UnsavedChangesPrompt } from "../UnsavedChangesPrompt";

const promptHandlerApiRef: ComponentProps<typeof RouterPromptHandler>["apiRef"] = { current: undefined };

function renderPrompt({ hasChanges, onSave = async () => true }: { hasChanges: boolean; onSave?: () => Promise<boolean> }) {
    const history = createMemoryHistory({ initialEntries: ["/pages/page-id/edit"] });
    const onDiscard = vi.fn();
    render(
        <Router history={history}>
            <RouterPromptHandler apiRef={promptHandlerApiRef}>
                <Route path="/pages/:id/edit">
                    <UnsavedChangesPrompt hasChanges={hasChanges} onSave={onSave} onDiscard={onDiscard} allowWithin="/pages/page-id/edit" />
                </Route>
            </RouterPromptHandler>
        </Router>,
    );
    return { history, onDiscard };
}

describe("UnsavedChangesPrompt", () => {
    afterEach(() => {
        cleanup();
    });

    it("lets the user leave without changes", () => {
        const { history } = renderPrompt({ hasChanges: false });

        act(() => history.push("/pages"));

        expect(history.location.pathname).toBe("/pages");
        expect(screen.queryByRole("alertdialog")).toBeNull();
    });

    it("lets the user navigate within the editor with changes", () => {
        const { history } = renderPrompt({ hasChanges: true });

        act(() => history.push("/pages/page-id/edit/config"));

        expect(history.location.pathname).toBe("/pages/page-id/edit/config");
        expect(screen.queryByText("Save your changes?")).toBeNull();
    });

    it("asks before leaving with changes and stays on the page", () => {
        const { history } = renderPrompt({ hasChanges: true });

        act(() => history.push("/pages"));

        expect(history.location.pathname).toBe("/pages/page-id/edit");
        expect(screen.getByText("Save your changes?")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Stay" }));

        expect(history.location.pathname).toBe("/pages/page-id/edit");
    });

    it("discards the changes and leaves", () => {
        const { history, onDiscard } = renderPrompt({ hasChanges: true });

        act(() => history.push("/pages?page=page-id"));
        fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));

        expect(onDiscard).toHaveBeenCalledOnce();
        expect(history.location.pathname).toBe("/pages");
        expect(history.location.search).toBe("?page=page-id");
    });

    it("saves the changes and leaves", async () => {
        const onSave = vi.fn(async () => true);
        const { history } = renderPrompt({ hasChanges: true, onSave });

        act(() => history.push("/pages"));
        fireEvent.click(screen.getByRole("button", { name: "Save and leave" }));

        await waitFor(() => expect(history.location.pathname).toBe("/pages"));
        expect(onSave).toHaveBeenCalledOnce();
    });

    it("stays on the page when saving fails", async () => {
        const onSave = vi.fn(async () => false);
        const { history } = renderPrompt({ hasChanges: true, onSave });

        act(() => history.push("/pages"));
        fireEvent.click(screen.getByRole("button", { name: "Save and leave" }));

        await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
        await waitFor(() => expect(screen.queryByText("Save your changes?")).toBeNull());
        expect(history.location.pathname).toBe("/pages/page-id/edit");
    });
});
