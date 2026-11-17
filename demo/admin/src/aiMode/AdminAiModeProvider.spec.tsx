import { ContentScopeProvider, CurrentUserContext, type CurrentUserInterface, type Permission } from "@dextinity/cms-admin";
import { renderAdmin } from "@src/testing/renderAdmin";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminAiModeProvider } from "./AdminAiModeProvider";
import { useAiMode } from "./AiModeContext";
import { AiModeHeaderItem } from "./AiModeHeaderItem";

vi.mock("@src/config", () => ({
    createConfig: () => ({ aiHubWebComponentScriptSrc: "https://ai-hub.test/ai-hub-chat.mjs", aiHubWidgetId: "widget-1" }),
}));

const currentUser = {
    id: "user-1",
    name: "Editor",
    email: "editor@example.com",
    impersonated: false,
    authenticatedUser: null,
    permissions: [],
    allowedContentScopes: [{ scope: { domain: "main", language: "en" }, label: { domain: "Main", language: "English" } }],
} as CurrentUserInterface;

// Mirrors `MasterHeader`, which pulls in header items that need far more context than this spec provides.
function MasterHeaderAiModeItem() {
    const { isEnabled } = useAiMode();

    return isEnabled ? <AiModeHeaderItem /> : null;
}

function renderHeaderItemAt(route: string, { permissions = ["aiHub"] }: { permissions?: Permission[] } = {}) {
    renderAdmin(
        <CurrentUserContext.Provider value={{ currentUser, isAllowed: (user, permission) => permissions.includes(permission) }}>
            <ContentScopeProvider>
                {() => (
                    <AdminAiModeProvider>
                        <MasterHeaderAiModeItem />
                    </AdminAiModeProvider>
                )}
            </ContentScopeProvider>
        </CurrentUserContext.Provider>,
        { route },
    );
}

describe("AdminAiModeProvider", () => {
    it.each(["/main/en/pages/pagetree/main-navigation", "/main/en/pages/pagetree/top-menu/1/edit"])("makes the AI Mode available at %s", (route) => {
        renderHeaderItemAt(route);

        expect(screen.getByRole("switch", { name: "AI Companion" })).toBeEnabled();
    });

    it.each(["/main/en/dashboard", "/main/en/assets"])("makes the AI Mode unavailable at %s", (route) => {
        renderHeaderItemAt(route);

        expect(screen.getByRole("switch", { name: "AI Companion" })).toBeDisabled();
    });

    it("doesn't offer the AI Mode to a user without the aiHub permission", () => {
        renderHeaderItemAt("/main/en/pages/pagetree/main-navigation", { permissions: ["pageTree"] });

        expect(screen.queryByRole("switch", { name: "AI Companion" })).not.toBeInTheDocument();
    });
});
