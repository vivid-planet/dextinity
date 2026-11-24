import { RouterMemoryRouter } from "@dextinity/admin";
import { cleanup, render, screen } from "test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { CurrentUserContext, type CurrentUserInterface, type Permission } from "../userPermissions/hooks/currentUser";
import { AiModeHeaderItem } from "./AiModeHeaderItem";
import { AiModeProvider, type AiModeProviderProps } from "./AiModeProvider";
import { useAiModeToolset } from "./AiModeToolsets";

const currentUser = {
    id: "user-1",
    name: "Editor",
    email: "editor@example.com",
    impersonated: false,
    authenticatedUser: null,
    permissions: [],
    allowedContentScopes: [],
} as CurrentUserInterface;

function PageWithAiModeToolset() {
    useAiModeToolset({ id: "page", description: "A page" });
    return null;
}

function renderHeaderItem({
    hasToolset = true,
    permissions = ["pageTree"],
    ...props
}: { hasToolset?: boolean; permissions?: Permission[] } & Partial<AiModeProviderProps> = {}) {
    render(
        <RouterMemoryRouter>
            <CurrentUserContext.Provider value={{ currentUser, isAllowed: (user, permission) => permissions.includes(permission) }}>
                <AiModeProvider
                    webComponentScriptSrc="https://ai-hub.test/ai-hub-chat.mjs"
                    widgetId="widget-1"
                    aiHubProxyUrl="https://admin.test/api/ai-hub"
                    mcpServerUrl="https://admin.test/api/mcp"
                    requiredPermission="pageTree"
                    {...props}
                >
                    <AiModeHeaderItem />
                    {hasToolset && <PageWithAiModeToolset />}
                </AiModeProvider>
            </CurrentUserContext.Provider>
        </RouterMemoryRouter>,
    );
}

describe("AiModeProvider", () => {
    afterEach(() => {
        cleanup();
    });

    it("makes the AI Mode available on a page that registers an AI Mode toolset", () => {
        renderHeaderItem();

        expect(screen.getByRole("switch", { name: "AI Companion" })).toBeEnabled();
    });

    it("makes the AI Mode unavailable on a page without an AI Mode toolset", () => {
        renderHeaderItem({ hasToolset: false });

        expect(screen.getByRole("switch", { name: "AI Companion" })).toBeDisabled();
    });

    it("doesn't offer the AI Mode to a user without the required permission", () => {
        renderHeaderItem({ permissions: ["dam"] });

        expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    });

    it("doesn't offer the AI Mode without the widget", () => {
        renderHeaderItem({ widgetId: undefined });

        expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    });
});
