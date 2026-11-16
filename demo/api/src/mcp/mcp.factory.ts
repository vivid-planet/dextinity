import { RequiredPermission } from "@dextinity/cms-api";
import { Controller, type Type } from "@nestjs/common";
import { McpHttpControllerFor, McpStrategy, StreamableHttpTransport } from "@rekog/mcp-nest";

interface McpServer {
    // Connected as a microservice in main.ts — this is what binds the @Tool handlers.
    strategy: McpStrategy;
    // Serves the /api/mcp route.
    controller: Type<unknown>;
}

// A strategy instance is single-use: it binds its handlers once, and neither close() nor a second
// connectMicroservice() resets them. Building the whole set per call keeps two apps in one process — the
// case a test suite runs into — from serving each other's handlers. The controller is declared in here
// with the transport because it has to name that exact instance, which is also why this is a function
// and not the module's own metadata.
export function createMcpServer(): McpServer {
    const transport = new StreamableHttpTransport();

    // The MCP endpoint as a regular Nest controller, so the global DextinityAuthGuard authenticates every
    // request before it reaches a tool and attaches the user the tools check their permissions against.
    // Naming the transport here also claims the route, which turns off the transport's own self-mount — and
    // a self-mounted route is registered straight on the HTTP adapter, past the Nest pipeline and its guards.
    @Controller("mcp")
    // No scope: a JSON-RPC request carries none. Each tool checks the scope it reads, see mcp-tool.utils.ts.
    @RequiredPermission("pageTree", { skipScopeCheck: true })
    class McpHttpController extends McpHttpControllerFor(transport) {}

    const strategy = new McpStrategy({
        name: "dextinity-demo-admin",
        // Required by @rekog/mcp-nest (McpServerOptions.version) — it's part of the MCP server-info handshake.
        version: "1.0.0",
        // Stateless is the default: no server-side session, so any replica of the API can answer.
        transports: [transport],
    });

    return { strategy, controller: McpHttpController };
}
