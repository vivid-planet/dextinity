import { RouterMemoryRouter } from "@dextinity/admin";
import { type ReactNode, StrictMode, useState } from "react";
import { DndProvider, useDragDropManager } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useLocation, useNavigate } from "react-router";
import { cleanup, fireEvent, render, screen } from "test-utils";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { CurrentUserContext, type CurrentUserInterface } from "../userPermissions/hooks/currentUser";
import { AiModeProvider } from "./AiModeProvider";
import { AiModeSidePanel } from "./AiModeSidePanel";
import { type AiModeTool, AiModeToolset, useAiModeToolset } from "./AiModeToolsets";

const scriptSrc = "https://ai-hub.test/ai-hub-chat.mjs";

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
    const navigate = useNavigate();
    return <button onClick={() => navigate(topMenuPath)}>Open top menu</button>;
}

type DragDropManager = ReturnType<typeof useDragDropManager>;

const reactDndGlobalInstanceKey = Symbol.for("__REACT_DND_CONTEXT_INSTANCE__");

function getReactDndGlobalInstance() {
    return (window as unknown as Record<symbol, { dragDropManager: DragDropManager } | null | undefined>)[reactDndGlobalInstanceKey];
}

let adminDragDropManager: DragDropManager | undefined;

function CaptureDragDropManager() {
    adminDragDropManager = useDragDropManager();
    return null;
}

function createTool(name: string, handler: AiModeTool["handler"] = () => name): AiModeTool {
    return { name, description: `The tool ${name}`, inputSchema: { type: "object", properties: {} }, handler };
}

function OpenablePage() {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("Home");

    return (
        <>
            {isOpen && <Page title={title} />}
            <button onClick={() => setIsOpen((value) => !value)}>Toggle page</button>
            <button onClick={() => setTitle("About us")}>Rename page</button>
        </>
    );
}

function Page({ title }: { title: string }) {
    useAiModeToolset({
        id: "page",
        description: "A page",
        context: { title },
        tools: [
            createTool("edit_page", (args, { clearTextSelection }) => {
                clearTextSelection();
                return `Edited ${title}`;
            }),
        ],
    });
    return null;
}

// Registers its toolset in the commit that navigates to the top menu, like a page whose data is cached.
function TopMenuToolset() {
    const { pathname } = useLocation();
    useAiModeToolset(pathname === topMenuPath ? { id: "topMenu", description: "The top menu", tools: [createTool("edit_top_menu")] } : null);
    return null;
}

function getRegisteredTools() {
    return bridge.registerHostTools.mock.lastCall?.[0] as Array<{ name: string; handler: (args: Record<string, unknown>) => unknown }>;
}

// Unmounts the side panel alone, as closing it does, while the admin's DndProvider stays.
function RemovableSidePanel() {
    const [isMounted, setIsMounted] = useState(true);

    return (
        <>
            {isMounted && <AiModeSidePanel />}
            <button onClick={() => setIsMounted(false)}>Remove side panel</button>
        </>
    );
}

function renderSidePanel({ isStrictMode = false, beforeSidePanel }: { isStrictMode?: boolean; beforeSidePanel?: ReactNode } = {}) {
    const tree = (
        <RouterMemoryRouter initialEntries={["/main/en/pages/pagetree/main-navigation"]}>
            <CurrentUserContext.Provider value={{ currentUser, isAllowed: () => true }}>
                <DndProvider backend={HTML5Backend}>
                    <CaptureDragDropManager />
                    <AiModeProvider
                        webComponentScriptSrc={scriptSrc}
                        widgetId="widget-1"
                        aiHubProxyUrl="https://admin.test/api/ai-hub"
                        mcpServerUrl="https://admin.test/api/mcp"
                        requiredPermission="pageTree"
                    >
                        <AiModeToolset id="pageTree" description="The page tree" tools={[createTool("open_page_tree_node")]}>
                            {beforeSidePanel}
                            <RemovableSidePanel />
                            <OpenTopMenuButton />
                            <OpenablePage />
                        </AiModeToolset>
                    </AiModeProvider>
                </DndProvider>
            </CurrentUserContext.Provider>
        </RouterMemoryRouter>
    );

    return render(isStrictMode ? <StrictMode>{tree}</StrictMode> : tree);
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

describe("AiModeSidePanel", () => {
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
        vi.clearAllMocks();
        localStorage.setItem("ai-mode-open", "true");
        // Marks the script as loaded, so that `ScriptLoader` renders the chat right away.
        const script = document.createElement("script");
        script.id = scriptSrc;
        script.dataset.loaded = "true";
        document.body.appendChild(script);
    });

    afterEach(() => {
        cleanup();
        localStorage.clear();
        document.getElementById(scriptSrc)?.remove();
        vi.useRealTimers();
        delete (window as unknown as Record<symbol, unknown>)[reactDndGlobalInstanceKey];
    });

    it("points the chat at the AI Hub proxy of the API, with the widget and the current user", () => {
        const { container } = renderSidePanel();

        const chat = container.querySelector("ai-hub-chat");
        expect(chat).toHaveAttribute("api-url", "https://admin.test/api/ai-hub");
        expect(chat).toHaveAttribute("widget-id", "widget-1");
        expect(chat).toHaveAttribute("user-id", "user-1");
        expect(chat).not.toHaveAttribute("api-key");
    });

    it("registers the MCP server of the API and the host tools once, and pushes the new location on navigation", () => {
        renderSidePanel();

        expect(bridge.registerMcpServers).toHaveBeenCalledExactlyOnceWith([{ url: "https://admin.test/api/mcp" }]);
        expect(bridge.registerHostTools).toHaveBeenCalledTimes(1);
        expect(getRegisteredTools().map(({ name }) => name)).toEqual(["open_page_tree_node"]);

        fireEvent.click(screen.getByRole("button", { name: "Open top menu" }));

        expect(bridge.registerMcpServers).toHaveBeenCalledTimes(1);
        expect(bridge.registerHostTools).toHaveBeenCalledTimes(1);
        expect(bridge.setContext).toHaveBeenLastCalledWith(expect.objectContaining({ pathname: topMenuPath }));
    });

    it("registers the tools of every mounted toolset again when a toolset mounts or unmounts", () => {
        renderSidePanel();

        fireEvent.click(screen.getByRole("button", { name: "Toggle page" }));

        expect(bridge.registerHostTools).toHaveBeenCalledTimes(2);
        expect(getRegisteredTools().map(({ name }) => name)).toEqual(["open_page_tree_node", "edit_page"]);

        fireEvent.click(screen.getByRole("button", { name: "Toggle page" }));

        expect(bridge.registerHostTools).toHaveBeenCalledTimes(3);
        expect(getRegisteredTools().map(({ name }) => name)).toEqual(["open_page_tree_node"]);
    });

    it("registers the tools of a toolset that mounts in the same commit as a navigation", () => {
        renderSidePanel({ beforeSidePanel: <TopMenuToolset /> });

        fireEvent.click(screen.getByRole("button", { name: "Open top menu" }));

        expect(getRegisteredTools().map(({ name }) => name)).toEqual(["open_page_tree_node", "edit_top_menu"]);
    });

    it("calls the handler of the page's latest render, and doesn't register the tools again for it", async () => {
        renderSidePanel();
        fireEvent.click(screen.getByRole("button", { name: "Toggle page" }));
        const editPage = getRegisteredTools().find(({ name }) => name === "edit_page");

        fireEvent.click(screen.getByRole("button", { name: "Rename page" }));

        expect(bridge.registerHostTools).toHaveBeenCalledTimes(2);
        expect(await editPage?.handler({})).toBe("Edited About us");
    });

    it("answers a call of a tool whose page is gone instead of failing", async () => {
        renderSidePanel();
        fireEvent.click(screen.getByRole("button", { name: "Toggle page" }));
        const editPage = getRegisteredTools().find(({ name }) => name === "edit_page");

        fireEvent.click(screen.getByRole("button", { name: "Toggle page" }));

        expect(await editPage?.handler({})).toBe("edit_page isn't available on the page that is open in the admin anymore.");
    });

    it("pushes the mounted toolsets with their context and the names of their tools", () => {
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
        renderSidePanel();

        fireEvent.click(screen.getByRole("button", { name: "Toggle page" }));
        vi.runAllTimers();

        expect(bridge.setContext).toHaveBeenLastCalledWith(
            expect.objectContaining({
                toolsets: [
                    { id: "pageTree", description: "The page tree", context: undefined, tools: ["open_page_tree_node"] },
                    { id: "page", description: "A page", context: { title: "Home" }, tools: ["edit_page"] },
                ],
            }),
        );
    });

    it("lets a tool forget the selected text", async () => {
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
        renderSidePanel();
        fireEvent.click(screen.getByRole("button", { name: "Toggle page" }));
        const input = selectInTextField("Welcome to our website", { start: 11, end: 22 });
        vi.runAllTimers();

        await getRegisteredTools()
            .find(({ name }) => name === "edit_page")
            ?.handler({});
        vi.runAllTimers();

        expect(bridge.setContext).toHaveBeenLastCalledWith(expect.objectContaining({ selection: null }));
        input.remove();
    });

    it("pushes the text the user selects in the admin", () => {
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
        renderSidePanel();
        expect(bridge.setContext).toHaveBeenLastCalledWith(expect.objectContaining({ selection: null }));

        const input = selectInTextField("Welcome to our website", { start: 11, end: 22 });
        vi.runAllTimers();

        expect(bridge.setContext).toHaveBeenLastCalledWith(expect.objectContaining({ selection: { text: "our website", isTruncated: false } }));
        input.remove();
    });

    it("forgets the selected text on navigation", () => {
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
        renderSidePanel();
        const input = selectInTextField("Welcome to our website", { start: 11, end: 22 });
        vi.runAllTimers();

        fireEvent.click(screen.getByRole("button", { name: "Open top menu" }));
        vi.runAllTimers();

        expect(bridge.setContext).toHaveBeenLastCalledWith(expect.objectContaining({ selection: null }));
        input.remove();
    });

    // The chat's own react-dnd reuses the manager it finds on the window, and the admin's DndProvider takes it away again
    // when StrictMode runs its effects twice.
    it("shares the admin's drag and drop manager with the chat while it is open, also in StrictMode", () => {
        renderSidePanel({ isStrictMode: true });

        expect(getReactDndGlobalInstance()?.dragDropManager).toBe(adminDragDropManager);

        fireEvent.click(screen.getByRole("button", { name: "Remove side panel" }));

        expect(getReactDndGlobalInstance()).toBeFalsy();
    });

    it("leaves a drag and drop manager on the window that something else put there", () => {
        renderSidePanel({ isStrictMode: true });
        const otherInstance = { dragDropManager: {} as DragDropManager };
        (window as unknown as Record<symbol, unknown>)[reactDndGlobalInstanceKey] = otherInstance;

        fireEvent.click(screen.getByRole("button", { name: "Remove side panel" }));

        expect(getReactDndGlobalInstance()).toBe(otherInstance);
    });

    it("renders nothing without an AiModeProvider", () => {
        const { container } = render(<AiModeSidePanel />);

        expect(container).toBeEmptyDOMElement();
    });

    it("tells the user that the chat couldn't be loaded when its script fails", () => {
        document.getElementById(scriptSrc)?.remove();
        renderSidePanel();

        const script = document.getElementById(scriptSrc);
        if (!script) {
            throw new Error("The side panel added no script for the chat");
        }
        fireEvent.error(script);

        expect(screen.getByRole("alert")).toHaveTextContent("The chat couldn't be loaded.");
        expect(document.querySelector("ai-hub-chat")).toBeNull();
    });
});
