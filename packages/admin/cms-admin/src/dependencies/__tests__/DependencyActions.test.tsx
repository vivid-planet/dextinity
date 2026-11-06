import { RouterMemoryRouter } from "@dextinity/admin";
import userEvent from "@testing-library/user-event";
import { cleanup, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DependencyActions } from "../DependencyActions";
import type { DependencyUrl } from "../useDependencyUrlResolver";

const resolvedUrl = vi.hoisted(() => ({ current: undefined as DependencyUrl | undefined }));
vi.mock("../useDependencyUrlResolver", () => ({ useDependencyUrlResolver: () => () => resolvedUrl.current }));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

function renderActions(dependencyUrl: DependencyUrl, onCopyLinkError = vi.fn()) {
    resolvedUrl.current = dependencyUrl;
    render(
        <RouterMemoryRouter>
            <DependencyActions graphqlObjectType="Page" id="page-1" onCopyLinkError={onCopyLinkError} />
        </RouterMemoryRouter>,
    );
    return { onCopyLinkError };
}

describe("DependencyActions", () => {
    it("shows why the actions are disabled on a focusable wrapper", async () => {
        renderActions({ status: "scopeNotAllowed" });
        const user = userEvent.setup();

        for (const button of screen.getAllByRole("button")) {
            expect((button as HTMLButtonElement).disabled).toBe(true);
        }
        await user.tab();
        const reason = screen.getByRole("note", { name: "You don't have access to the scope of this item." });
        expect(document.activeElement).toBe(reason);
        expect(await screen.findByRole("tooltip")).toBeTruthy();
    });

    it("reports a link that couldn't be copied", async () => {
        const user = userEvent.setup();
        vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("Not allowed"));
        const { onCopyLinkError } = renderActions({ status: "available", loadUrl: async () => "/pages/page-1" });

        await user.click(screen.getByRole("button", { name: "Copy link" }));

        await waitFor(() => expect(onCopyLinkError).toHaveBeenCalledTimes(1));
    });
});
