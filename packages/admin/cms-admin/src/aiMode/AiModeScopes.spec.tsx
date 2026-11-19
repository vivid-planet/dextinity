import { type PropsWithChildren, type ReactNode, StrictMode } from "react";
import { render } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
    AiModeScope,
    type AiModeScopeOptions,
    AiModeScopesProvider,
    type AiModeScopesStore,
    type AiModeTool,
    useAiModeScope,
    useAiModeScopesStore,
} from "./AiModeScopes";

function createTool(name: string, handler: AiModeTool["handler"] = () => name): AiModeTool {
    return { name, description: `The tool ${name}`, inputSchema: { type: "object", properties: {} }, handler };
}

function RegisteredScope({ scope }: { scope: AiModeScopeOptions | null }) {
    useAiModeScope(scope);
    return null;
}

let store: AiModeScopesStore;

function CaptureStore({ children }: PropsWithChildren) {
    store = useAiModeScopesStore();
    return <>{children}</>;
}

function renderScopes(children: ReactNode, { isStrictMode = false }: { isStrictMode?: boolean } = {}) {
    const tree = (node: ReactNode) => (
        <AiModeScopesProvider>
            <CaptureStore>{node}</CaptureStore>
        </AiModeScopesProvider>
    );
    const result = render(isStrictMode ? <StrictMode>{tree(children)}</StrictMode> : tree(children));
    return { ...result, rerender: (node: ReactNode) => result.rerender(isStrictMode ? <StrictMode>{tree(node)}</StrictMode> : tree(node)) };
}

describe("AI Mode scopes", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    // React runs the effects of children before those of their parents, so the registration order alone would put
    // the edit page before the page tree it is opened in.
    it("orders a scope below the scope it is rendered in, whatever the order they register in", () => {
        renderScopes(
            <AiModeScope id="pageTree" description="Page tree">
                <RegisteredScope scope={{ id: "page", description: "Page" }} />
            </AiModeScope>,
        );

        expect(store.getScopes().map(({ id }) => id)).toEqual(["pageTree", "page"]);
    });

    it("unregisters a scope when it unmounts or is passed null, also in StrictMode", () => {
        const { rerender } = renderScopes(<RegisteredScope scope={{ id: "page", description: "Page" }} />, { isStrictMode: true });
        expect(store.getScopes()).toHaveLength(1);

        rerender(<RegisteredScope scope={null} />);
        expect(store.getScopes()).toHaveLength(0);

        rerender(<RegisteredScope scope={{ id: "page", description: "Page" }} />);
        expect(store.getScopes()).toHaveLength(1);

        rerender(null);
        expect(store.getScopes()).toHaveLength(0);
    });

    it("notifies only of a change the agent sees, not of new handlers", () => {
        const { rerender } = renderScopes(
            <RegisteredScope scope={{ id: "page", description: "Page", context: { hasChanges: false }, tools: [createTool("a")] }} />,
        );
        const listener = vi.fn();
        store.subscribe(listener);

        rerender(
            <RegisteredScope scope={{ id: "page", description: "Page", context: { hasChanges: false }, tools: [createTool("a", () => "new")] }} />,
        );
        expect(listener).not.toHaveBeenCalled();

        rerender(<RegisteredScope scope={{ id: "page", description: "Page", context: { hasChanges: true }, tools: [createTool("a")] }} />);
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("hands out the handler of the latest render", async () => {
        const { rerender } = renderScopes(<RegisteredScope scope={{ id: "page", description: "Page", tools: [createTool("a", () => "first")] }} />);

        rerender(<RegisteredScope scope={{ id: "page", description: "Page", tools: [createTool("a", () => "second")] }} />);

        expect(await store.getTool("a")?.handler({}, { clearTextSelection: vi.fn() })).toBe("second");
    });

    it("leaves out a tool whose name an outer scope already has, and says so", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

        renderScopes(
            <AiModeScope id="pageTree" description="Page tree" tools={[createTool("a", () => "outer")]}>
                <RegisteredScope scope={{ id: "page", description: "Page", tools: [createTool("a", () => "inner"), createTool("b")] }} />
            </AiModeScope>,
        );

        expect(store.getTools().map(({ name }) => name)).toEqual(["a", "b"]);
        expect(store.getTool("a")?.handler({}, { clearTextSelection: vi.fn() })).toBe("outer");
        expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('The AI Mode scope "page" has a tool "a"'));
    });

    it("lists the tools of the mounted scopes only", () => {
        const { rerender } = renderScopes(
            <AiModeScope id="pageTree" description="Page tree" tools={[createTool("open_page")]}>
                <RegisteredScope scope={{ id: "page", description: "Page", tools: [createTool("edit_blocks")] }} />
            </AiModeScope>,
        );
        expect(store.getTools().map(({ name }) => name)).toEqual(["open_page", "edit_blocks"]);

        rerender(<AiModeScope id="pageTree" description="Page tree" tools={[createTool("open_page")]} />);

        expect(store.getTools().map(({ name }) => name)).toEqual(["open_page"]);
        expect(store.getTool("edit_blocks")).toBeUndefined();
    });
});
