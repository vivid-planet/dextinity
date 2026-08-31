# @comet/blocks-api

## 7.26.1

## 7.26.0

## 7.25.15

## 7.25.14

## 7.25.13

## 7.25.12

## 7.25.11

## 7.25.10

## 7.25.9

## 7.25.8

## 7.25.7

## 7.25.6

## 7.25.5

## 7.25.4

## 7.25.3

## 7.25.2

## 7.25.1

## 7.25.0

## 7.24.0

## 7.23.0

### Patch Changes

-   201198da3: Include links within RichTextBlocks in the block index

    Previously, links within RichTextBlocks were not indexed, which means they also didn't appear in the DAM's dependents tab.

## 7.22.0

## 7.21.1

## 7.21.0

## 7.20.0

## 7.19.0

## 7.18.0

## 7.17.0

## 7.16.0

## 7.15.0

## 7.14.0

### Patch Changes

-   7e7a4aae1: Fix `title` field not added to types in `createLinkBlock`

## 7.13.0

## 7.12.0

## 7.11.0

### Patch Changes

-   58a99bbdd: Fix input validation for missing child blocks

## 7.10.0

## 7.9.0

## 7.8.0

### Patch Changes

-   f20ec6ce5: Make class-validator a peer dependency

## 7.7.0

## 7.6.0

### Minor Changes

-   9e2b0fac8: Add support for literal arrays to block meta

    String, number, boolean, and JSON arrays can be defined by setting `array: true`.

    **Example**

    ```ts
    class NewsListBlockData {
        @BlockField({ type: "string", array: true })
        newsIds: string[];
    }
    ```

## 7.5.0

## 7.4.2

## 7.4.1

## 7.4.0

## 7.3.2

## 7.3.1

## 7.3.0

## 7.2.1

## 7.2.0

## 7.1.0

## 7.0.0

### Major Changes

-   e15927594: Support "real" dependency injection in `BlockData#transformToPlain`

    Previously we supported poor man's dependency injection using the `TransformDependencies` object in `transformToPlain`.
    This is now replaced by a technique that allows actual dependency injection.

    **Example**

    ```ts
    class NewsLinkBlockData extends BlockData {
        @BlockField({ nullable: true })
        id?: string;

        transformToPlain() {
            // Return service that does the transformation
            return NewsLinkBlockTransformerService;
        }
    }

    type TransformResponse = {
        news?: {
            id: string;
            slug: string;
        };
    };

    @Injectable()
    class NewsLinkBlockTransformerService implements BlockTransformerServiceInterface<NewsLinkBlockData, TransformResponse> {
        // Use dependency injection here
        constructor(@InjectRepository(News) private readonly repository: EntityRepository<News>) {}

        async transformToPlain(block: NewsLinkBlockData, context: BlockContext) {
            if (!block.id) {
                return {};
            }

            const news = await this.repository.findOneOrFail(block.id);

            return {
                news: {
                    id: news.id,
                    slug: news.slug,
                },
            };
        }
    }
    ```

    Adding this new technique results in a few breaking changes:

    -   Remove dynamic registration of `BlocksModule`
    -   Pass `moduleRef` to `BlocksTransformerMiddlewareFactory` instead of `dependencies`
    -   Remove `dependencies` from `BlockData#transformToPlain`

    See the [migration guide](https://docs.comet-dxp.com/docs/migration-guide/migration-from-v6-to-v7) on how to migrate.

-   ebf597120: Remove unused/unnecessary peer dependencies

    Some dependencies were incorrectly marked as peer dependencies.
    If you don't use them in your application, you may remove the following dependencies:

    -   Admin: `axios`
    -   API: `@aws-sdk/client-s3`, `@azure/storage-blob` and `pg-error-constants`

-   b7560e3a7: Move `YouTubeVideoBlock` to `@cms` packages

    **Migrate**

    ```diff
    - import { YouTubeVideoBlock } from "@comet/blocks-admin";
    + import { YouTubeVideoBlock } from "@comet/cms-admin";
    ```

    ```diff
    - import { YouTubeVideoBlock } from "@comet/blocks-api";
    + import { YouTubeVideoBlock } from "@comet/cms-api";
    ```

## 7.0.0-beta.6

## 7.0.0-beta.5

## 7.0.0-beta.4

### Major Changes

-   b7560e3a7: Move `YouTubeVideoBlock` to `@cms` packages

    **Migrate**

    ```diff
    - import { YouTubeVideoBlock } from "@comet/blocks-admin";
    + import { YouTubeVideoBlock } from "@comet/cms-admin";
    ```

    ```diff
    - import { YouTubeVideoBlock } from "@comet/blocks-api";
    + import { YouTubeVideoBlock } from "@comet/cms-api";
    ```

## 7.0.0-beta.3

## 7.0.0-beta.2

### Minor Changes

-   87ef5fa36: YouTubeVideoBlock: Add validation for identifier

    Must be either a valid YouTube URL or video identifier.

## 7.0.0-beta.1

## 7.0.0-beta.0

### Major Changes

-   e15927594: Support "real" dependency injection in `BlockData#transformToPlain`

    Previously we supported poor man's dependency injection using the `TransformDependencies` object in `transformToPlain`.
    This is now replaced by a technique that allows actual dependency injection.

    **Example**

    ```ts
    class NewsLinkBlockData extends BlockData {
        @BlockField({ nullable: true })
        id?: string;

        transformToPlain() {
            // Return service that does the transformation
            return NewsLinkBlockTransformerService;
        }
    }

    type TransformResponse = {
        news?: {
            id: string;
            slug: string;
        };
    };

    @Injectable()
    class NewsLinkBlockTransformerService implements BlockTransformerServiceInterface<NewsLinkBlockData, TransformResponse> {
        // Use dependency injection here
        constructor(@InjectRepository(News) private readonly repository: EntityRepository<News>) {}

        async transformToPlain(block: NewsLinkBlockData, context: BlockContext) {
            if (!block.id) {
                return {};
            }

            const news = await this.repository.findOneOrFail(block.id);

            return {
                news: {
                    id: news.id,
                    slug: news.slug,
                },
            };
        }
    }
    ```

    Adding this new technique results in a few breaking changes:

    -   Remove dynamic registration of `BlocksModule`
    -   Pass `moduleRef` to `BlocksTransformerMiddlewareFactory` instead of `dependencies`
    -   Remove `dependencies` from `BlockData#transformToPlain`

    See the [migration guide](https://docs.comet-dxp.com/docs/migration-guide/migration-from-v6-to-v7) on how to migrate.

-   ebf597120: Remove unused/unnecessary peer dependencies

    Some dependencies were incorrectly marked as peer dependencies.
    If you don't use them in your application, you may remove the following dependencies:

    -   Admin: `axios`
    -   API: `@aws-sdk/client-s3`, `@azure/storage-blob` and `pg-error-constants`

## 6.17.1

## 6.17.0

## 6.16.0

## 6.15.1

## 6.15.0

### Patch Changes

-   c7f5637bd: Fix validation of `YouTubeVideoBlock`

    Previously, the validation of the `YouTubeVideoBlock` differed between admin and API.
    The admin allowed YouTube URLs and YouTube video IDs.
    The API only allowed URLs but blocked video IDs.

    Now, the API validation also accepts URLs and video IDs.

## 6.14.1

## 6.14.0

### Minor Changes

-   73dfb61c9: Add `PhoneLinkBlock` and `EmailLinkBlock`
-   87ef5fa36: YouTubeVideoBlock: Add validation for identifier

    Must be either a valid YouTube URL or video identifier.

## 6.13.0

## 6.12.0

## 6.11.0

### Patch Changes

-   93a84b651: Fix type of `youtubeIdentifier` in `YouTubeVideoBlock`

    Previously, it was incorrectly typed as required. Now it's optional.

## 6.10.0

## 6.9.0

### Minor Changes

-   8be9565d1: typesafeMigrationPipe: Add support for 20 migrations

## 6.8.0

### Minor Changes

-   90c6f192e: Deprecate `SpaceBlock`

    It will be replaced by the `createSpaceBlock` factory since it had no real use case.

-   90c6f192e: Add `createSpaceBlock` factory

    Allows selecting a spacing value out of a list of provided options.

    **Example**

    API

    ```tsx
    enum Spacing {
        d150 = "d150",
        d200 = "d200",
    }

    export const SpaceBlock = createSpaceBlock({ spacing: Spacing }, "DemoSpace");
    ```

    Admin

    ```tsx
    const options = [
        { value: "d150", label: "Dynamic 150" },
        { value: "d200", label: "Dynamic 200" },
    ];

    export const SpaceBlock = createSpaceBlock<string>({ defaultValue: options[0].value, options });
    ```

### Patch Changes

-   be8664c75: Fix `RichTextBlock` draft content validation

    Extend validation to validate inline links in draft content.

## 6.7.0

## 6.6.2

## 6.6.1

## 6.6.0

### Minor Changes

-   e880929d8: Improve typing of `@RootBlockEntity()` decorator

    The target entity can now be passed as generic to have the correct type in `isVisible`:

    ```ts
    @RootBlockEntity<Product>({
        isVisible: (product) => product.visible,
    })
    export class Product extends BaseEntity<Product, "id"> {}
    ```

## 6.5.0

### Minor Changes

-   2f64daa9b: Add `title` field to link block

    Perform the following steps to use it in an application:

    1. API: Use the new `createLinkBlock` factory to create the LinkBlock:

        ```ts
        import { createLinkBlock } from "@comet/cms-api";

        // ...

        const LinkBlock = createLinkBlock({
            supportedBlocks: { internal: InternalLinkBlock, external: ExternalLinkBlock, news: NewsLinkBlock },
        });
        ```

    2. Site: Pass the `title` prop to LinkBlock's child blocks:

    ```diff
    const supportedBlocks: SupportedBlocks = {
    -   internal: ({ children, ...props }) => <InternalLinkBlock data={props}>{children}</InternalLinkBlock>,
    +   internal: ({ children, title, ...props }) => <InternalLinkBlock data={props} title={title}>{children}</InternalLinkBlock>,
        // ...
    };
    ```

## 6.4.0

### Patch Changes

-   0efae68ff: Prevent XSS attacks in `@IsLinkTarget()` validator

## 6.3.0

## 6.2.1

## 6.2.0

### Minor Changes

-   75865caa: Deprecate `isHref` validator, `IsHref` decorator and `IsHrefConstraint` class.

    New versions `isLinkTarget`, `IsLinkTarget` and `IsLinkTargetConstraint` are added as replacement.

## 6.1.0

## 6.0.0

## 5.6.0

### Minor Changes

-   fd10b801: Add support for a custom block name and migrations to `createRichTextBlock`

## 5.5.0

## 5.4.0

## 5.3.0

### Minor Changes

-   920f2b85: Deprecate `nullable: true` for child blocks

    Nullable child blocks are not correctly supported in the Admin, for instance, in `createCompositeBlock`.
    Save a block's default values instead.

## 5.2.0

## 5.1.0

## 5.0.0

### Major Changes

-   c10a86c6: Change blocks-meta.json format: the key (type) for OneOfBlocks is now included

    Projects that still have a copy of `generate-block-types.ts` should switch to `@comet/cli`:

    -   Install `@comet/cli` as a dev dependency
    -   Replace the scripts in the package.json of your admin:

        ```json
            "generate-block-types": "comet generate-block-types --inputs",
            "generate-block-types:watch": "chokidar -s \"**/block-meta.json\" -c \"npm run generate-block-types\""
        ```

    -   Replace the scripts in the package.json of your site:

        ```json
            "generate-block-types": "comet generate-block-types",
            "generate-block-types:watch": "chokidar -s \"**/block-meta.json\" -c \"npm run generate-block-types\"",
        ```

-   c91906d2: Change the structure of `BlockIndexData` to make it generic

    Previously, `BlockIndexData` had one field: `damFileIds`. It could only represent dependencies to DAM files.

    Now, `BlockIndexData` has a generic `dependencies` field. It can represent dependencies to any entity.

    The `indexData()` method of a block must be refactored from

    ```ts
    indexData(): BlockIndexData {
        return {
            damFileIds: this.damFileId ? [this.damFileId] : [],
        };
    }
    ```

    to

    ```ts
    indexData(): BlockIndexData {
        if (this.damFileId === undefined) {
            return {};
        }

        return {
            dependencies: [
                {
                    targetEntityName: File.name,
                    id: this.damFileId,
                },
            ],
        };
    }
    ```

## 4.7.0

## 4.6.0

## 4.5.0

## 4.4.3

## 4.4.2

## 4.4.1

## 4.4.0

### Minor Changes

-   d4960b05: Add loop toggle to YouTubeVideo block

## 4.3.0

## 4.2.0

## 4.1.0
