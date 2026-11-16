---
"@dextinity/cms-api": patch
---

Log MCP tool calls of `@nestjs/mcp` in the access log

`AccessLogInterceptor` treated every call that isn't a GraphQL operation as an HTTP request and threw for MCP calls. It now logs them with the IP address, the user, the tool name, and the tool input without its `input` and `data` arguments, as it does for GraphQL mutations.
