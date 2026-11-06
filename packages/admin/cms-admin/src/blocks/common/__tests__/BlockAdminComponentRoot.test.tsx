import { StackPage, StackSwitch } from "@dextinity/admin";
import { createMemoryHistory } from "history";
import { FormattedMessage } from "react-intl";
import { Route, Router } from "react-router";
import { cleanup, fireEvent, render, screen } from "test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { BlockAdminComponentRoot } from "../BlockAdminComponentRoot";

function renderBlockAdmin(initialEntry: string) {
    const history = createMemoryHistory({ initialEntries: [initialEntry] });
    render(
        <Router history={history}>
            <Route path="/page/edit">
                <BlockAdminComponentRoot title="Page">
                    <StackSwitch>
                        <StackPage name="list">Block list</StackPage>
                        <StackPage name="blocks" title={<FormattedMessage id="test.blocks.columns" defaultMessage="Columns" />}>
                            Block form
                        </StackPage>
                    </StackSwitch>
                </BlockAdminComponentRoot>
            </Route>
        </Router>,
    );
    return history;
}

describe("BlockAdminComponentRoot", () => {
    afterEach(() => {
        cleanup();
    });

    it("shows no breadcrumbs on the top level", () => {
        renderBlockAdmin("/page/edit");

        expect(screen.getByText("Block list")).toBeTruthy();
        expect(screen.queryByRole("navigation")).toBeNull();
    });

    it("shows the path to a nested block with the rendered page titles", () => {
        renderBlockAdmin("/page/edit/block-id/blocks");

        const breadcrumbs = screen.getByRole("navigation", { name: "Nested blocks" });
        expect(breadcrumbs.textContent).toContain("Page");
        expect(breadcrumbs.textContent).toContain("Columns");
    });

    it("navigates to a level when choosing its breadcrumb", () => {
        const history = renderBlockAdmin("/page/edit/block-id/blocks");

        fireEvent.click(screen.getByRole("link", { name: "Page" }));

        expect(history.location.pathname).toBe("/page/edit");
        expect(screen.getByText("Block list")).toBeTruthy();
    });
});
