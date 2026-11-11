---
"@dextinity/admin-generator": patch
---

Allow declaring additional form props in `injectFormVariables`

Props of the generated form, e.g., the `propName` of a `formProp` filter, can now be declared by extending `InjectedFormVariables` without a type error with `strictFunctionTypes`:

```ts
validate: injectFormVariables(({ id, client, manufacturerCountry }: InjectedFormVariables & { manufacturerCountry: string }) => (value?: string | null) => …),
```
