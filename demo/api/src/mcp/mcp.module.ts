import { RequiredPermission } from "@dextinity/cms-api";
import { type DynamicModule, Module } from "@nestjs/common";
import { McpModule } from "@nestjs/mcp";

import { BlockTools } from "./block.tools.js";
import { DamTools } from "./dam.tools.js";
import { PageTreeTools } from "./page-tree.tools.js";

/**
 * The server side of the admin's AI Mode: tools that give the agent the page tree, the saved pages, the DAM files
 * and the block schemas, read as the user the request was authenticated as.
 */
@Module({})
export class AiModeMcpModule {
    static forRoot({ adminUrl }: { adminUrl: string }): DynamicModule {
        return {
            module: AiModeMcpModule,
            imports: [
                McpModule.forRoot({
                    name: "dextinity-demo-admin",
                    version: "1.0.0",
                    path: "mcp",
                    // No scope: a JSON-RPC request carries none. Each tool declares the scope it reads.
                    decorators: [RequiredPermission("pageTree", { skipScopeCheck: true })],
                    include: [AiModeMcpModule],
                    // The chat calls the server from the admin in the browser.
                    http: { allowedOrigins: [new URL(adminUrl).hostname] },
                }),
            ],
            providers: [BlockTools, DamTools, PageTreeTools],
        };
    }
}
