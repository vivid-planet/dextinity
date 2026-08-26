---
title: Content Translation
---

Dextinity provides a content translation feature that allows editors to translate text fields, rich text content, documents, and entire page trees using a pluggable translation service.

## How it works

The translation system is built around the `ContentTranslationServiceProvider`, which supplies a translation function to the entire admin application. When enabled, translatable fields (text inputs, rich text editors) display a translate button, and documents/pages offer a "Translate" action in their toolbar menu.

Translation happens at three levels:

- **Fields**: Individual text inputs and rich text editors can be translated inline
- **Documents**: All translatable blocks within a document are translated at once
- **Page tree**: Multiple pages (including their names, slugs, and document content) are translated in batch

## Setup

Wrap your application (or parts of it) with the `ContentTranslationServiceProvider` from `@dextinity/admin`:

```tsx title="App.tsx"
import { ContentTranslationServiceProvider } from "@dextinity/admin";

function App() {
    return (
        <ContentTranslationServiceProvider
            enabled={true}
            showApplyTranslationDialog
            translate={async (text) => {
                // Call your translation API
                return translatedText;
            }}
            batchTranslate={async (texts) => {
                // Optional: translate multiple texts at once for better performance
                return translatedTexts;
            }}
        >
            {children}
        </ContentTranslationServiceProvider>
    );
}
```

**Props:**

| Prop                         | Type                                         | Default | Description                                                         |
| ---------------------------- | -------------------------------------------- | ------- | ------------------------------------------------------------------- |
| `enabled`                    | `boolean`                                    |         | Enables the translation feature                                     |
| `translate`                  | `(text: string) => Promise<string>`          |         | Translates a single text                                            |
| `batchTranslate`             | `(texts: string[]) => Promise<string[]>`     |         | Translates multiple texts at once (falls back to sequential `translate` calls if not provided) |
| `showApplyTranslationDialog` | `boolean`                                    |         | Shows a confirmation dialog with the translation before applying it |

## Field-level translation

When the translation provider is enabled, text fields automatically show a translate button. Clicking it translates the field's current value.

### Text inputs

`FinalFormInput` fields of type `"text"` (the default) automatically support translation. A translate icon button appears in the input's end adornment.

### Rich text editor

The rich text editor (`Rte` from `@dextinity/admin-rte`) also supports translation out of the box. A translate button appears in the toolbar. The editor translates the HTML content while preserving formatting and entities.

### Disabling translation for a field

Some fields should not be translated (e.g., URLs, identifiers, technical values). You can disable translation on a per-field basis:

**For text inputs**, use the `disableContentTranslation` prop:

```tsx
<Field
    name="youtubeIdentifier"
    component={FinalFormInput}
    disableContentTranslation
/>
```

**For the rich text editor**, pass `disableContentTranslation` in the options:

```tsx
<Rte value={value} onChange={onChange} options={{ disableContentTranslation: true }} />
```

## Block-level translation

Built-in blocks like `RichTextBlock` and composite text fields (`createCompositeBlockTextField`) implement `translateContent` out of the box. Block factories (`BlocksBlock`, `ColumnsBlock`, `ListBlock`, `OneOfBlock`, `OptionalBlock`) recursively translate their children.

### Custom blocks

To make a custom block translatable, implement the `translateContent` method:

```tsx
const MyBlock: BlockInterface = {
    // ...
    translateContent: async (state, translate) => {
        const translatedTitle = state.title ? await translate(state.title) : state.title;
        // Non-translatable fields are returned unchanged
        return { ...state, title: translatedTitle };
    },
};
```

The `translate` function passed to `translateContent` handles a single text string. For blocks used inside documents, this function is provided by the two-pass batch translation system, so individual `translate` calls are efficiently batched.

## Document-level translation

To enable translation for a document, add translation methods to its definition using `createDocumentTranslationMethods`. This enables the "Translate" action in the document's toolbar menu, which translates all translatable blocks within the document at once.

### 1) Implement the `TranslatableInterface`

```tsx title="Page.tsx"
import {
    createDocumentRootBlocksMethods,
    createDocumentTranslationMethods,
    type DocumentInterface,
    type TranslatableInterface,
} from "@dextinity/cms-admin";

const rootBlocks = {
    content: PageContentBlock,
    seo: SeoBlock,
    stage: StageBlock,
};

export const Page: DocumentInterface & TranslatableInterface = {
    displayName: "Page",
    editComponent: EditPage,
    getQuery: gql`...`,
    updateMutation: gql`...`,
    ...createDocumentRootBlocksMethods(rootBlocks),
    ...createDocumentTranslationMethods(rootBlocks),
};
```

`createDocumentTranslationMethods` iterates over all root blocks and calls each block's `translateContent` method. Blocks that don't implement `translateContent` are skipped.

### 2) Add the translate menu item to the edit page

Use the `TranslateContentMenuItem` component in your edit page's toolbar:

```tsx title="EditPage.tsx"
import { CrudMoreActionsMenu } from "@dextinity/admin";
import { createUsePage, TranslateContentMenuItem } from "@dextinity/cms-admin";

const usePage = createUsePage({
    rootBlocks: { content: PageContentBlock, seo: SeoBlock, stage: StageBlock },
    pageType: "Page",
})({
    getQuery: gql`...`,
    updateMutation: gql`...`,
});

export const EditPage = ({ id }: Props) => {
    const { pageState, translateContent, pageSaveButton, /* ... */ } = usePage({ pageId: id });

    return (
        <Toolbar>
            {/* ... */}
            <ToolbarActions>
                <CrudMoreActionsMenu
                    overallActions={[
                        <TranslateContentMenuItem
                            key="translate"
                            translateContent={translateContent}
                            disabled={!pageState?.document}
                        />,
                    ]}
                />
                {pageSaveButton}
            </ToolbarActions>
        </Toolbar>
    );
};
```

## Page tree translation

The page tree supports translating one or multiple pages at once, including their names, slugs, and document content. Slugs are automatically regenerated from the translated page name. The page tree translation works automatically when the translation provider is enabled and the document types implement the `TranslatableInterface`.

## Azure AI Translator

Dextinity provides a built-in integration with [Azure AI Translator](https://azure.microsoft.com/en-us/products/ai-services/ai-translator) as a ready-to-use translation service implementation.

### API setup

Register the `AzureAiTranslatorModule` in your `AppModule`:

```ts title="app.module.ts"
import { AzureAiTranslatorModule } from "@dextinity/cms-api";

@Module({
    imports: [
        // ...
        AzureAiTranslatorModule.register({
            endpoint: "https://api.cognitive.microsofttranslator.com",
            key: "your-api-key",
            region: "your-region",
        }),
    ],
})
export class AppModule {}
```

**Configuration:**

| Option     | Type     | Description                          |
| ---------- | -------- | ------------------------------------ |
| `endpoint` | `string` | Azure Translator service endpoint    |
| `key`      | `string` | API key for the translation service  |
| `region`   | `string` | Azure region                         |

:::tip

You can conditionally register the module based on whether the configuration is available:

```ts
...(config.azureAiTranslator
    ? [AzureAiTranslatorModule.register(config.azureAiTranslator)]
    : []),
```

:::

### Admin setup

Use the `AzureAiTranslatorProvider` from `@dextinity/cms-admin` instead of configuring `ContentTranslationServiceProvider` manually:

```tsx title="App.tsx"
import { AzureAiTranslatorProvider } from "@dextinity/cms-admin";

function App() {
    return (
        <ContentScopeProvider>
            {({ match }) => (
                <AzureAiTranslatorProvider enabled showApplyTranslationDialog>
                    {/* Your app routes */}
                </AzureAiTranslatorProvider>
            )}
        </ContentScopeProvider>
    );
}
```
