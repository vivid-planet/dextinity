---
"@dextinity/cms-api": patch
---

Answer errors of MCP tool calls of `@nestjs/mcp` with their message in `ExceptionFilter`

`ExceptionFilter` treated every call that isn't a GraphQL operation as an HTTP request and wrote the error to its response. An MCP call has no response, so the filter failed, and the agent got "Internal server error" instead of the exception's message, e.g. of a `NotFoundException` a tool throws. The filter now rethrows the exception of an MCP call, which `@nestjs/mcp` turns into the tool's error result.
