// The API the `ai-hub-chat` web component exposes as its `bridge` property.

type McpServer = { url: string; headers?: Record<string, string> };

export type HostTool = {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    readOnlyHint?: boolean;
    metadata?: Record<string, string>;
    handler: (args: Record<string, unknown>) => Promise<unknown> | unknown;
};

type ClientContext = Record<string, unknown> | null;

export type BridgeElement = HTMLElement & {
    bridge?: {
        registerMcpServers: (servers: McpServer[]) => void;
        registerHostTools: (tools: HostTool[]) => void;
        setContext: (context: ClientContext) => void;
    };
};
