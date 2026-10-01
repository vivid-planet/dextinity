---
"@dextinity/cms-admin": patch
---

Resolve the target language of `AzureAiTranslatorProvider` via `useContentLanguage`

The `targetLanguage` sent to the Azure AI translation queries was read directly from `scope.language`.
That only works in projects whose content scope happens to contain a `language` dimension.
It is now resolved through the `contentLanguage` config, like the rest of the admin.
