---
"@dextinity/cms-api": minor
---

Add `AiModeMcpModule`, the MCP server of the admin's AI Mode

The module serves an MCP server at `/mcp` for the AI Hub chat in the admin. Its tools let the agent list and read the page tree, the DAM files and the block schemas, as the user the request was authenticated as: each tool checks its permission and scope as the corresponding resolver does, and the route requires the `aiHub` permission. For a DAM without scope, leave out `dam.scopeSchema`. A project adds tools of its own, e.g. for its documents, with `tools`, and can use `McpSignedInUserGuard`, `McpRefusalReasonFilter` and `McpNotFoundFilter` for them.

The module, guard and filters are exported from the new entry point `@dextinity/cms-api/ai-mode`, so that projects without the AI Mode don't load its dependencies. It requires `@nestjs/mcp`, `@modelcontextprotocol/server` and `zod`, which are optional peer dependencies: add them to your API's dependencies to use the AI Mode. `@nestjs/mcp` must be the same copy as your project's, so that its `@Tool` decorator registers your tools.

**Example**

```ts
import { AiModeMcpModule } from "@dextinity/cms-api/ai-mode";

AiModeMcpModule.forRoot({
    adminUrl: config.adminUrl,
    blockMetaPath: fileURLToPath(new URL("../block-meta.json", import.meta.url)),
    dam: { File: DamFile, scopeSchema: z.strictObject({ domain: z.string() }) },
    pageTree: {
        PageTreeNode,
        scopeSchema: z.strictObject({ domain: z.string(), language: z.string() }),
        categorySchema: z.enum(PageTreeNodeCategory),
    },
    tools: [PageTools],
}),
```
