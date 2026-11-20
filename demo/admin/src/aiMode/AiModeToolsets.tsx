import { createContext, type PropsWithChildren, useContext, useEffect, useState, useSyncExternalStore } from "react";

import type { HostTool } from "./aiHubBridge";

/** What the flyout hands every tool call besides its arguments, for what the flyout owns rather than the page. */
type AiModeToolHelpers = {
    clearTextSelection: () => void;
};

export type AiModeTool = Omit<HostTool, "handler"> & {
    handler: (args: Record<string, unknown>, helpers: AiModeToolHelpers) => Promise<unknown> | unknown;
};

export type AiModeToolsetOptions = {
    /** Names the toolset in the context pushed to the agent, e.g. "pageTree". */
    id: string;
    /** Tells the agent what the user is looking at. */
    description: string;
    /** Pushed to the agent whenever it changes, so it should stay small. Pull larger state with a tool instead. */
    context?: Record<string, unknown>;
    /** The tool names must be unique across all toolsets that are mounted at the same time. */
    tools?: AiModeTool[];
};

type Registration = {
    depth: number;
    order: number;
    toolset: AiModeToolsetOptions;
    signature: string;
};

export type AiModeToolsetsStore = {
    /** The mounted toolsets, outermost first. */
    getToolsets: () => AiModeToolsetOptions[];
    /**
     * The tools of the mounted toolsets, outermost toolset first. A tool whose name an outer toolset already uses is left out.
     * Their handlers may be stale: call a tool through `getTool`.
     */
    getTools: () => AiModeTool[];
    /** The tool of a mounted toolset, with the handler of the latest render. */
    getTool: (name: string) => AiModeTool | undefined;
    register: (token: symbol, depth: number, toolset: AiModeToolsetOptions) => void;
    unregister: (token: symbol) => void;
    /** Notifies when a toolset mounts or unmounts, or its description, context, or tool definitions change. */
    subscribe: (listener: () => void) => () => void;
};

// The handlers are left out: a page creates them anew on every render, and only what the agent sees counts as a change.
function getSignature(depth: number, { id, description, context, tools = [] }: AiModeToolsetOptions) {
    return JSON.stringify({ depth, id, description, context, tools: tools.map(getToolDefinition) });
}

export function getToolDefinition({ handler: _handler, ...definition }: AiModeTool) {
    return definition;
}

function createAiModeToolsetsStore(): AiModeToolsetsStore {
    const registrations = new Map<symbol, Registration>();
    const listeners = new Set<() => void>();
    let nextOrder = 0;
    let toolsets: AiModeToolsetOptions[] = [];
    let tools: AiModeTool[] = [];

    const updateToolsets = () => {
        toolsets = [...registrations.values()]
            .sort((first, second) => first.depth - second.depth || first.order - second.order)
            .map(({ toolset }) => toolset);
    };

    const updateTools = () => {
        const toolsByName = new Map<string, AiModeTool>();
        for (const toolset of toolsets) {
            for (const tool of toolset.tools ?? []) {
                if (toolsByName.has(tool.name)) {
                    // The chat would register it as "<name>_2", a name that no tool description mentions.
                    console.error(
                        `The AI Mode toolset "${toolset.id}" has a tool "${tool.name}", which an outer toolset already has. It is left out.`,
                    );
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
        getToolsets: () => toolsets,
        getTools: () => tools,
        getTool: (name) => {
            for (const toolset of toolsets) {
                const tool = toolset.tools?.find((candidate) => candidate.name === name);
                if (tool) {
                    return tool;
                }
            }
            return undefined;
        },
        register: (token, depth, toolset) => {
            const previous = registrations.get(token);
            const signature = getSignature(depth, toolset);
            registrations.set(token, { depth, order: previous?.order ?? nextOrder++, toolset, signature });
            updateToolsets();

            if (previous?.signature !== signature) {
                notify();
            }
        },
        unregister: (token) => {
            if (!registrations.delete(token)) {
                return;
            }
            updateToolsets();
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

const AiModeToolsetsContext = createContext<AiModeToolsetsStore>(createAiModeToolsetsStore());

const AiModeToolsetDepthContext = createContext(0);

export function AiModeToolsetsProvider({ children }: PropsWithChildren) {
    const [store] = useState(createAiModeToolsetsStore);

    return <AiModeToolsetsContext.Provider value={store}>{children}</AiModeToolsetsContext.Provider>;
}

export function useAiModeToolsetsStore() {
    return useContext(AiModeToolsetsContext);
}

export function useHasAiModeToolsets() {
    const store = useAiModeToolsetsStore();

    return useSyncExternalStore(store.subscribe, () => store.getToolsets().length > 0);
}

/**
 * Registers what the agent sees and can do while the calling component is mounted. Pass null for nothing, e.g. while
 * loading. Use `AiModeToolset` instead for a toolset that contains other toolsets, so that they are ordered below it.
 */
export function useAiModeToolset(toolset: AiModeToolsetOptions | null) {
    const store = useAiModeToolsetsStore();
    const depth = useContext(AiModeToolsetDepthContext);
    const [token] = useState(() => Symbol());

    // Runs after every render, so that the store always holds the latest handlers. The store notifies only on a change
    // the agent sees, so a page needn't memoize its toolset.
    useEffect(() => {
        if (toolset) {
            store.register(token, depth, toolset);
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

export function AiModeToolset({ children, ...toolset }: PropsWithChildren<AiModeToolsetOptions>) {
    const depth = useContext(AiModeToolsetDepthContext);
    useAiModeToolset(toolset);

    return <AiModeToolsetDepthContext.Provider value={depth + 1}>{children}</AiModeToolsetDepthContext.Provider>;
}
