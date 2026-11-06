import { createMemoryHistory } from "history";
import type { PropsWithChildren } from "react";
import { Route, Router } from "react-router";
import { renderHook } from "test-utils";
import { describe, expect, it } from "vitest";

import { useEditorTabRoute } from "../useEditorTabRoute";

function renderTabRoute(pathname: string) {
    const history = createMemoryHistory({ initialEntries: [pathname] });
    const wrapper = ({ children }: PropsWithChildren) => (
        <Router history={history}>
            <Route path="/pages/:id/edit">{children}</Route>
        </Router>
    );
    return renderHook(() => useEditorTabRoute(["content", "stage", "config"]), { wrapper }).result.current;
}

describe("useEditorTabRoute", () => {
    it("selects the first tab at the editor's URL", () => {
        const tabRoute = renderTabRoute("/pages/page-id/edit");

        expect(tabRoute.selectedKey).toBe("content");
        expect(tabRoute.getTabUrl("content")).toBe("/pages/page-id/edit");
        expect(tabRoute.getTabUrl("stage")).toBe("/pages/page-id/edit/stage");
    });

    it("selects the tab of the URL, also below a nested route", () => {
        expect(renderTabRoute("/pages/page-id/edit/config").selectedKey).toBe("config");
        expect(renderTabRoute("/pages/page-id/edit/stage/block-id/blocks").selectedKey).toBe("stage");
    });

    it("keeps the first tab selected for nested routes of the first tab", () => {
        expect(renderTabRoute("/pages/page-id/edit/block-id/blocks").selectedKey).toBe("content");
    });
});
