import { CurrentUserContext, type CurrentUserInterface, type Permission, useAiModeToolset } from "@dextinity/cms-admin";
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

function PageWithAiModeToolset() {
    useAiModeToolset({ id: "page", description: "A page" });
    return null;
}

function renderHeaderItem({ hasToolset = true, permissions = ["aiHub"] }: { hasToolset?: boolean; permissions?: Permission[] } = {}) {
    renderAdmin(
        <CurrentUserContext.Provider value={{ currentUser, isAllowed: (user, permission) => permissions.includes(permission) }}>
            <AdminAiModeProvider>
                <MasterHeaderAiModeItem />
                {hasToolset && <PageWithAiModeToolset />}
            </AdminAiModeProvider>
        </CurrentUserContext.Provider>,
    );
}

describe("AdminAiModeProvider", () => {
    it("makes the AI Mode available on a page that registers an AI Mode toolset", () => {
        renderHeaderItem();

        expect(screen.getByRole("switch", { name: "AI Companion" })).toBeEnabled();
    });

    it("makes the AI Mode unavailable on a page without an AI Mode toolset", () => {
        renderHeaderItem({ hasToolset: false });

        expect(screen.getByRole("switch", { name: "AI Companion" })).toBeDisabled();
    });

    it("doesn't offer the AI Mode to a user without the aiHub permission", () => {
        renderHeaderItem({ permissions: ["pageTree"] });

        expect(screen.queryByRole("switch", { name: "AI Companion" })).not.toBeInTheDocument();
    });
});
