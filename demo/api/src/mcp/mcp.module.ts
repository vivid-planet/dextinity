import { type DynamicModule, Module } from "@nestjs/common";
import { MCP_STRATEGY } from "@rekog/mcp-nest";

import { BlockTools } from "./block.tools.js";
import { DamTools } from "./dam.tools.js";
import { createMcpServer } from "./mcp.factory.js";
import { PageTreeTools } from "./page-tree.tools.js";

/**
 * The server side of the admin's AI Mode: tools that give the agent the page tree, the saved pages, the DAM files
 * and the block schemas, read as the user the request was authenticated as.
 */
@Module({})
export class AiModeMcpModule {
    // The module owns the server it declares: it builds route controller and strategy together and hands
    // the strategy out under rekog's own token, which `main.ts` reads to connect it as a microservice.
    static forRoot({ authModule }: { authModule: DynamicModule }): DynamicModule {
        const { strategy, controller } = createMcpServer();

        return {
            module: AiModeMcpModule,
            // For the AccessControlService the tools check permissions with.
            imports: [authModule],
            // The tool classes are controllers, not providers: NestJS only scans `controllers` for the
            // @MessagePattern handlers that @Tool registers.
            controllers: [controller, BlockTools, DamTools, PageTreeTools],
            providers: [{ provide: MCP_STRATEGY, useValue: strategy }],
        };
    }
}
