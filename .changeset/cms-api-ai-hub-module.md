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
