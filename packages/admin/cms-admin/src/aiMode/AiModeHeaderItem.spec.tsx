import { RouterMemoryRouter } from "@dextinity/admin";
import type { PropsWithChildren } from "react";
import { cleanup, fireEvent, render, screen } from "test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { CurrentUserContext, type CurrentUserInterface } from "../userPermissions/hooks/currentUser";
import { AiModeHeaderItem } from "./AiModeHeaderItem";
import { AiModeProvider } from "./AiModeProvider";
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

function AiMode({ children }: PropsWithChildren) {
    return (
        <RouterMemoryRouter>
            <CurrentUserContext.Provider value={{ currentUser, isAllowed: () => true }}>
                <AiModeProvider
                    webComponentScriptSrc="https://ai-hub.test/ai-hub-chat.mjs"
                    widgetId="widget-1"
                    aiHubProxyUrl="https://admin.test/api/ai-hub"
                    mcpServerUrl="https://admin.test/api/mcp"
                    requiredPermission="pageTree"
                >
                    {children}
                </AiModeProvider>
            </CurrentUserContext.Provider>
        </RouterMemoryRouter>
    );
}

describe("AiModeHeaderItem", () => {
    afterEach(() => {
        cleanup();
        localStorage.clear();
    });

    it("switches the AI Companion on and off", () => {
        render(
            <AiMode>
                <AiModeHeaderItem />
                <PageWithAiModeToolset />
            </AiMode>,
        );
        const toggle = screen.getByRole("switch", { name: "AI Companion" });

        expect(toggle).not.toBeChecked();

        fireEvent.click(toggle);
        expect(toggle).toBeChecked();

        fireEvent.click(toggle);
        expect(toggle).not.toBeChecked();
    });

    it("is switched off and disabled on a page without the AI Mode, and says so", async () => {
        localStorage.setItem("ai-mode-open", "true");
        render(
            <AiMode>
                <AiModeHeaderItem />
            </AiMode>,
        );
        const toggle = screen.getByRole("switch", { name: "AI Companion" });

        expect(toggle).not.toBeChecked();
        expect(toggle).toBeDisabled();

        fireEvent.mouseOver(toggle.parentElement as HTMLElement);
        expect(await screen.findByRole("tooltip")).toHaveTextContent("Not available on this page");
    });

    it("shows the label and the icon it is given", () => {
        render(
            <AiMode>
                <AiModeHeaderItem label="Assistant" icon={<span data-testid="assistant-icon" />} />
                <PageWithAiModeToolset />
            </AiMode>,
        );

        expect(screen.getByRole("switch", { name: "Assistant" })).toContainElement(screen.getByTestId("assistant-icon"));
    });

    it("renders nothing without an AiModeProvider", () => {
        render(<AiModeHeaderItem />);

        expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    });
});
