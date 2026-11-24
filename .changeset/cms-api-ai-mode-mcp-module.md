---
"@dextinity/cms-api": major
---

Add `AiModeMcpModule`, the MCP server of the admin's AI Mode

The module serves an MCP server at `/mcp` for the AI Hub chat in the admin. Its tools let the agent list and read the DAM files and the block schemas, as the user the request was authenticated as: each tool checks its permission and scope as the corresponding resolver does, and the route requires the `aiHub` permission. A project adds tools of its own, e.g. for its documents, with `tools`, and can use `McpSignedInUserGuard`, `McpRefusalReasonFilter` and `McpNotFoundFilter` for them.

`@nestjs/mcp`, `@modelcontextprotocol/server` and `zod` are now peer dependencies. Add them to your API's dependencies if they aren't there yet. `@nestjs/mcp` must be the same copy as your project's, so that its `@Tool` decorator registers your tools.

**Example**

```ts
AiModeMcpModule.forRoot({
    adminUrl: config.adminUrl,
    blockMetaPath: fileURLToPath(new URL("../block-meta.json", import.meta.url)),
    dam: { File: DamFile, scopeSchema: z.strictObject({ domain: z.string() }) },
    tools: [PageTreeTools],
}),
```
