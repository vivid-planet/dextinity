---
title: Content Generation
---

Dextinity supports some features for generating content with third party tools (e.g., ChatGPT).

## Setup

To use any form of content generation, follow these steps:

### 1) API: Implement the `ContentGenerationServiceInterface`

```ts
@Injectable()
export class ContentGenerationService implements ContentGenerationServiceInterface {
    // ...
}
```

### 2) API: Add `ContentGenerationModule` to `AppModule`

Pass your implementation of `ContentGenerationService`:

```diff
// app.module.ts
export class AppModule {
   // ...
   imports: [
      // ...
+     ContentGenerationModule.register({
+        Service: ContentGenerationService,
+     }),
   ],
   // ...
}

```

#### Azure OpenAI

If you want to use Azure OpenAI for the content generation, you can use Dextinity's `AzureOpenAiContentGenerationService`.
In this case, you must import and configure the `AzureOpenAiContentGenerationModule`:

```diff
ContentGenerationModule.register({
    Service: ContentGenerationService,
+   imports: [
+       AzureOpenAiContentGenerationModule.register({
+           apiUrl: config.azure.openAI.endpoint,
+           apiKey: config.azure.openAI.azureApiKey,
+           deploymentId: "gpt-4-vision-preview",
+       }),
+   ],
});
```

## DAM: Generating alt texts and titles for images

To enable this feature, perform the following steps:

### 1) API: Add `generateAltText` and `generateImageTitle` to the `ContentGenerationService`

```ts
@Injectable()
export class ContentGenerationService implements ContentGenerationServiceInterface {
    async generateAltText(fileId: string, options?: { language: string }) {
        // ...
    }

    async generateImageTitle(fileId: string, options?: { language: string }) {
        // ...
    }
}
```

#### Azure OpenAI

If you want to use Azure OpenAI for analyzing the images, you can use the `AzureOpenAiContentGenerationService` provided by the library:

```ts
@Injectable()
export class ContentGenerationService implements ContentGenerationServiceInterface {
    constructor(
        private readonly openAiContentGenerationService: AzureOpenAiContentGenerationService,
    ) {}

    async generateAltText(fileId: string, options?: { language: string }) {
        return this.openAiContentGenerationService.generateAltText(fileId, options);
    }

    async generateImageTitle(fileId: string, options?: { language: string }) {
        return this.openAiContentGenerationService.generateImageTitle(fileId, options);
    }
}
```

### 2) Admin: Enable the features in your `DamConfigProvider`:

```diff
// App.tsx
 <DamConfigProvider
    value={{
        // ...
+       contentGeneration: {
+           generateAltText: true,
+           generateImageTitle: true,
+       },
    }}
 >
```

## SEO Block: Generating SEO tags

To enable this feature, perform the following steps:

### 1) API: Add `generateSeoTags` to the `ContentGenerationService`

```ts
@Injectable()
export class ContentGenerationService implements ContentGenerationServiceInterface {
    async generateSeoTags(content: string, options: { language: string }) {
        // ...
    }
}
```

#### Azure OpenAI

If you want to use Azure OpenAI for analyzing the images, you can use the `AzureOpenAiContentGenerationService` provided by the library:

```ts
@Injectable()
export class ContentGenerationService implements ContentGenerationServiceInterface {
    constructor(
        private readonly openAiContentGenerationService: AzureOpenAiContentGenerationService,
    ) {}

    async generateSeoTags(content: string, options: { language: string }) {
        return this.openAiContentGenerationService.generateSeoTags(content, options);
    }
}
```

### 2) Admin: Wrap the `SeoBlock` with the `ContentGenerationConfigProvider`:

Via the `ContentGenerationConfigProvider` you can provide the content of a document to the `SeoBlock`.
You can use the `extractTextContents()` method to get the content.

```tsx
// e.g., EditPage.tsx

export const EditPage = ({ id }: Props) => {
    // ...

    return (
        <ContentGenerationConfigProvider
            seo={{
                getRelevantContent: () => {
                    if (!pageState || !pageState.document) return [];

                    return PageContentBlock.extractTextContents?.(pageState.document.content) ?? [];
                },
            }}
        >
            {/* ... */}
        </ContentGenerationConfigProvider>
    );
};
```
