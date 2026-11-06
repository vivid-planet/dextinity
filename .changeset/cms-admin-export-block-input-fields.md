---
"@dextinity/cms-admin": minor
---

Export `BlockInputField`, `BlockTextareaField` and `useContentTranslationFieldActions`

Custom blocks build their forms with the field adapters of `@dextinity/ui-react-final-form` inside `BlocksFinalForm`.
`BlockInputField` and `BlockTextareaField` are the `InputField` and `TextareaField` adapters that offer translating their content with the content translation service, like the text fields of the built-in blocks.
Pass `disableContentTranslation` for content that isn't language-specific, such as IDs or codes.
`useContentTranslationFieldActions` returns the same translation `actions` for other text field adapters.

```tsx
<BlocksFinalForm onSubmit={updateState} initialValues={state}>
    <BlockInputField name="title" label={<FormattedMessage id="myBlock.title" defaultMessage="Title" />} />
</BlocksFinalForm>
```
