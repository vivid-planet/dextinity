import { type DynamicModule, Module, type Type } from "@nestjs/common";
import { McpModule } from "@nestjs/mcp";
import type { z } from "zod";

import { CorePermission } from "../common/enum/core-permission.enum.js";
import type { FileInterface } from "../dam/files/entities/file.entity.js";
import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator.js";
import { AI_MODE_MCP_OPTIONS } from "./ai-mode-mcp.constants.js";
import { BlockTools } from "./block.tools.js";
import { createDamTools } from "./dam.tools.js";
import { createPageTreeTools, type PageTreeToolsOptions } from "./page-tree.tools.js";

export interface AiModeMcpModuleOptions {
    /** The URL of the admin, from whose pages the AI Mode's chat calls the server. */
    adminUrl: string;
    /** The `block-meta.json` of the API, which the block tools answer from. */
    blockMetaPath: string;
    dam: {
        File: Type<FileInterface>;
        /** The schema of the DAM's scope, which the agent passes to list the files of a scope. Leave it out for a DAM without scope. */
        scopeSchema?: z.ZodType;
    };
    pageTree: PageTreeToolsOptions;
    /** The project's own tools, e.g. for its documents. */
    tools?: Type[];
}

/**
 * The MCP server of the admin's AI Mode: tools that give the agent the page tree, the DAM files, the block schemas and
 * what the project adds, e.g. its documents, read as the user the request was authenticated as.
 */
@Module({})
export class AiModeMcpModule {
    static forRoot({ adminUrl, blockMetaPath, dam, pageTree, tools = [] }: AiModeMcpModuleOptions): DynamicModule {
        return {
            module: AiModeMcpModule,
            imports: [
                McpModule.forRoot({
                    name: "dextinity-admin",
                    version: "1.0.0",
                    path: "mcp",
                    // As the AI Hub proxy: the server serves the AI Mode's chat. No scope, because a JSON-RPC request
                    // carries none; each tool declares the permission and the scope it reads.
                    decorators: [RequiredPermission(CorePermission.aiHub, { skipScopeCheck: true })],
                    include: [AiModeMcpModule],
                    // The chat calls the server from the admin in the browser.
                    http: { allowedOrigins: [new URL(adminUrl).hostname] },
                }),
            ],
            providers: [
                { provide: AI_MODE_MCP_OPTIONS, useValue: { blockMetaPath } },
                BlockTools,
                createDamTools(dam),
                createPageTreeTools(pageTree),
                ...tools,
            ],
        };
    }
}
