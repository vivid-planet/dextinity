---
title: Access Logging
---

There is an option to enable global access logging, where request data is logged in the standard output. The following information is logged:

- Timestamp
- Request type (GraphQL or HTTP)
- IP address
- User (if available)

For GraphQL requests, the following additional information is logged:

- Operation type
- Operation name
- Resolver function name
- For queries, the arguments (args)
- For mutations, the arguments excluding the input and data properties

For HTTP requests, the following is logged:

- The HTTP method
- The route
- For GET requests, the parameters

The access log allows to see who accessed what data and when. This can be useful for fulfilling legal requirements regarding data integrity or for forensics.

:::caution

When logging is active, all sensitive (confidential or personal) data must be encapsulated in an `input` or `data` object to ensure they do NOT appear in the logs.

:::

## Configure access logging in the application

The `shouldLogRequest` callback can be used to prevent logging for specific requests. For example, requests executed during a build should not be logged. In this function, you have access to the user and the request object. If the function returns `false`, no log will be emitted for this request.

The optional `userToLog` callback can be used to log additional user info (e.g. session-id). The default format is `user: ${user.id}`

The optional `argsToLog` callback can be used to change the logged GraphQL arguments, for instance, to redact sensitive values. It receives the arguments (for mutations without `input` and `data`) and the `GraphQLResolveInfo`, and returns the arguments to log. Return a new object instead of modifying `args`, because nested objects are shared with the resolver.

```ts
AccessLogModule.forRoot({
    argsToLog: ({ args }) => {
        if (typeof args.input === "object" && args.input !== null && "accessToken" in args.input) {
            return { ...args, input: { ...args.input, accessToken: "[REDACTED]" } };
        }
        return args;
    },
}),
```

There are two ways to integrate logging into an application:

**First option: Use the default implementation**

```ts
imports: [
    ...
    AccessLogModule,
    ...
]
```

**Second option: Configure logging**

```ts
imports: [
    ...
    AccessLogModule.forRoot({
        shouldLogRequest: ({user, req}) => {
            // do something
            return true; //or false
        },
        userToLog: (user: CurrentUser) => `user: ${user.id}`,
    }),
    ...
]
```
