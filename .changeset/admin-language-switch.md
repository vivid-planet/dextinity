---
"@dextinity/cms-admin": minor
---

Let users choose the admin language in the user menu

Pass the languages the admin is translated to as `adminLanguage.supportedLanguages` to `DextinityConfigProvider`.
`UserHeaderItem` then lists them, each named in itself.
The user's choice is stored in the browser.
Until the user chooses, the closest supported browser language is used, or else the first supported language.

Read the admin language with `useAdminLanguage` to load the matching translations.
Declare the supported languages in `AdminLanguageOverrides` to type them:

```ts
declare module "@dextinity/cms-admin" {
    interface AdminLanguageOverrides {
        language: "en" | "de";
    }
}
```

**Example**

```tsx
<DextinityConfigProvider {...config} adminLanguage={{ supportedLanguages: ["en", "de"] }}>
    <AdminLanguageIntlProvider>{/* ... */}</AdminLanguageIntlProvider>
</DextinityConfigProvider>;

function AdminLanguageIntlProvider({ children }: PropsWithChildren) {
    const { language } = useAdminLanguage();

    return (
        <IntlProvider locale={language} messages={getMessages(language)}>
            {children}
        </IntlProvider>
    );
}
```
