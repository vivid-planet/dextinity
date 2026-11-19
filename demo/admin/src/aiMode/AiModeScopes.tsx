import { createContext, type PropsWithChildren, useContext, useEffect, useState, useSyncExternalStore } from "react";

import type { HostTool } from "./aiHubBridge";

/** What the flyout hands every tool call besides its arguments, for what the flyout owns rather than the page. */
type AiModeToolHelpers = {
    clearTextSelection: () => void;
};

export type AiModeTool = Omit<HostTool, "handler"> & {
    handler: (args: Record<string, unknown>, helpers: AiModeToolHelpers) => Promise<unknown> | unknown;
};

export type AiModeScopeOptions = {
    /** Names the scope in the context pushed to the agent, e.g. "pageTree". */
    id: string;
    /** Tells the agent what the user is looking at. */
    description: string;
    /** Pushed to the agent whenever it changes, so it should stay small. Pull larger state with a tool instead. */
    context?: Record<string, unknown>;
    /** The tool names must be unique across all scopes that are mounted at the same time. */
    tools?: AiModeTool[];
};

type Registration = {
    depth: number;
    order: number;
    scope: AiModeScopeOptions;
    signature: string;
};

export type AiModeScopesStore = {
    /** The mounted scopes, outermost first. */
    getScopes: () => AiModeScopeOptions[];
    /**
     * The tools of the mounted scopes, outermost scope first. A tool whose name an outer scope already uses is left out.
     * Their handlers may be stale: call a tool through `getTool`.
     */
    getTools: () => AiModeTool[];
    /** The tool of a mounted scope, with the handler of the latest render. */
    getTool: (name: string) => AiModeTool | undefined;
    register: (token: symbol, depth: number, scope: AiModeScopeOptions) => void;
    unregister: (token: symbol) => void;
    /** Notifies when a scope mounts or unmounts, or its description, context, or tool definitions change. */
    subscribe: (listener: () => void) => () => void;
};

// The handlers are left out: a page creates them anew on every render, and only what the agent sees counts as a change.
function getSignature(depth: number, { id, description, context, tools = [] }: AiModeScopeOptions) {
    return JSON.stringify({ depth, id, description, context, tools: tools.map(getToolDefinition) });
}

export function getToolDefinition({ handler: _handler, ...definition }: AiModeTool) {
    return definition;
}

function createAiModeScopesStore(): AiModeScopesStore {
    const registrations = new Map<symbol, Registration>();
    const listeners = new Set<() => void>();
    let nextOrder = 0;
    let scopes: AiModeScopeOptions[] = [];
    let tools: AiModeTool[] = [];

    const updateScopes = () => {
        scopes = [...registrations.values()]
            .sort((first, second) => first.depth - second.depth || first.order - second.order)
            .map(({ scope }) => scope);
    };

    const updateTools = () => {
        const toolsByName = new Map<string, AiModeTool>();
        for (const scope of scopes) {
            for (const tool of scope.tools ?? []) {
                if (toolsByName.has(tool.name)) {
                    // The chat would register it as "<name>_2", a name that no tool description mentions.
                    console.error(`The AI Mode scope "${scope.id}" has a tool "${tool.name}", which an outer scope already has. It is left out.`);
                    continue;
                }
                toolsByName.set(tool.name, tool);
            }
        }
        tools = [...toolsByName.values()];
    };

    const notify = () => {
        updateTools();
        for (const listener of listeners) {
            listener();
        }
    };

    return {
        getScopes: () => scopes,
        getTools: () => tools,
        getTool: (name) => {
            for (const scope of scopes) {
                const tool = scope.tools?.find((candidate) => candidate.name === name);
                if (tool) {
                    return tool;
                }
            }
            return undefined;
        },
        register: (token, depth, scope) => {
            const previous = registrations.get(token);
            const signature = getSignature(depth, scope);
            registrations.set(token, { depth, order: previous?.order ?? nextOrder++, scope, signature });
            updateScopes();

            if (previous?.signature !== signature) {
                notify();
            }
        },
        unregister: (token) => {
            if (!registrations.delete(token)) {
                return;
            }
            updateScopes();
            notify();
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
}

const AiModeScopesContext = createContext<AiModeScopesStore>(createAiModeScopesStore());

const AiModeScopeDepthContext = createContext(0);

export function AiModeScopesProvider({ children }: PropsWithChildren) {
    const [store] = useState(createAiModeScopesStore);

    return <AiModeScopesContext.Provider value={store}>{children}</AiModeScopesContext.Provider>;
}

export function useAiModeScopesStore() {
    return useContext(AiModeScopesContext);
}

export function useHasAiModeScopes() {
    const store = useAiModeScopesStore();

    return useSyncExternalStore(store.subscribe, () => store.getScopes().length > 0);
}

/**
 * Registers what the agent sees and can do while the calling component is mounted. Pass null for nothing, e.g. while
 * loading. Use `AiModeScope` instead for a scope that contains other scopes, so that they are ordered below it.
 */
export function useAiModeScope(scope: AiModeScopeOptions | null) {
    const store = useAiModeScopesStore();
    const depth = useContext(AiModeScopeDepthContext);
    const [token] = useState(() => Symbol());

    // Runs after every render, so that the store always holds the latest handlers. The store notifies only on a change
    // the agent sees, so a page needn't memoize its scope.
    useEffect(() => {
        if (scope) {
            store.register(token, depth, scope);
        } else {
            store.unregister(token);
        }
    });

    useEffect(() => {
        return () => {
            store.unregister(token);
        };
    }, [store, token]);
}

export function AiModeScope({ children, ...scope }: PropsWithChildren<AiModeScopeOptions>) {
    const depth = useContext(AiModeScopeDepthContext);
    useAiModeScope(scope);

    return <AiModeScopeDepthContext.Provider value={depth + 1}>{children}</AiModeScopeDepthContext.Provider>;
}
