---
"@dextinity/cms-api": minor
---

Add `argsToLog` option to `AccessLogModule`

The callback receives the GraphQL arguments (after `input` and `data` have been removed from mutations) and the `GraphQLResolveInfo`, and returns the arguments that are logged.
Use it to redact sensitive values that aren't wrapped in `input` or `data`, for instance, in queries.

**Example**

```ts
AccessLogModule.forRoot({
    argsToLog: ({ args }) => {
        if (typeof args.input === "object" && args.input !== null && "accessToken" in args.input) {
            return { ...args, input: { ...args.input, accessToken: "[REDACTED]" } };
        }
        return args;
    },
});
```
