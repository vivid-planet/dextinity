---
"@dextinity/cms-admin": minor
---

Let users choose the admin language in the user menu

Add `useAdminLanguageState` and `AdminLanguageProvider`.
`useAdminLanguageState` returns the admin language: the user's choice, which is stored in the browser, or else the closest supported browser language.
When an `AdminLanguageProvider` with more than one supported language is present, `UserHeaderItem` lists the supported languages, each named in itself.

**Example**

```tsx
const adminLanguage = useAdminLanguageState({ supportedLanguages: ["en", "de"], fallbackLanguage: "en" });
const { messages } = getLanguageConfig(adminLanguage.language);

<AdminLanguageProvider value={adminLanguage}>
    <IntlProvider locale={adminLanguage.language} messages={messages}>
        {/* ... */}
    </IntlProvider>
</AdminLanguageProvider>;
```
