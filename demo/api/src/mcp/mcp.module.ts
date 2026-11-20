import { BuildsModule, RequiredPermission } from "@dextinity/cms-api";
import { type DynamicModule, Module } from "@nestjs/common";
import { McpModule } from "@nestjs/mcp";
import { PagesModule } from "@src/documents/pages/pages.module.js";

import { BlockTools } from "./block.tools.js";
import { DamTools } from "./dam.tools.js";
import { PageTreeTools } from "./page-tree.tools.js";
import { PageTreeEditingTools } from "./page-tree-editing.tools.js";

/**
 * The server side of the admin's AI Mode: tools that give the agent the page tree, the saved pages, the DAM files
 * and the block schemas, and let it change the page tree and save pages, as the user the request was authenticated as.
 */
@Module({})
export class AiModeMcpModule {
    static forRoot({ adminUrl }: { adminUrl: string }): DynamicModule {
        return {
            module: AiModeMcpModule,
            imports: [
                // For the BuildsService and the PagesService the editing tools mark changes and save pages with.
                BuildsModule,
                PagesModule,
                McpModule.forRoot({
                    name: "dextinity-demo-admin",
                    version: "1.0.0",
                    path: "mcp",
                    // As the AI Hub proxy: the server serves the AI Mode's chat. No scope, because a JSON-RPC request
                    // carries none; each tool declares the permission and the scope it reads.
                    decorators: [RequiredPermission("aiHub", { skipScopeCheck: true })],
                    include: [AiModeMcpModule],
                    // The chat calls the server from the admin in the browser.
                    http: { allowedOrigins: [new URL(adminUrl).hostname] },
                }),
            ],
            providers: [BlockTools, DamTools, PageTreeTools, PageTreeEditingTools],
        };
    }
}
