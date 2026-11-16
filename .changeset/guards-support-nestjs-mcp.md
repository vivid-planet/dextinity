---
"@dextinity/cms-api": minor
---

Support MCP tool calls of `@nestjs/mcp` in `DextinityAuthGuard` and `UserPermissionsGuard`

`@nestjs/mcp` runs the app's global guards around every MCP tool call, so MCP tools can declare their permissions with `@RequiredPermission()`, `@AffectedEntity()` and `@AffectedScope()` like GraphQL resolvers:

```ts
@Injectable()
export class PageTools {
    @Tool({ name: "get_page", description: "…", inputSchema: z.object({ id: z.uuid() }) })
    @RequiredPermission("pageTree")
    @AffectedEntity(Page, { idArg: "id" })
    async getPage({ id }: { id: string }, @GetCurrentUser() user: CurrentUser) {
        // …
    }
}
```

Before, the guards read the tool input instead of the HTTP request and denied every call. They now authenticate the user from the HTTP request of the call and read the scope arguments from the tool input. `CdnGuard`, `@GetCurrentUser()`, `@RequestContext()` and `getRequestFromExecutionContext()` support MCP calls as well. MCP calls over stdio have no HTTP request and are denied unless the tool disables the Dextinity guards.
