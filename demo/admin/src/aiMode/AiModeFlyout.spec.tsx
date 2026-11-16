import { CurrentUserContext, type CurrentUserInterface } from "@dextinity/cms-admin";
import { renderAdmin } from "@src/testing/renderAdmin";
import { fireEvent, screen } from "@testing-library/react";
import { useHistory } from "react-router";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { AiModeProvider } from "./AiModeContext";
import { AiModeFlyout } from "./AiModeFlyout";

// `vi.mock` is hoisted above the imports, so what its factory reads has to be hoisted with it.
const { scriptSrc } = vi.hoisted(() => ({ scriptSrc: "https://ai-hub.test/ai-hub-chat.mjs" }));

vi.mock("@src/config", () => ({
    createConfig: () => ({
        apiUrl: "https://admin.test/api",
        aiHubWebComponentScriptSrc: scriptSrc,
        aiHubWidgetId: "widget-1",
    }),
}));

const currentUser = {
    id: "user-1",
    name: "Editor",
    email: "editor@example.com",
    impersonated: false,
    authenticatedUser: null,
    permissions: [],
    allowedContentScopes: [],
} as CurrentUserInterface;

const bridge = {
    registerMcpServers: vi.fn(),
    registerHostTools: vi.fn(),
    setContext: vi.fn(),
};

const topMenuPath = "/main/en/pages/pagetree/top-menu";

function OpenTopMenuButton() {
    const history = useHistory();
    return <button onClick={() => history.push(topMenuPath)}>Open top menu</button>;
}

function renderFlyout() {
    return renderAdmin(
        <CurrentUserContext.Provider value={{ currentUser, isAllowed: () => true }}>
            <AiModeProvider isEnabled isAvailable>
                <AiModeFlyout />
                <OpenTopMenuButton />
            </AiModeProvider>
        </CurrentUserContext.Provider>,
        { route: "/main/en/pages/pagetree/main-navigation" },
    );
}

function selectInTextField(value: string, { start, end }: { start: number; end: number }) {
    const input = document.createElement("input");
    input.value = value;
    document.body.appendChild(input);
    input.focus();
    input.setSelectionRange(start, end);
    document.dispatchEvent(new Event("selectionchange"));
    return input;
}

describe("AiModeFlyout", () => {
    beforeAll(() => {
        // Stands in for the web component, which the AI Hub script would define.
        customElements.define(
            "ai-hub-chat",
            class extends HTMLElement {
                bridge = bridge;
            },
        );
    });

    beforeEach(() => {
        localStorage.setItem("ai-mode-open", "true");
        // Marks the script as loaded, so that `ScriptLoader` renders the chat right away.
        const script = document.createElement("script");
        script.id = scriptSrc;
        document.body.appendChild(script);
    });

    afterEach(() => {
        localStorage.clear();
        document.getElementById(scriptSrc)?.remove();
        vi.useRealTimers();
    });

    it("points the chat at the AI Hub proxy of the API, with the widget and the current user", () => {
        const { container } = renderFlyout();

        const chat = container.querySelector("ai-hub-chat");
        expect(chat).toHaveAttribute("api-url", "https://admin.test/api/ai-hub");
        expect(chat).toHaveAttribute("widget-id", "widget-1");
        expect(chat).toHaveAttribute("user-id", "user-1");
        expect(chat).not.toHaveAttribute("api-key");
    });

    it("registers the MCP server of the API once, and pushes the new location on navigation", () => {
        renderFlyout();

        expect(bridge.registerMcpServers).toHaveBeenCalledExactlyOnceWith([{ url: "https://admin.test/api/mcp" }]);

        fireEvent.click(screen.getByRole("button", { name: "Open top menu" }));

        expect(bridge.registerMcpServers).toHaveBeenCalledTimes(1);
        expect(bridge.setContext).toHaveBeenLastCalledWith(expect.objectContaining({ pathname: topMenuPath }));
    });

    it("pushes the text the user selects in the admin", () => {
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
        renderFlyout();
        expect(bridge.setContext).toHaveBeenLastCalledWith(expect.objectContaining({ selection: null }));

        const input = selectInTextField("Welcome to our website", { start: 11, end: 22 });
        vi.runAllTimers();

        expect(bridge.setContext).toHaveBeenLastCalledWith(expect.objectContaining({ selection: { text: "our website", isTruncated: false } }));
        input.remove();
    });

    it("forgets the selected text on navigation", () => {
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
        renderFlyout();
        const input = selectInTextField("Welcome to our website", { start: 11, end: 22 });
        vi.runAllTimers();

        fireEvent.click(screen.getByRole("button", { name: "Open top menu" }));
        vi.runAllTimers();

        expect(bridge.setContext).toHaveBeenLastCalledWith(expect.objectContaining({ selection: null }));
        input.remove();
    });
});
