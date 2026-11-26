---
"@dextinity/cms-api": minor
---

Add `AiHubModule` and the `aiHub` permission

The module serves a proxy at `/ai-hub` for the chat web component of the Dextinity AI Hub. The chat sends its requests to the API instead of the AI Hub API, so the secret key of the widget stays on the server, and the conversations belong to the user the request was authenticated as: the proxy sets that user's ID wherever the AI Hub reads one. Only the requests the chat makes are forwarded. Users need the new `aiHub` permission.

**Example**

```ts
AiHubModule.register({
    apiUrl: config.aiHub.apiUrl,
    apiKey: config.aiHub.apiKey,
}),
```

**Body size**

The chat sends the whole conversation with every message, so a long chat outgrows the JSON body limit of most apps. Raise the limit for the proxy in `main.ts`, before the app's own JSON parser, which skips a body that is already parsed. The AI Hub accepts 10 MB:

```ts
app.use("/api/ai-hub", json({ limit: "10mb" }));
app.use(json({ limit: "1mb" }));
```

The proxy pipes the file uploads and speech recordings of the chat through unread, so no middleware may read a `multipart/form-data` body below `/api/ai-hub`.
