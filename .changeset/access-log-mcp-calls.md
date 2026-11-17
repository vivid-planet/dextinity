---
"@dextinity/cms-api": patch
---

Log MCP tool calls of `@nestjs/mcp` in the access log

`AccessLogInterceptor` treated every call that isn't a GraphQL operation as an HTTP request and threw for MCP calls. It now logs them with the IP address, the user, the tool name, and the arguments that identify what the tool acted on: the ID arguments of `@AffectedEntity()`, the `scope` argument, and the scope of `@AffectedScope()`. The rest of the tool input isn't logged, since MCP tools pass content and free text as top-level arguments.
