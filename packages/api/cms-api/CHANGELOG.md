# @comet/cms-api

## 7.26.1

### Patch Changes

-   @comet/blocks-api@7.26.1

## 7.26.0

### Minor Changes

-   7b639b1d09: Remove special handling that excluded DAM URLs from the access log

    Previously, requests to DAM routes were excluded from the access log. They are now logged like any other HTTP request.

### Patch Changes

-   @comet/blocks-api@7.26.0

## 7.25.15

### Patch Changes

-   61d21ecaf5: Validate uploaded SVGs with `DOMPurify` (backed by `jsdom`) instead of the custom XML-based check

    The previous implementation parsed SVGs with `fast-xml-parser` and applied a hand-written allow/deny list to reject scripts, event handlers and unsafe links.
    SVGs are now sanitized with the vetted `DOMPurify` library and rejected when it has to strip any tags or attributes, providing more robust protection against XSS vectors in uploaded SVGs.

    The `role` attribute and the `<use>` element are allowed, since they're commonly used in valid SVGs. `<use>` is restricted to same-document fragment references (e.g. `href="#id"`); references to external resources are rejected to prevent XSS/SSRF.

    -   @comet/blocks-api@7.25.15

## 7.25.14

### Patch Changes

-   09a62afc0: API Generator: fix generated query in position-service
    -   @comet/blocks-api@7.25.14

## 7.25.13

### Patch Changes

-   @comet/blocks-api@7.25.13

## 7.25.12

### Patch Changes

-   @comet/blocks-api@7.25.12

## 7.25.11

### Patch Changes

-   @comet/blocks-api@7.25.11

## 7.25.10

### Patch Changes

-   @comet/blocks-api@7.25.10

## 7.25.9

### Patch Changes

-   @comet/blocks-api@7.25.9

## 7.25.8

### Patch Changes

-   @comet/blocks-api@7.25.8

## 7.25.7

### Patch Changes

-   @comet/blocks-api@7.25.7

## 7.25.6

### Patch Changes

-   @comet/blocks-api@7.25.6

## 7.25.5

### Patch Changes

-   cc8b41c91: Fix copying a file from one scope to another

    Previously, the media alternatives weren't handled when copying a file (which happens automatically when copying a page from one scope to another). This caused this error:

    > ERROR [ExceptionFilter] DriverException: update "DamMediaAlternative" set "for" = 'eb2a6906-eef9-425c-9d46-1f76275f4ca5', "alternative" = 'eb2a6906-eef9-425c-9d46-1f76275f4ca5' where "id" = '[object Object]' - invalid input syntax for type uuid: "[object Object]"

    -   @comet/blocks-api@7.25.5

## 7.25.4

### Patch Changes

-   @comet/blocks-api@7.25.4

## 7.25.3

### Patch Changes

-   @comet/blocks-api@7.25.3

## 7.25.2

### Patch Changes

-   98104babc: API Generator: fix nullable input for many-to-many relations
    -   @comet/blocks-api@7.25.2

## 7.25.1

### Patch Changes

-   @comet/blocks-api@7.25.1

## 7.25.0

### Minor Changes

-   b421ed273: Support captions in the `DamVideoBlock`

    The captions can be set uploaded as .vtt files and linked to videos in the DAM.

-   c95365d03: Add the possibility to attach captions (.vtt files) to videos in the DAM
-   a1a129e00: Allow uploading .vtt files to the DAM

### Patch Changes

-   @comet/blocks-api@7.25.0

## 7.24.0

### Minor Changes

-   efeff64ab: API Generator: Allow easier extension of generated resolvers and services

    Even though we don't encourage to extend generated resolvers and services, it should still be possible. Our recommendation is to generate a new resolver but there are cases where it makes sense to extend the existing one (e.g. modifying certain functions or reusing existing code).

    Until now, this was hard to do, because every resolver and service declared it's services as private. If you need to use a service from the base resolver, you had to redeclare all services with a different name.

    ```ts
        constructor(
            entityManager: EntityManager,
            @InjectRepository(Product) private readonly repository2: EntityRepository<Product>,
            @InjectRepository(ProductCategory) private readonly productCategoryRepository2: EntityRepository<ProductCategory>,
            @InjectRepository(Manufacturer) private readonly manufacturerRepository2: EntityRepository<Manufacturer>,
            @InjectRepository(FileUpload) private readonly fileUploadRepository2: EntityRepository<FileUpload>,
            @InjectRepository(ProductStatistics) private readonly productStatisticsRepository2: EntityRepository<ProductStatistics>,
            @InjectRepository(ProductColor) private readonly productColorRepository2: EntityRepository<ProductColor>,
            @InjectRepository(ProductToTag) private readonly productToTagRepository2: EntityRepository<ProductToTag>,
            @InjectRepository(ProductTag) private readonly productTagRepository2: EntityRepository<ProductTag>,
            private readonly blocksTransformer2: BlocksTransformerService,
        ) {
            super(
                entityManager,
                repository2,
                productCategoryRepository2,
                manufacturerRepository2,
                fileUploadRepository2,
                productStatisticsRepository2,
                productColorRepository2,
                productToTagRepository2,
                productTagRepository2,
                blocksTransformer2,
            );
        }

    ```

    If you tried to use the same name you got the following error:

    ```
    Class 'CustomProductResolver' incorrectly extends base class 'ProductResolver'.
      Types have separate declarations of a private property 'repository'.ts(2415)
    ```

    Now, the constructor can be omitted and the custom resolver can be simplified to:

    ```ts
    @Resolver(() => Product)
    @RequiredPermission(["products"], { skipScopeCheck: true })
    export class CustomProductResolver extends ProductResolver {
        @Mutation(() => Boolean)
        async publishAllProducts(): Promise<boolean> {
            await this.repository.nativeUpdate({ status: { $ne: ProductStatus.Published } }, { status: ProductStatus.Published });
            return true;
        }
    }
    ```

### Patch Changes

-   b6e3f7e3c: Don't replace a file if the new file is identical to the existing one in the DAM

    This previously led to a bug where a file was deleted if it was replaced with the same file.

-   3607c7c22: Extend the browser cache duration for public DAM assets from 1 day to 1 year to reduce the data load for returning users.
-   2310f8553: Prevent socket exhaustion when streaming files and prevent the API from crashing due to stream errors in the `FileUploadsDownloadController`

    We already added this fix to the DAM in the past.

-   2af3d8187: Ignore UUID columns in `searchToMikroOrmQuery` when inferring fields from entity metadata
-   34df51db0: Set cache-control headers for file uploads
    -   @comet/blocks-api@7.24.0

## 7.23.0

### Minor Changes

-   80d0c6293: Add new `getFileContent` method to the `FileUploadsService`

    This method allows you to retrieve a file's content as a Buffer.
    This is needed for cases like embedding images in a PDF or attaching files to emails.

### Patch Changes

-   2cdb87ad5: Add error and close handling for partial ranges in file stream
-   aac00efa8: Limit image title to 150 characters in `AzureOpenAiContentGenerationService`
-   Updated dependencies [201198da3]
    -   @comet/blocks-api@7.23.0

## 7.22.0

### Patch Changes

-   @comet/blocks-api@7.22.0

## 7.21.1

### Patch Changes

-   @comet/blocks-api@7.21.1

## 7.21.0

### Patch Changes

-   06920eb59: Fix: Change GraphQL Type of numberOfDescendants from Float to Int
    -   @comet/blocks-api@7.21.0

## 7.20.0

### Minor Changes

-   ea26f5d89: Add a nullable column `activatedAt` to `Redirects` table to display the latest activation date of a redirect

### Patch Changes

-   557e311ea: AccessLog: Remove some DAM URLs from log

    Hashed URLs and preview URLs are not useful in the logs, so we remove them.

-   21f95adfe: DAM: Fix headers

    While we fixed a few issues with cache control headers in https://github.com/vivid-planet/comet/pull/2653, there are still a few issues which need to be addressed. The following changes are part of a series of changes which will address the issues:

    -   Only store the `content-type` header
    -   Prevent imgproxy headers from being passed through to the client
    -   Remove redundantly stored `content-type` for Azure storage accounts and S3 buckets

-   f3b5b57b7: DAM: Set `cache-control: no-store` for folder download

    Explicitly set `cache-control: no-store` for folder download to prevent caching of the response. Normally this should not be cached by any CDN, because the Request contains a cookie, but it is better to be explicit about it.

    -   @comet/blocks-api@7.20.0

## 7.19.0

### Minor Changes

-   91cb37bb9: Add `mimetype` to `DamFileDownloadLinkBlock`

### Patch Changes

-   eceaab1a0: Make `import-redirects` console script consider scope when loading the target `PageTreeNode` for a redirect

    Previously, the scope wasn't considered when loading the node.
    This resulted in redirects that targeted a node in a different scope -> these redirects didn't work.

    -   @comet/blocks-api@7.19.0

## 7.18.0

### Patch Changes

-   @comet/blocks-api@7.18.0

## 7.17.0

### Minor Changes

-   a1bf43670: Add support for searching/filtering redirects by target

    Add a custom target URL service to resolve the URLs of custom redirect targets:

    ```ts
    @Injectable({ scope: Scope.REQUEST })
    export class MyRedirectTargetUrlService implements RedirectTargetUrlServiceInterface {
        constructor() {}

        async resolveTargetUrl(target: ExtractBlockData<RedirectsLinkBlock>["attachedBlocks"][number]): Promise<string | undefined> {
            // Your custom logic here
        }
    }
    ```

    ```diff
    RedirectsModule.register({
        imports: [MikroOrmModule.forFeature([News]), PredefinedPagesModule],
        customTargets: { news: NewsLinkBlock },
        Scope: RedirectScope,
    +   TargetUrlService: MyRedirectTargetUrlService,
    }),
    ```

-   e1392ae6a: Add `isAnyOf` filter to `StringFilter`, `NumberFilter`, `OneToManyFilter`, and `ManyToManyFilter`

### Patch Changes

-   @comet/blocks-api@7.17.0

## 7.16.0

### Minor Changes

-   4137cdb03: File Uploads: Add option to disable the GraphQL field resolvers

    Use this when using file uploads without GraphQL.

    ```ts
    FileUploadsModule.register({
        /* ... */
        download: {
            /* ... */
            createFieldResolvers: false,
        },
    });
    ```

-   a2dfcc1ad: Export `UserPermissionsService` and `CurrentUserPermission`

    This allows the usage of `getPermissionsAndContentScopes` if projects want to get all rule-based and admin-based permissions for specific users.

### Patch Changes

-   @comet/blocks-api@7.16.0

## 7.15.0

### Patch Changes

-   83b8111d6: Allow `use` tag in SVG again

    `use` can be used to define paths once in a SVG and then integrating them multiple times via anchor links: `<use xlink:href="#path-id" />`. This should not be prohibited.

    It's still not possible to use `use` to reference external files, since we still prohibit `href` and `xlink:href` attributes starting with `http://`, `https://` and `javascript:`.

-   e6f9641db: Add fallback values for users created via ID token
    -   @comet/blocks-api@7.15.0

## 7.14.0

### Minor Changes

-   99ff0357b: Pass available permissions to `AccessControlService.getPermissionsForUser`
-   a84d88cf9: Ignore filters in `@AffectedEntity` check

    When using the `@AffectedEntity` decorator we possibly also want to check entities which are filtered by default. Since we don't know how the entity is handled in the resolver we ignore the filters completely.

-   3c47c089e: Allow passing a language to `generateAltText` and `generateImageTitle`
-   bb041f7a7: Add content generation capabilities to `createSeoBlock`

    The SEO block (when created using the `createSeoBlock` factory) now supports automatic generation of:

    -   HTML title
    -   Meta description
    -   Open Graph title
    -   Open Graph description

    See the [docs](https://docs.comet-dxp.com/docs/features-modules/content-generation/) for instructions on enabling this feature.

-   7f72e82fc: Add `extractTextContents` method to blocks

    `extractTextContents` can be used to extract plain text from blocks. This functionality is particularly useful for operations such as search indexing or using the content for LLM-based tasks. The option `includeInvisibleContent` can be set to include the content of invisible blocks in the extracted text.

    The method is optional for now, but it is recommended to implement it for all blocks and documents. The default behavior is to return

    -   if the state is a string: the string itself
    -   otherwise: an empty array

### Patch Changes

-   0233d486b: Export `FileUploadInput`
-   7e7a4aae1: Fix `title` field not added to types in `createLinkBlock`
-   Updated dependencies [7e7a4aae1]
    -   @comet/blocks-api@7.14.0

## 7.13.0

### Patch Changes

-   f49370a9e: Improve SVG validation

    Following tags are banned in SVGs:

    -   script
    -   \[new\] foreignObject
    -   \[new\] use
    -   \[new\] image
    -   \[new\] animate
    -   \[new\] animateMotion
    -   \[new\] animateTransform
    -   \[new\] set

    Following attributes are banned:

    -   Event handlers (`onload`, `onclick`, ...)
    -   \[new\] `href` and `xlink:href` (if the value starts with `http://`, `https://` or `javascript:`)
    -   @comet/blocks-api@7.13.0

## 7.12.0

### Minor Changes

-   604491df5: Validate filename length for uploads to DAM or FileUploads

    The filename can't exceed 255 characters.

-   575f1a77f: Add `ExceptionFilter` to replace `ExceptionInterceptor`

    The main motivation for this change was that the `ExceptionInterceptor` didn't capture exceptions thrown in guards. This could lead to information leaks, e.g., details about the database schema or the underlying code. This is considered a security risk.

    The `ExceptionFilter` also catches error within guards. The error format remains unchanged.

    Switching from the `ExceptionInterceptor` to the `ExceptionFilter` must be done in the project:

    ```diff
    // main.ts

    - app.useGlobalInterceptors(new ExceptionInterceptor(config.debug));
    + app.useGlobalFilters(new ExceptionFilter(config.debug));
    ```

### Patch Changes

-   64173b513: Fix page tree node slug validation to prevent URL encoded characters
-   c66a403d2: Migrate from deprecated `@azure/openai` package to `openai`

    See https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/migration-javascript for more information.

-   6b4866a12: Pass `x-preview-dam-urls` and `x-relative-dam-urls` headers to `url` field resolver in `FileImagesResolver`
-   cf1a829c5: Remove `video/avi`, `image/psd` and `video/x-m4v` from default accepted mimetypes

    None of this mimetypes had an actual impact:

    -   `video/avi` doesn't actually exist
    -   `image/psd` doesn't exist / is non-standard
    -   `video/x-m4v` is a niche format and the mimetype is not widely used (e.g., Google Chrome and MacOS use `video/mp4`
        instead)

    So removing them shouldn't have any noticeable effects.

-   cf1a829c5: Add `image/x-icon` to default accepted mimetypes

    Previously, only `image/vnd.microsoft.icon` was supported. That could lead to problems uploading .ico files, since
    `image/vnd.microsoft.icon` and `image/x-icon` are valid mimetypes for this format.

-   ff0a037a4: Prevent image uploads from failing if exif data cannot be parsed
    -   @comet/blocks-api@7.12.0

## 7.11.0

### Patch Changes

-   fb2297b2d: Fix `notEqual` operation for enum filter
-   6778c4e97: Prevent the creation of a second home page
-   Updated dependencies [58a99bbdd]
    -   @comet/blocks-api@7.11.0

## 7.10.0

### Patch Changes

-   7b2adae8b: API Generator: Don't generate an update input for the single generator
    -   @comet/blocks-api@7.10.0

## 7.9.0

### Patch Changes

-   @comet/blocks-api@7.9.0

## 7.8.0

### Minor Changes

-   44a54554c: Allow replacing a file with a new one on the file detail page in the DAM
-   45fbc54c1: Rename `User` to `UserPermissionsUser` in GraphQL schema

    This prevents naming collisions if a web wants to use a `User` type.

    Additionally prefix remaining user permissions-specific actions with `UserPermissions`.

-   c6d3ac36b: Add support for file replacement on upload in the DAM

    When uploading a file to the DAM with the same filename as an existing file, it's now possible to replace the existing file.
    This is useful when you want to update a file without changing its URL.

### Patch Changes

-   bfa5dbac8: Fix schema generation if `FileUpload` object type isn't used

    Previously, the file uploads module always added the `downloadUrl` and `imageUrl` fields to the `FileUpload` object type, even if the type wasn't used in the application.
    This lead to errors when generating the GraphQL schema.

    Now, the fields are only added if the `download` option of the module is used.

    Note: As a consequence, the `finalFormFileUploadFragment` doesn't include the fields anymore.
    To enable downloading file uploads in forms, use the newly added `finalFormFileUploadDownloadableFragment`:

    ```diff
    export const productFormFragment = gql`
        fragment ProductFormFragment on Product {
            priceList {
    -           ...FinalFormFileUpload
    +           ...FinalFormFileUploadDownloadable
            }
        }

    -   ${finalFormFileUploadFragment}
    +   ${finalFormFileUploadDownloadableFragment}
    `;
    ```

-   02a5bdc68: API Generator: Fix generated types for position code
-   f20ec6ce5: Make class-validator a peer dependency
-   Updated dependencies [f20ec6ce5]
    -   @comet/blocks-api@7.8.0

## 7.7.0

### Patch Changes

-   af892c106: Prevent the API from crashing because of stream errors when delivering a file
-   253aebbc1: Allow overriding `requestHandler` in `BlobStorageS3Storage`
-   af892c106: Prevent socket exhaustion in `BlobStorageS3Storage`

    By default, the S3 client allows a maximum of 50 open sockets.
    A socket is only released once a file is streamed completely.
    Meaning, it can remain open forever if a file stream is interrupted (e.g., when the user leaves the site).
    This could lead to socket exhaustion, preventing further file delivery.

    To resolve this, the following changes were made:

    1. Add a close handler to destroy the stream when the client disconnects
    2. Set a 60-second `requestTimeout` to close unused connections

    -   @comet/blocks-api@7.7.0

## 7.6.0

### Minor Changes

-   73c07ea6e: Set content scopes in request object

    This allows accessing the affected content scopes inside a block's transformer service.

    **Example**

    ```ts
    import { Inject, Injectable } from "@nestjs/common";
    import { CONTEXT } from "@nestjs/graphql";

    /* ... */

    @Injectable()
    export class PixelImageBlockTransformerService implements BlockTransformerServiceInterface<PixelImageBlockData, TransformResponse> {
        constructor(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            @Inject(CONTEXT) private readonly context: any,
        ) {}

        async transformToPlain(block: PixelImageBlockData) {
            // Get the affected content scopes
            const contentScopes = this.context.req.contentScopes;

            // Do something with the content scopes

            /* ... */
        }
    }
    ```

-   671e2b234: Create site preview JWT in the API

    With this change the site preview can be deployed unprotected. Authentication is made via a JWT created in the API and validated in the site. A separate domain for the site preview is still necessary.

    **Note:** This requires the `sitePreviewSecret` option to be configured in the `PageTreeModule`.
    Run `npx @comet/upgrade@latest v7/add-site-preview-secret.ts` in the root of your project to perform the necessary code changes.
    Changes to the deployment setup might still be necessary.

-   f8ae0843c: API Generator: Add support for disabling sort/filter using the `@CrudField()` decorator for embeddables
-   d535e3207: Improve error message for empty IDs arrays in `@AffectedEntity`
-   44ec9eb3f: Redirects: Add `redirectBySource` query that can be used to query for a single redirect by source
-   3ea66fb38: Add support for user impersonation

    Prerequisites for setups with separate domains for admin and api: `credentials: "include"` must be set in the `createApolloClient` function in the admin.

    Adds an "Impersonation" button to the detail view of a user in the User Permissions admin panel. The impersonation can be exited by clicking the button in the user's info on the top right.

### Patch Changes

-   700ddc340: Fix copy/paste for documents containing a `DamFileDownloadLinkBlock`
-   979d5f455: Improve error message in `Migration20240702123233`

    `Migration20240702123233` adds a valid file extension to every DamFile#name that doesn't have an extension yet.
    Previously, the migration crashed without a helpful error message if the mimetype of a file wasn't in [mime-db](https://www.npmjs.com/package/mime-db).
    Now, the migration throws an error including the problematic mimetype.

-   b03f3dfc1: Call `createUserFromRequest` before `createUserFromIdToken`

    The latter is marked as deprecated and should only be used if the
    first one is not defined.

-   cc2a11781: Redirects: Improve GraphQL API performance by preloading the page tree to speed up target page lookup

    Also, increase the maximum limit from 100 to 1000.

-   72cf8fd12: Treat `null` and `undefined` scope dimensions the same in `AccessControlService#isAllowed`

    Optional scope dimensions may sometimes be `null` or `undefined` depending on how the scope object is created.
    For instance, when the scope is loaded from the database, the optional dimension will be `null`, but when the scope is coming from GraphQL, the dimension can be `undefined`.
    Due to strict equality comparison, this led to incorrect access control checks in `AccessControlService#isAllowed`.
    This is now prevented by treating `null` and `undefined` dimensions as the same when checking the scope.

-   6b0ecebed: DAM: Fix/set cache-control headers

    -   Public endpoints should cache files for 1 day
    -   Private endpoints should cache files for 1 year - but only in local caches (not CDN)

-   6f931911c: Avoid duplicate file extension in `createFileUploadInputFromUrl`
-   Updated dependencies [9e2b0fac8]
    -   @comet/blocks-api@7.6.0

## 7.5.0

### Minor Changes

-   f2da11db1: API Generator: Add support for position field

    Add a field named `position` to enable this feature. This field will hold and update the position. This should be an integer number field >= 1. It's also possible to define fields (in CrudGenerator-Decorator) to group position by.

-   5a48ae482: Add file size to `DamFileDownloadLinkBlock`
-   216d93a10: File Uploads: Add image endpoint

    Add support for viewing images in the browser.
    This can be useful for file upload previews, profile pictures etc.
    The image URL can be obtained by querying the `imageUrl` field of the `FileUpload` type.
    A `resizeWidth` argument needs to be provided.

    **Example**

    ```graphql
    query Product($id: ID!) {
        product(id: $id) {
            id
            updatedAt
            priceList {
                id
                imageUrl(resizeWidth: 640)
            }
        }
    }
    ```

### Patch Changes

-   @comet/blocks-api@7.5.0

## 7.4.2

### Patch Changes

-   @comet/blocks-api@7.4.2

## 7.4.1

### Patch Changes

-   @comet/blocks-api@7.4.1

## 7.4.0

### Minor Changes

-   f1d9e449b: Support filtering for document types in the `paginatedPageTreeNodes` query

    **Example**

    ```graphql
    query PredefinedPages($scope: PageTreeNodeScopeInput!) {
        paginatedPageTreeNodes(scope: $scope, documentType: "PredefinedPage") {
            nodes {
                id
            }
        }
    }
    ```

-   cab7c427a: Add support for downloading previously uploaded files to `FileUploadField`
-   bfb8f04e6: Add `VimeoVideoBlock` to support Vimeo videos
-   a97019016: File Uploads: Add download endpoint

    The endpoint can be enabled by providing the `download` option in the module config:

    ```ts
    FileUploadsModule.register({
      /* ... */,
      download: {
        secret: "your secret",
      },
    })
    ```

### Patch Changes

-   @comet/blocks-api@7.4.0

## 7.3.2

### Patch Changes

-   @comet/blocks-api@7.3.2

## 7.3.1

### Patch Changes

-   @comet/blocks-api@7.3.1

## 7.3.0

### Patch Changes

-   c130adc38: `BuildsService`: Start all jobs that match the scope exactly

    Previously, the first job that matched the scope exactly would be started, and the rest would be ignored. This has been fixed so that all jobs that match the scope exactly are started.

    -   @comet/blocks-api@7.3.0

## 7.2.1

### Patch Changes

-   c66336963: Fix bug in `DamVideoBlock` that caused the block to crash if no video file was selected

    The block used to crash if no video was selected because the `DamVideoBlockTransformerService` returned an empty object.
    This left the `previewImage` state in the admin `undefined` causing `state2Output` to fail.

    -   @comet/blocks-api@7.2.1

## 7.2.0

### Patch Changes

-   @comet/blocks-api@7.2.0

## 7.1.0

### Minor Changes

-   19d53c407: Add Sentry module to simplify integration with Sentry.

    ### Usage:

    ```ts
    // main.ts

    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    app.use(Sentry.Handlers.errorHandler());
    ```

    ```ts
    // app.module.ts

    SentryModule.forRootAsync({
        dsn: "sentry_dsn_url",
        environment: "dev",
        shouldReportException: (exception) => {
            // Custom logic to determine if the exception should be reported
            return true;
        },
    }),
    ```

### Patch Changes

-   87f74d307: Sort the keys in content scopes returned by `UserPermissionsService` alphabetically

    This fixes issues when comparing content scopes after converting them to strings via `JSON.stringify()`.

    This specifically fixes a bug on the UserPermissionsPage:
    When the `availableContentScopes` passed to the `UserPermissionsModule` weren't sorted alphabetically, the allowed scopes wouldn't be displayed correctly in the UI.

    -   @comet/blocks-api@7.1.0

## 7.0.0

### Major Changes

-   6ac10edf1: Remove `download` helper

    Use `createFileUploadInputFromUrl` instead.

-   9a1b01669: Remove CDN config from DAM

    It was a bad idea to introduce this in the first place, because `@comet/cms-api` should not be opinionated about how the CDN works.

    Modern applications require all traffic to be routed through a CDN. Cloudflare offers a tunnel, which made the origin-check obsolete, so we introduced a flag to disable the origin check.

    Also changes the behavior of the `FilesService::createFileUrl()`-method which now expects an options-object as second argument.

    ## How to migrate (only required if CDN is used):

    Remove the following env vars from the API

    ```
    DAM_CDN_ENABLED=
    DAM_CDN_DOMAIN=
    DAM_CDN_ORIGIN_HEADER=
    DAM_DISABLE_CDN_ORIGIN_HEADER_CHECK=false
    ```

    If you want to enable the origin check:

    1. Set the following env vars for the API

    ```
    CDN_ORIGIN_CHECK_SECRET="Use value from DAM_CDN_ORIGIN_HEADER to avoid downtime"
    ```

    _environment-variables.ts_

    ```
    @IsOptional()
    @IsString()
    CDN_ORIGIN_CHECK_SECRET: string;
    ```

    _config.ts_

    ```
    cdn: {
        originCheckSecret: envVars.CDN_ORIGIN_CHECK_SECRET,
    },
    ```

    2. Add CdnGuard

    ```
    // if CDN is enabled, make sure all traffic is either coming from the CDN or internal sources
    if (config.cdn.originCheckSecret) {
        app.useGlobalGuards(new CdnGuard({ headerName: "x-cdn-origin-check", headerValue: config.cdn.originCheckSecret }));
    }
    ```

    3. DNS changes might be required. `api.example.com` should point to CDN, CDN should point to internal API domain

-   6ac10edf1: Remove `FileUploadService`

    Use `createFileUploadInputFromUrl` instead of `FileUploadService#createFileUploadInputFromUrl`.

-   0588e212c: Remove `language` field from `User` object

    -   Providing the locale is not mandatory for ID-Tokens
    -   Does not have a real use case (better rely on the Accept-Language header of the browser to determine the language of the current user)

-   46b86ba5f: `FilesService#createFileDownloadUrl` now expects an options object as second parameter

    ```diff
    - this.filesService.createFileDownloadUrl(file, previewDamUrls)
    + this.filesService.createFileDownloadUrl(file, { previewDamUrls, relativeDamUrls })
    ```

-   0e6debb06: CRUD Generator: Remove `lastUpdatedAt` argument from update mutations
-   ebf597120: Make `@nestjs/platform-express` a peer dependency

    Make sure that `@nestjs/platform-express` is installed in the application.

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

-   9bed75638: API Generator: Add new `dedicatedResolverArg` option to `@CrudField` to generate better API for Many-to-one-relations

    -   Add foreign id as argument to create mutation
    -   Add foreign id as argument to list query

-   c3940df58: Replace `additionalMimeTypes` and `overrideAcceptedMimeTypes` in `DamModule#damConfig` with `acceptedMimeTypes`

    You can now add mime types like this:

    ```ts
    DamModule.register({
        damConfig: {
            acceptedMimeTypes: [...damDefaultAcceptedMimetypes, "something-else"],
        },
    });
    ```

    And remove them like this:

    ```ts
    DamModule.register({
        damConfig: {
            acceptedMimeTypes: damDefaultAcceptedMimetypes.filter((mimeType) => mimeType !== "application/zip"),
        },
    });
    ```

    Don't forget to also remove/add the mime types in the admin's `DamConfigProvider`

-   4485d1540: filtersToMikroOrmQuery: Move second argument (`applyFilter` callback) into an options object
-   28322b422: Refactor auth-decorators

    -   Remove `@PublicApi()`-decorator
    -   Rename `@DisableGlobalGuard()`-decorator to `@DisableCometGuards()`

    The `@DisableCometGuards()`-decorator will only disable the AuthGuard when no `x-include-invisible-content`-header is set.

-   c3940df58: Rename `defaultDamAcceptedMimetypes` to `damDefaultAcceptedMimetypes`
-   caefa1c5d: Rename `DateFilter` to `DateTimeFilter`

    This leaves room for a future DateFilter that only filters by date, not time.

    **Upgrading**

    1. Change import

    ```diff
    - import { DateFilter } from "@comet/cms-api";
    + import { DateTimeFilter } from "@comet/cms-api";
    ```

    2. Re-run API Generator.

-   ebf597120: Remove unused/unnecessary peer dependencies

    Some dependencies were incorrectly marked as peer dependencies.
    If you don't use them in your application, you may remove the following dependencies:

    -   Admin: `axios`
    -   API: `@aws-sdk/client-s3`, `@azure/storage-blob` and `pg-error-constants`

-   6ac10edf1: Rename "public uploads" to "file uploads"

    The name "public uploads" was not fitting since the uploads can also be used for "private" uploads in the Admin.
    The feature was therefore renamed to "file uploads".

    This requires the following changes:

    -   Use `FileUploadsModule` instead of `PublicUploadModule`
    -   Use `FileUpload` instead of `PublicUpload`
    -   Use `FileUploadsService` instead of `PublicUploadsService`
    -   Change the upload URL from `/public-upload/files/upload` to `/file-uploads/upload`

-   17c7f79a2: Secure file uploads upload endpoint by default

    The `/file-uploads/upload` endpoint now requires the `fileUploads` permission by default.

    Use the `upload.public` option to make the endpoint public:

    ```diff
    FileUploadsModule.register({
        /* ... */,
    +   upload: {
    +       public: true,
    +   },
    }),
    ```

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

-   1d2f54bee: Require `strategyName` in `createStaticCredentialsBasicStrategy`

    The `strategyName` is then used as SystemUser which allows to distinguish between different system users (e.g. activate logging)

-   2497a062f: API Generator: Remove support for `visible` boolean, use `status` enum instead.

    Recommended enum values: Published/Unpublished or Visible/Invisible or Active/Deleted or Active/Archived

    Remove support for update visibility mutation, use existing generic update instead

-   fe22985d6: API Generator: Replace graphql-type-json with graphql-scalars for JSON columns

    **Upgrading**

    1. Install graphql-scalars: `npm install graphql-scalars`
    2. Uninstall graphql-type-json: `npm install graphql-type-json`
    3. Update imports:

        ```diff
        - import { GraphQLJSONObject } from "graphql-type-json";
        + import { GraphQLJSONObject } from "graphql-scalars";
        ```

-   a58918893: Remove `aspectRatio` from `YouTubeBlock`

    The block's aspect ratio options (4x3, 16x9) proved too inflexible to be of actual use in an application. Therefore, the aspect ratio field was removed. It should be defined in the application instead.

    **Migrate**

    The block requires an aspect ratio in the site. It should be set using the `aspectRatio` prop (default: `16x9`):

    ```diff
     <YouTubeVideoBlock
       data={video}
    +  aspectRatio="9x16"
     />
    ```

-   4485d1540: API Generator: Remove generated service

    The `Service#getFindCondition` method is replaced with the new `gqlArgsToMikroOrmQuery` function, which detects an entity's searchable fields from its metadata.
    Consequently, the generated service isn't needed anymore and will therefore no longer be generated.
    Remove the service from the module after re-running the API Generator.

-   3ea123f68: Increase minimum supported version of `@mikro-orm/core`, `@mikro-orm/migrations`, and `@mikro-orm/postgresql` to v5.8.4
-   769bd72f0: Use the Next.js Preview Mode for the site preview

    The preview is entered by navigating to an API Route in the site, which has to be executed in a secured environment.
    In the API Route the current scope is checked (and possibly stored), then the client is redirected to the preview.

### Minor Changes

-   5e8713488: API Generator: Add support for filtering one-to-many relations by id
-   f1d0f023d: API Generator: Add `list` option to `@CrudGenerator()` to allow disabling the list query

    Related DTO classes will still be generated as they might be useful for application code.

-   bb04fb863: API Generator: Change default value for input field if property has no initializer

    Previously, the following property of an entity

    ```ts
    @Property({ type: types.date, nullable: true })
    @Field({ nullable: true })
    availableSince?: Date;
    ```

    resulted in the following input being generated:

    ```ts
    @IsNullable()
    @IsDate()
    @Field({ nullable: true })
    availableSince?: Date;
    ```

    This was problematic for two reasons:

    1.  The error message would be misleading when trying to create an entity without providing a value for the property. For example, a valid GraphQL mutation

        ```graphql
        mutation CreateProduct {
            createProduct(input: { title: "A", slug: "A", description: "FOO" }) {
                id
                availableSince
            }
        }
        ```

        would result in the following error:

        ```
        "isDate": "availableSince must be a Date instance"
        ```

    2.  Relying on the initializer as the default value is not obvious and appears somewhat magical.

    To address this, we now use `null` as the default value for nullable properties if no initializer is provided. If an initializer is provided, it is used as the default value.

-   8d920da56: CRUD Generator: Add support for date-only fields
-   36cdd70f1: InternalLinkBlock: add scope to targetPage in output

    This allows for example using the language from scope as url prefix in a multi-language site

-   bfa94b74b: API Generator: Generate field resolver for root blocks

    This allows skipping the `@Field` annotation for root blocks in the entity and it doesn't need the field middleware anymore.

-   f38ecc186: API Generator: Add support for enum array filter and sort
-   4485d1540: API Generator: Add `search` argument to `OneToManyFilter` and `ManyToManyFilter`

    Performs a search like the `search` argument in the list query.

-   b7560e3a7: Add preview image to `YouTubeVideoBlock` and `DamVideoBlock`

    The `YouTubeVideoBlock` and the `DamVideoBlock` now support a preview image out of the box. For customisation the default `VideoPreviewImage` component can be overridden with the optional `renderPreviewImage` method.

    It is recommended to replace the custom implemented video blocks in the projects with the updated `YouTubeVideoBlock` and `DamVideoBlock` from the library.

-   2f0675b83: API Generator: Add support for filtering many-to-many relations by id

### Patch Changes

-   9c8a9a190: API Generator: Add missing type for integer fields in input type
-   Updated dependencies [e15927594]
-   Updated dependencies [ebf597120]
-   Updated dependencies [b7560e3a7]
    -   @comet/blocks-api@7.0.0

## 7.0.0-beta.6

### Patch Changes

-   @comet/blocks-api@7.0.0-beta.6

## 7.0.0-beta.5

### Patch Changes

-   @comet/blocks-api@7.0.0-beta.5

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

-   a58918893: Remove `aspectRatio` from `YouTubeBlock`

    The block's aspect ratio options (4x3, 16x9) proved too inflexible to be of actual use in an application. Therefore, the aspect ratio field was removed. It should be defined in the application instead.

    **Migrate**

    The block requires an aspect ratio in the site. It should be set using the `aspectRatio` prop (default: `16x9`):

    ```diff
     <YouTubeVideoBlock
       data={video}
    +  aspectRatio="9x16"
     />
    ```

-   3ea123f68: Increase minimum supported version of `@mikro-orm/core`, `@mikro-orm/migrations`, and `@mikro-orm/postgresql` to v5.8.4

### Minor Changes

-   bfa94b74b: API Generator: Generate field resolver for root blocks

    This allows skipping the `@Field` annotation for root blocks in the entity and it doesn't need the field middleware anymore.

-   b7560e3a7: Add preview image to `YouTubeVideoBlock` and `DamVideoBlock`

    The `YouTubeVideoBlock` and the `DamVideoBlock` now support a preview image out of the box. For customisation the default `VideoPreviewImage` component can be overridden with the optional `renderPreviewImage` method.

    It is recommended to replace the custom implemented video blocks in the projects with the updated `YouTubeVideoBlock` and `DamVideoBlock` from the library.

### Patch Changes

-   Updated dependencies [b7560e3a7]
    -   @comet/blocks-api@7.0.0-beta.4

## 7.0.0-beta.3

### Major Changes

-   caefa1c5d: Rename `DateFilter` to `DateTimeFilter`

    This leaves room for a future DateFilter that only filters by date, not time.

    **Upgrading**

    1. Change import

    ```diff
    - import { DateFilter } from "@comet/cms-api";
    + import { DateTimeFilter } from "@comet/cms-api";
    ```

    2. Re-run API Generator.

-   fe22985d6: API Generator: Replace graphql-type-json with graphql-scalars for JSON columns

    **Upgrading**

    1. Install graphql-scalars: `npm install graphql-scalars`
    2. Uninstall graphql-type-json: `npm install graphql-type-json`
    3. Update imports:

        ```diff
        - import { GraphQLJSONObject } from "graphql-type-json";
        + import { GraphQLJSONObject } from "graphql-scalars";
        ```

### Minor Changes

-   5e8713488: API Generator: Add support for filtering one-to-many relations by id

### Patch Changes

-   9c8a9a190: API Generator: Add missing type for integer fields in input type
    -   @comet/blocks-api@7.0.0-beta.3

## 7.0.0-beta.2

### Minor Changes

-   2f0675b83: API Generator: Add support for filtering many-to-many-relations by id

### Patch Changes

-   Updated dependencies [87ef5fa36]
    -   @comet/blocks-api@7.0.0-beta.2

## 7.0.0-beta.1

### Major Changes

-   c3940df58: Replace `additionalMimeTypes` and `overrideAcceptedMimeTypes` in `DamModule#damConfig` with `acceptedMimeTypes`

    You can now add mime types like this:

    ```ts
    DamModule.register({
        damConfig: {
            acceptedMimeTypes: [...damDefaultAcceptedMimetypes, "something-else"],
        },
    });
    ```

    And remove them like this:

    ```ts
    DamModule.register({
        damConfig: {
            acceptedMimeTypes: damDefaultAcceptedMimetypes.filter((mimeType) => mimeType !== "application/zip"),
        },
    });
    ```

    Don't forget to also remove/add the mime types in the admin's `DamConfigProvider`

-   c3940df58: Rename `defaultDamAcceptedMimetypes` to `damDefaultAcceptedMimetypes`

### Minor Changes

-   f38ecc186: API Generator: Add support for enum array filter and sort

### Patch Changes

-   10424c744: Fix `SvgImageBlock` in site by always loading `fileUrl`

## 7.0.0-beta.0

### Major Changes

-   9a1b01669: Remove CDN config from DAM

    It was a bad idea to introduce this in the first place, because `@comet/cms-api` should not be opinionated about how the CDN works.

    Modern applications require all traffic to be routed through a CDN. Cloudflare offers a tunnel, which made the origin-check obsolete, so we introduced a flag to disable the origin check.

    Also changes the behavior of the `FilesService::createFileUrl()`-method which now expects an options-object as second argument.

    ## How to migrate (only required if CDN is used):

    Remove the following env vars from the API

    ```
    DAM_CDN_ENABLED=
    DAM_CDN_DOMAIN=
    DAM_CDN_ORIGIN_HEADER=
    DAM_DISABLE_CDN_ORIGIN_HEADER_CHECK=false
    ```

    If you want to enable the origin check:

    1. Set the following env vars for the API

    ```
    CDN_ORIGIN_CHECK_SECRET="Use value from DAM_CDN_ORIGIN_HEADER to avoid downtime"
    ```

    _environment-variables.ts_

    ```
    @IsOptional()
    @IsString()
    CDN_ORIGIN_CHECK_SECRET: string;
    ```

    _config.ts_

    ```
    cdn: {
        originCheckSecret: envVars.CDN_ORIGIN_CHECK_SECRET,
    },
    ```

    2. Add CdnGuard

    ```
    // if CDN is enabled, make sure all traffic is either coming from the CDN or internal sources
    if (config.cdn.originCheckSecret) {
        app.useGlobalGuards(new CdnGuard({ headerName: "x-cdn-origin-check", headerValue: config.cdn.originCheckSecret }));
    }
    ```

    3. DNS changes might be required. `api.example.com` should point to CDN, CDN should point to internal API domain

-   f74544524: Change language field in User and CurrentUser to locale
-   0588e212c: Remove `locale`-field from `User`-object

    -   Providing the locale is not mandatory for ID-Tokens
    -   Does not have a real use case (better rely on the Accept-Language header of the browser to determine the language of the current user)

-   46b86ba5f: `FilesService#createFileDownloadUrl` now expects an options object as second parameter

    ```diff
    - this.filesService.createFileDownloadUrl(file, previewDamUrls)
    + this.filesService.createFileDownloadUrl(file, { previewDamUrls, relativeDamUrls })
    ```

-   0e6debb06: CRUD Generator: Remove `lastUpdatedAt` argument from update mutations
-   ebf597120: Make `@nestjs/platform-express` a peer dependency

    Make sure that `@nestjs/platform-express` is installed in the application.

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

-   9bed75638: API Generator: Add new `dedicatedResolverArg` option to `@CrudField` to generate better API for Many-to-one-relations

    -   Add foreign id as argument to create mutation
    -   Add foreign id as argument to list query

-   28322b422: Refactor auth-decorators

    -   Remove `@PublicApi()`-decorator
    -   Rename `@DisableGlobalGuard()`-decorator to `@DisableCometGuards()`

    The `@DisableCometGuards()`-decorator will only disable the AuthGuard when no `x-include-invisible-content`-header is set.

-   ebf597120: Remove unused/unnecessary peer dependencies

    Some dependencies were incorrectly marked as peer dependencies.
    If you don't use them in your application, you may remove the following dependencies:

    -   Admin: `axios`
    -   API: `@aws-sdk/client-s3`, `@azure/storage-blob` and `pg-error-constants`

-   2497a062f: API Generator: Remove support for `visible` boolean, use `status` enum instead.

    Recommended enum values: Published/Unpublished or Visible/Invisible or Active/Deleted or Active/Archived

    Remove support for update visibility mutation, use existing generic update instead

-   769bd72f0: Uses the Next.JS Preview mode for the site preview

    The preview is entered by navigating to an API-Route in the site, which has to be executed in a secured environment.
    In the API-Routes the current scope is checked (and possibly stored), then the client is redirected to the Preview.

    // TODO Move the following introduction to the migration guide before releasing

    Requires following changes to site:

    -   Import `useRouter` from `next/router` (not exported from `@comet/cms-site` anymore)
    -   Import `Link` from `next/link` (not exported from `@comet/cms-site` anymore)
    -   Remove preview pages (pages in `src/pages/preview/` directory which call `createGetUniversalProps` with preview parameters)
    -   Remove `createGetUniversalProps`
        -   Just implement `getStaticProps`/`getServerSideProps` (Preview Mode will SSR automatically)
        -   Get `previewData` from `context` and use it to configure the GraphQL Client
    -   Add `SitePreviewProvider` to `App` (typically in `src/pages/_app.tsx`)
    -   Provide a protected environment for the site
        -   Make sure that a Authorization-Header is present in this environment
        -   Add a Next.JS API-Route for the site preview (eg. `/api/site-preview`)
        -   Call `getValidatedSitePreviewParams()` in the API-Route (calls the API which checks the Authorization-Header with the submitted scope)
        -   Use the `path`-part of the return value to redirect to the preview

    Requires following changes to admin

    -   The `SitesConfig` must provide a `sitePreviewApiUrl`

### Minor Changes

-   f1d0f023d: API Generator: Add `list` option to `@CrudGenerator()` to allow disabling the list query

    Related DTO classes will still be generated as they might be useful for application code.

-   36cdd70f1: InternalLinkBlock: add scope to targetPage in output

    This allows for example using the language from scope as url prefix in a multi-language site

-   1d2f54bee: Require `strategyName` in `createStaticCredentialsBasicStrategy`

    The `strategyName` is then used as SystemUser which allows to distinguish between different system users (e.g. activate logging)

### Patch Changes

-   Updated dependencies [e15927594]
-   Updated dependencies [ebf597120]
    -   @comet/blocks-api@7.0.0-beta.0

## 6.17.1

### Patch Changes

-   76ca3bf98: Remove index signature from `ContentScope` interface

    This allows using scope DTOs without index signature in `@ScopedEntity()`.

    -   @comet/blocks-api@6.17.1

## 6.17.0

### Minor Changes

-   9ddf65554: Require a file extension when changing the filename in the DAM

    Previously, files in the DAM could be renamed without restrictions.
    Files could have invalid extensions (for their mimetype) or no extension at all.
    This theoretically made the following attack possible:

    1. Creating a dangerous .exe file locally
    2. Renaming it to .jpg locally
    3. Uploading the file as a .jpg
    4. Renaming it to .exe in the DAM
    5. The file is now downloaded as .exe

    Now, filenames must always have an extension that matches their mimetype.
    This is enforced in the admin and API.
    Existing files without an extension are automatically assigned an extension via a DB migration.

-   9ddf65554: Loosen the filename slugification rules

    When uploading a file to the DAM, the filename is automatically slugified.
    Previously, the slugification used pretty strict rules without a good reason.

    Now, the rules were loosened allowing uppercase characters and most special characters.
    Also, slugify now uses the locale `en` instead of `de` for special character replacements.

### Patch Changes

-   5a9c49ab5: CronJobModule: Fix job creation if resulting name exceeds 63 characters
    -   @comet/blocks-api@6.17.0

## 6.16.0

### Minor Changes

-   5e830f8d9: Add an [Azure AI Translator](https://azure.microsoft.com/en-us/products/ai-services/ai-translator) implementation of the content translation feature

    To use it, do the following:

    **API:**

    ```diff
    // app.module.ts
    export class AppModule {
        static forRoot(config: Config): DynamicModule {
            return {
                imports: [
                    // ...
    +               AzureAiTranslatorModule.register({
    +                   endpoint: envVars.AZURE_AI_TRANSLATOR_ENDPOINT,
    +                   key: envVars.AZURE_AI_TRANSLATOR_KEY,
    +                   region: envVars.AZURE_AI_TRANSLATOR_REGION,
    +               }),
                ],
    ```

    Users need the `translation` permission to use the translation feature.

    **Admin:**

    Wrap the section where you want to use the content translation with the `AzureAiTranslatorProvider` provider:

    ```tsx
    <AzureAiTranslatorProvider enabled={true}>{/*  ...  */}</AzureAiTranslatorProvider>
    ```

    Note: `AzureAiTranslatorProvider` automatically checks for the `translation` permission. The translation button is only shown for users with this permission.

### Patch Changes

-   f7d405dfa: Fix the duplicate filename check in `FilesService#updateByEntity`

    Previously, we checked the existing file name (`entity.name`) for the check instead of the new name (`input.name`). This never resulted in an error.

    -   @comet/blocks-api@6.16.0

## 6.15.1

### Patch Changes

-   @comet/blocks-api@6.15.1

## 6.15.0

### Patch Changes

-   9b29afd87: Add missing `@RequiredPermission` to `createZip` route
-   0654f7bce: Handle unauthorized and unauthenticated correctly in error dialog

    The error dialog now presents screens according to the current state. Required to work in all conditions:

    -   `CurrentUserProvider` must be beneath `MuiThemeProvider` and `IntlProvider` and above `RouterBrowserRouter`
    -   `ErrorDialogHandler` must be parallel to `CurrentUserProvider`

-   Updated dependencies [c7f5637bd]
    -   @comet/blocks-api@6.15.0

## 6.14.1

### Patch Changes

-   @comet/blocks-api@6.14.1

## 6.14.0

### Minor Changes

-   73dfb61c9: Add `PhoneLinkBlock` and `EmailLinkBlock`
-   dddb03d1b: Add capability to generate alt texts and titles for images in DAM

    You can find instructions for adding this feature to your project [in the docs](https://docs.comet-dxp.com/docs/content-generation/).

-   73dfb61c9: Add `IsPhoneNumber` and `isPhoneNumber` validators to validate phone numbers

### Patch Changes

-   b7dbd7a18: Export `DisablePermissionCheck` constant to enable usage in application code
-   Updated dependencies [73dfb61c9]
-   Updated dependencies [87ef5fa36]
    -   @comet/blocks-api@6.14.0

## 6.13.0

### Minor Changes

-   2a5e00bfb: API Generator: Add `list` option to `@CrudGenerator()` to allow disabling the list query

    Related DTO classes will still be generated as they might be useful for application code.

-   dcf3f70f4: Add `overrideAcceptedMimeTypes` configuration to DAM

    If set, only the mimetypes specified in `overrideAcceptedMimeTypes` will be accepted.

    You must configure `overrideAcceptedMimeTypes` in the API and the admin interface:

    API:

    ```diff
    // app.module.ts

    DamModule.register({
        damConfig: {
            // ...
    +       overrideAcceptedMimeTypes: ["image/png"],
            // ...
        },
        // ...
    }),
    ```

    Admin:

    ```diff
    // App.tsx

    <DamConfigProvider
        value={{
            // ...
    +       overrideAcceptedMimeTypes: ["image/png"],
        }}
    >
    ```

-   07a7291fe: Adjust `searchToMikroOrmQuery` function to reduce the amount of irrelevant results

    This is done by using a combination of AND- and OR-queries. For example, a search of `red shirt` won't give all products containing `red` OR `shirt` but rather returns all products that have the words `red` AND `shirt` in some column. The words don't have to be in the same column.

### Patch Changes

-   5bbb2ee76: API Generator: Don't add `skipScopeCheck` when the entity has a `@ScopedEntity()` decorator
-   ebdd108f0: API Generator: Fix imports in generated code for more than one level deep relations
-   b925f940f: API Generator: Support relation with primary key type `int` (in addition to `integer`)
    -   @comet/blocks-api@6.13.0

## 6.12.0

### Minor Changes

-   3ee8c7a33: Add a `DamFileDownloadLinkBlock` that can be used to download a file or open it in a new tab

    Also, add new `/dam/files/download/:hash/:fileId/:filename` endpoint for downloading assets.

-   0597b1e0a: Add `DisablePermissionCheck` constant for use in `@RequiredPermission` decorator

    You can disable authorization for a resolver or operation by adding the decorator `@RequiredPermission(DisablePermissionCheck)`

### Patch Changes

-   67176820c: API CrudSingleGenerator: Run `transformToBlockData()` for block fields on create
-   b158e6a2c: ChangesCheckerConsole: Start exactly matching job or all partially matching jobs

    Previously, the first job with a partially matching content scope was started.
    Doing so could lead to problems when multiple jobs with overlapping content scopes exist.
    For instance, jobs with the scopes `{ domain: "main", language: "de" }` and `{ domain: "main", language: "en" }` both partially match a change in `{ domain: "main", language: "de" }`.
    To fix this, we either start a single job if the content scope matches exactly or start all jobs with partially matching content scopes.

    -   @comet/blocks-api@6.12.0

## 6.11.0

### Minor Changes

-   0db10a5f8: Add a console script to import redirects from a csv file

    You can use the script like this: `npm run console import-redirects file-to-import.csv`

    The CSV file must look like this:

    ```csv
    source;target;target_type;comment;scope_domain
    /test-source;/test-target;internal;Internal Example;main
    /test-source-external;https://www.comet-dxp.com/;external;External Example;secondary
    ```

### Patch Changes

-   Updated dependencies [93a84b651]
    -   @comet/blocks-api@6.11.0

## 6.10.0

### Minor Changes

-   536fdb85a: Add `createUserFromIdToken` to `UserService`-interface

    This allows to override the default implementation of creating the User-Object from the JWT when logging in via `createAuthProxyJwtStrategy`

-   f528bc340: CronJobModule: Show logs for job run

### Patch Changes

-   d340cabc2: DAM: Fix the duplicate name check when updating a file

    Previously, there were two bugs:

    1. In the `EditFile` form, the `folderId` wasn't passed to the mutation
    2. In `FilesService#updateByEntity`, the duplicate check was always done against the root folder if no `folderId` was passed

    This caused an error when saving a file in any folder if there was another file with the same name in the root folder.
    And it was theoretically possible to create two files with the same name in one folder (though this was still prevented by admin-side validation).

-   584d14d86: Only return duplicates within the same scope in the `FilesResolver#duplicates` field resolver

    As a side effect `FilesService#findAllByHash` now accepts an optional scope parameter.

    -   @comet/blocks-api@6.10.0

## 6.9.0

### Minor Changes

-   94ac6b729: API Generator: Fix generated API for many-to-many-relations with custom relation entity

### Patch Changes

-   Updated dependencies [8be9565d1]
    -   @comet/blocks-api@6.9.0

## 6.8.0

### Minor Changes

-   d6ca50a52: Enhanced the access log functionality to now skip logging for field resolvers in GraphQL context. This change improves the readability and relevance of our logs by reducing unnecessary entries.
-   ebdbabc21: Extend `searchToMikroOrmQuery` function to support quoted search strings.

    Quotes searches can be done with single (`'...'`) or double quotation marks (`"..."`).

### Patch Changes

-   35efa037b: API-Generator: Remove unnecessary await for delete mutation
-   d3a06fcaf: Prevent block-meta.json write in read-only file systems
-   a696ec7b9: Handle DAM scope correctly in the `findCopiesOfFileInScope` query and the `importDamFileByDownload` mutation

    Previously, these endpoints would cause errors if no DAM scoping was used.

-   Updated dependencies [be8664c75]
-   Updated dependencies [90c6f192e]
-   Updated dependencies [90c6f192e]
    -   @comet/blocks-api@6.8.0

## 6.7.0

### Minor Changes

-   645f19df9: Add `nullable` param to `@AffectedEntity` to support id args that can be `null` or `undefined`
-   a0506e103: API Generator: Support validator decorators for input generation

### Patch Changes

-   645f19df9: Fix mutations `moveDamFiles`, `copyFilesToScope`, `archiveDamFiles` and `restoreDamFiles` by adding `@AffectedEntity` to enable scope checks
-   8315f10cb: Fix order of `@RequiredPermission()` decorators

    Decorators defined on handlers should be considered before decorators defined on classes.

-   6eeaaa223: The CometAuthGuards now only creates the `CurrentUser` just on a request-basis and skips when called in a fieldResolver (e.g. when `fieldResolverEnhancers` contains `guards`).
    -   @comet/blocks-api@6.7.0

## 6.6.2

### Patch Changes

-   @comet/blocks-api@6.6.2

## 6.6.1

### Patch Changes

-   890795fda: Fix calculation of `totalCount` in `DependenciesService#getDependents`
    -   @comet/blocks-api@6.6.1

## 6.6.0

### Minor Changes

-   6160119fe: Provide a `User`-interface that allows module augmentation and hence storing additional data.
-   38df2b4de: Add `userToLog`-option to AccessLogModule

### Patch Changes

-   Updated dependencies [e880929d8]
    -   @comet/blocks-api@6.6.0

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

### Patch Changes

-   Updated dependencies [2f64daa9b]
    -   @comet/blocks-api@6.5.0

## 6.4.0

### Minor Changes

-   9ff9d9840: Support using a service in `@ScopedEntity()` decorator

    This can be useful when an entity's scope cannot be derived directly from the passed entity.
    For example, a `Page` document's scope is derived by the `PageTreeNode` the document is attached to, but there is no database relation between the two entities.

    For page tree document types you can use the provided `PageTreeNodeDocumentEntityScopeService`.

-   955182b09: Make permission-check for field-resolvers optional
-   322da3831: Add `@EntityInfo()` decorator

    Adding `@EntityInfo()` to an entity is necessary to correctly display dependencies in the admin application.
    You can find more information in [the docs](https://docs.comet-dxp.com/docs/dependencies/).

-   1910551c7: Log the correct user IP even if the app is behind a proxy

    The package [request-ip](https://www.npmjs.com/package/request-ip) is now used to get the actual user IP even if the app runs behind a proxy. Previously, the proxy's IP was logged.

-   2d1b9467a: createImageLinkBlock: Allow overriding name

    This allows using two different `ImageLink` blocks in one application.

    Perform the following steps to override the name:

    1. API: Add the name as second argument in the `createImageLinkBlock` factory:

        ```diff
        const MyCustomImageLinkBlock = createImageLinkBlock(
            { link: InternalLinkBlock },
        +   "MyCustomImageLink"
        );
        ```

    2. Admin: Set the `name` option in the `createImageLinkBlock` factory:

        ```diff
        const MyCustomImageLinkBlock = createImageLinkBlock({
            link: InternalLinkBlock,
        +   name: "MyCustomImageLink"
        });
        ```

### Patch Changes

-   8568153d8: API Generator: Add missing `ObjectQuery` import
-   1910551c7: Remove user name from access log

    We decided to remove the user name because of privacy concerns.

-   bfc1a4614: API Generator: Correctly support default value for date fields
-   b478a8b71: Don't fail in ChangesCheckerInterceptor because of stricter content scope check
-   Updated dependencies [0efae68ff]
    -   @comet/blocks-api@6.4.0

## 6.3.0

### Minor Changes

-   fc1b16fe: Allow overriding the block context in `BlocksTransformerService#transformToPlain`

### Patch Changes

-   e2e2114b: Fix parsing of `contentScopeAnnotation` in `KubernetesService#getContentScope`
    -   @comet/blocks-api@6.3.0

## 6.2.1

### Patch Changes

-   f1457306: Ignore user permissions when using system user

    The `UserPermissionsGuard` didn't allow requests when using a system user (e.g., basic authorization during site build).

    -   @comet/blocks-api@6.2.1

## 6.2.0

### Minor Changes

-   beeea1dd: Remove `availablePermissions`-option in `UserPermissionsModule`

    Simply remove the `Permission` interface module augmentation and the `availablePermissions`-option from the application.

-   151e1218: Support multiple `@AffectedEntity()`-decorators for a single function

### Patch Changes

-   04afb3ee: Fix attached document deletion when deleting a page tree node
-   ad153c99: Always use preview DAM URLs in the admin application

    This fixes a bug where the PDF preview in the DAM wouldn't work because the file couldn't be included in an iFrame on the admin domain.

    We already intended to use preview URLs everywhere in [v5.3.0](https://github.com/vivid-planet/comet/releases/tag/v5.3.0#:~:text=Always%20use%20the%20/preview%20file%20URLs%20in%20the%20admin%20application). However, the `x-preview-dam-urls` header wasn't passed correctly to the `createFileUrl()` method everywhere. As a result, preview URLs were only used in blocks but not in the DAM. Now, the DAM uses preview URLs as well.

-   Updated dependencies [75865caa]
    -   @comet/blocks-api@6.2.0

## 6.1.0

### Minor Changes

-   7ea43eb3: Make the `UserService`-option of the `UserPermissionsModule` optional.

    The service is still necessary though for the Administration-Panel.

-   86cd5c63: Allow a callback for the `availableContentScopes`-option of the `UserPermissionsModule`

    Please be aware that when using this possibility to make sure to cache the
    response properly as this is called for every request to the API.

-   737ab3b9: Allow returning multiple content scopes in `ScopedEntity`-decorator
-   f416510b: Remove `CurrentUserLoader` and `CurrentUserInterface`

    Overriding the the current user in the application isn't supported anymore when using the new `UserPermissionsModule`, which provides the current user DTO itself.

### Patch Changes

-   ef84331f: Fix type of @RequiredPermission to accept a non-array string for a single permission
-   8e158f8d: Add missing `@RequiredPermission()` decorator to `FileLicensesResolver`
-   50184410: API Generator: Add missing `scope` argument and filter to `<entity>BySlug` query
-   1f6c58e8: API Generator: support GraphQLJSONObject input for fields that are not a InputType class
    -   @comet/blocks-api@6.1.0

## 6.0.0

### Major Changes

-   d20f59c0: Enhance CronJob module

    -   Show latest job run on `CronJobsPage`
    -   Add option to manually trigger cron jobs to `CronJobsPage`
    -   Add subpage to `CronJobsPage` that shows all job runs

    Warning: Only include this module if all your users should be able to trigger cron jobs manually or you have sufficient access control in place.

    Includes the following breaking changes:

    -   Rename `JobStatus` to `KubernetesJobStatus` to avoid naming conflicts
    -   Rename `BuildRuntime` to `JobRuntime`

-   b3ceaef1: Replace ContentScopeModule with UserPermissionsModule

    Breaking changes:

    -   ContentScope-Module has been removed
    -   canAccessScope has been moved to AccessControlService and refactored into isAllowed
    -   contentScopes- and permissions-fields have been added to CurrentUser-Object
    -   role- and rights-fields has been removed from CurrentUser-Object
    -   AllowForRole-decorator has been removed
    -   Rename decorator SubjectEntity to AffectedEntity
    -   Add RequiredPermission-decorator and make it mandatory when using UserPermissionsModule

    Upgrade-Guide: tbd

### Patch Changes

-   @comet/blocks-api@6.0.0

## 5.6.0

### Patch Changes

-   Updated dependencies [fd10b801]
    -   @comet/blocks-api@5.6.0

## 5.5.0

### Minor Changes

-   bb2c76d8: Deprecate `FileUploadInterface` interface

    Use `FileUploadInput` instead.

-   bb2c76d8: Deprecate `download` helper

    The helper is primarily used to create a `FileUploadInput` (previously `FileUploadInterface`) input for `FilesService#upload` while creating fixtures.
    However, the name of the helper is too generic to be part of the package's public API.
    Instead, use the newly added `FileUploadService#createFileUploadInputFromUrl`.

    **Example:**

    ```ts
    @Injectable()
    class ImageFixtureService {
        constructor(private readonly filesService: FilesService, private readonly fileUploadService: FileUploadService) {}

        async generateImage(url: string): Promise<FileInterface> {
            const upload = await this.fileUploadService.createFileUploadInputFromUrl(url);
            return this.filesService.upload(upload, {});
        }
    }
    ```

### Patch Changes

-   @comet/blocks-api@5.5.0

## 5.4.0

### Minor Changes

-   e146d8bb: Support the import of files from external DAMs

    To connect an external DAM, implement a component with the necessary logic (asset picker, upload functionality, ...). Pass this component to the `DamPage` via the `additionalToolbarItems` prop.

    ```tsx
    <DamPage
        // ...
        additionalToolbarItems={<ImportFromExternalDam />}
    />
    ```

    You can find an [example](demo/admin/src/dam/ImportFromUnsplash.tsx) in the demo project.

-   27bf643b: Add `PublicUploadsService` to public API

    The service can be used to programmatically create public uploads, such as when creating fixtures.

-   df5c959c: Remove license types `MICRO` and `SUBSCRIPTION`

    The `LicenseType` enum no longer contains the values `MICRO` and `SUBSCRIPTION`. The database migration will automatically update all licenses of type `MICRO` or `SUBSCRIPTION` to `RIGHTS_MANAGED`.

### Patch Changes

-   60f5208e: Fix encoding of special characters in names of uploaded files

    For example:

    Previously:

    -   `€.jpg` -> `a.jpg`
    -   `ä.jpg` -> `ai.jpg`

    Now:

    -   `€.jpg` -> `euro.jpg`
    -   `ä.jpg` -> `ae.jpg`
    -   @comet/blocks-api@5.4.0

## 5.3.0

### Minor Changes

-   570fdbc8: CRUD Generator: Add support for `ArrayType` fields in generated input
-   8d0e3ee1: CRUD Generator: Add support for enum arrays in input

### Patch Changes

-   dfb3c840: CRUD Generator: Correctly support `type: "text"` fields in filter and sort
-   c883d351: Consider filtered mimetypes when calculating the position of a DAM item in `DamItemsService`'s `getDamItemPosition()`

    Previously, the mimetypes were ignored, sometimes resulting in an incorrect position.

-   Updated dependencies [920f2b85]
    -   @comet/blocks-api@5.3.0

## 5.2.0

### Minor Changes

-   bbc0a0a5: Add access logging to log information about the request to standard output. The log contains information about the requester and the request itself. This can be useful for fulfilling legal requirements regarding data integrity or for forensics.

    There are two ways to integrate logging into an application:

    **First option: Use the default implementation**

    ```ts
    imports: [
        ...
        AccessLogModule,
        ...
    ]
    ```

    **Second option: Configure logging**

    Use the `shouldLogRequest` to prevent logging for specific requests. For instance, one may filter requests for system users.

    ```ts
    imports: [
        ...
        AccessLogModule.forRoot({
            shouldLogRequest: ({user, req}) => {
                // do something
                return true; //or false
            },
        }),
        ...
    ]
    ```

    More information can be found in the documentation under 'Authentication > Access Logging'.

### Patch Changes

-   1a170b9b: API Generator: Use correct type for `where` when `getFindCondition` service method is not used
-   6b240a01: CRUD Generator: Correctly support `type: "text"` fields in input
    -   @comet/blocks-api@5.2.0

## 5.1.0

### Patch Changes

-   @comet/blocks-api@5.1.0

## 5.0.0

### Major Changes

-   9d3e8555: Add scoping to the DAM

    The DAM scoping can be enabled optionally. You can still use the DAM without scoping.

    To enable DAM scoping, you must

    In the API:

    -   Create a DAM folder entity using `createFolderEntity({ Scope: DamScope });`
    -   Create a DAM file entity using `createFileEntity({ Scope: DamScope, Folder: DamFolder });`
    -   Pass the `Scope` DTO and the `File` and `Folder` entities when initializing the `DamModule`

    In the Admin:

    -   Set `scopeParts` in the `DamConfigProvider` (e.g. `<DamConfigProvider value={{ scopeParts: ["domain"] }}>`)
    -   Render the content scope indicator in the `DamPage`
        ```tsx
        <DamPage renderContentScopeIndicator={(scope) => <ContentScopeIndicator scope={scope} />} />
        ```

    You can access the current DAM scope in the Admin using the `useDamScope()` hook.

    See the [Demo project](https://github.com/vivid-planet/comet/pull/976) for an example on how to enable DAM scoping.

-   9d3e8555: Remove `File` entity export

    Depending on your use case, you may either use the file entity created by `createFileEntity()` in the application code, or the `FileInterface` export instead.

-   9d3e8555: Remove `Folder` entity export

    Depending on your use case, you may either use the folder entity created by `createFolderEntity()` in the application code, or the `FolderInterface` export instead.

-   c19c9271: Rename the DAM entity classes to match their commonly used aliases (`File` -> `DamFile`, `Folder` -> `DamFolder`)

-   9d3e8555: Change `FilesService.upload()` method signature

    The method now accepts an options object with a `scope` field as second argument.

    **Before**

    ```ts
    await filesService.upload(file, folderId);
    ```

    **After**

    ```ts
    await filesService.upload(file, { folderId, scope });
    ```

-   c91906d2: Move the `DiscoverService` from the `BlocksModule` to the new `DependenciesModule`

    The `discoverRootBlocks()` method now also returns the `graphqlObjectType` of an entity. Furthermore, a `discoverTargetEntities()` method was added that returns information about all potential dependency targets.

-   c91906d2: Rename `BlockIndexService` to `DependenciesService` and move it from the `BlocksModule` to the new `DependenciesModule`.

    Following changes were made to the `DependenciesService`:

    -   A stale-while-revalidate approach for refreshing the view was added to `refreshViews()`. If you need the view to be updated unconditionally, you must call the method with the new `force: true` option.
    -   `getDependents()` and `getDependencies()` were added to fetch the dependents or dependencies of an entity instance from the view.

-   dc130d16: Remove deprecated `SkipBuildInterceptor`

    The `SkipBuildInterceptor` was never intended to be part of the public API. If you want to skip a build for an operation, use the `@SkipBuild()` decorator instead.

-   c91906d2: The `PageTreeModule` now requires the passed `PageTreeNode` entity to be named "PageTreeNode"
-   API CRUD Generator:
    -   a987e17c: Support relations in entities

### Minor Changes

-   f2aa78c8: Improve undefined/null handling for update mutations

    -   Add `@IsUndefinable()` and `@IsNull()` validators intended to be used in input types (similar, but more specific than `@IsOptional()` from `class-validator`)
    -   Add custom `PartialType` intended to be used for update input types (similar to `@nestjs/mapped-types` but uses `@IsUndefinable()` instead of `@IsOptional()`)

-   9875e7d4: Support automatically importing DAM files into another scope when copying documents from one scope to another
-   8ed96981: Support copy/pasting DAM files across server instances by downloading the copied file
-   6b9787e6: Offer possibility to opt-out of creating a redirect when changing the slug of a page (previously, a redirect was always created)
-   c49472c3: Add `calculateHashForFile()` method to `FilesService`
-   3a6dab1c: `searchToMikroOrmQuery()` now splits search string by spaces for a better search experience
-   621c9bd2: Extend configuration options for `createAuthProxyJwtStrategy()`. It's now possible to override the strategy and strategy options.
-   c91906d2: Add `DependenciesResolverFactory` and `DependentsResolverFactory` to easily add field resolvers for the `dependencies` or `dependents` of an entity

    You can use the factories as follows:

    ```ts
    @Module({
        // ...
        providers: [ExampleResolver, DependenciesResolverFactory.create(Example), DependentsResolverFactory.create(Example)],
        // ...
    })
    export class ExampleModule {}
    ```

-   c6e47a3f: Add `updatedAt` timestamp to `PageTreeNode`

    Adds an `updatedAt` timestamp to the`PageTreeNode` that is inferred from the attached documents. This timestamp can be used to sort the PageTree. One common use case is the `LatestContentUpdatesDashboardWidget`, which can now be limited to the current content scope.

    Note: The `updatedAt` timestamp is set to the current time when the migration is executed. You will need to write an additional migration if you want the timestamp to reflect the `updatedAt` timestamp of the active attached document.

-   API CRUD Generator:

    -   f2aa78c8: Update API CRUD Generator to allow partial update in update mutations:

        -   passing `null` for a field means: set this field to null (e.g. a relation or a Date)
        -   passing `undefined` for a field means: do not change this field (keep the previous value)

    -   6acd2d0a: Support default values

        Usage: Set a default value in the entity and it will be used as default in the generated input type. `null` for relations is also supported by setting the default value in the entity to `undefined`.

    -   1278e6d9: Generation of create/update/delete mutations is now optional

        Setting create/update/delete boolean of `@CrudGenerator()` decorator to false will skip the generation of these mutations

    -   17165e96: Support IDs of type string and integer (previously only UUID was supported)
    -   31c4779e: Add support for nested json and embedded properties

### Patch Changes

-   564f66d3: Allow `:`, `?`, `=` and `&` in redirect source paths
-   b8e040ca: API Generator: Add support for TypeScript paths (e.g., `@src/`) by using the project's TSConfig
-   1a95f4cc: Add `@SkipBuild()` decorator to mutations without content changes
-   c1502d14: Ignore field resolvers in `ChangesCheckerInterceptor`
-   11ec1bbf: Fix GQL Type for `damItemListPosition` query (before Float, now Int)
-   49e85432: Expiration of JWT will be checked now. If you use this strategy, please make sure that the JWT will be refreshed (e.g. set refresh in Auth-Proxy or use updated charts).
-   1cae2388: The `updatePageTreeNode` query no longer requires an `attachedDocument` argument
-   cf49f3b9: `searchToMikroOrmQuery()` now ignores leading and trailing spaces. This fixes a bug where all rows were matched if there was a space before or after the search string.
-   API CRUD Generator:
-   9f11ac1d: Support number fields (additional to DecimalType) in filter and sort generation
-   da73c0c3: Prevent duplicate imports in generated files
-   ed13b68d: Enums don't need to be exported from the entity file anymore
-   b8e040ca: Add support for TypeScript paths (e.g., `@src/`) by using the project's TSConfig
-   Updated dependencies [c10a86c6]
-   Updated dependencies [c91906d2]
    -   @comet/blocks-api@5.0.0

## 4.7.0

### Patch Changes

-   @comet/blocks-api@4.7.0

## 4.6.0

### Patch Changes

-   f6f7d4a4: Prevent slug change of home page in `updateNode()` and `updateNodeSlug()` of `PageTreeService`
    -   @comet/blocks-api@4.6.0

## 4.5.0

### Patch Changes

-   @comet/blocks-api@4.5.0

## 4.4.3

### Patch Changes

-   @comet/blocks-api@4.4.3

## 4.4.2

### Patch Changes

-   896265c1: Fix improper validation of input when creating/updating page tree nodes or redirects
-   cd07c107: Prevent the fileUrl from being exposed in the Site via the PixelImageBlock
    -   @comet/blocks-api@4.4.2

## 4.4.1

### Patch Changes

-   @comet/blocks-api@4.4.1

## 4.4.0

### Minor Changes

-   d4960b05: Add loop toggle to YouTubeVideo block

### Patch Changes

-   53ce0682: get file stats from uploaded file in filestorage
-   11583624: Add content validation for SVG files to prevent the upload of SVGs containing JavaScript
-   Updated dependencies [d4960b05]
    -   @comet/blocks-api@4.4.0

## 4.3.0

### Minor Changes

-   afc7a6b6: Add human readable label for publisher (cron jobs and jobs)
-   b4264f18: Make changes checker scope-aware

### Patch Changes

-   44fbe3f9: add stream end when create files from buffer in filestorage
-   92f23a46: Change propagationPolicy for deleting jobs from default to Background

    Currently we use the default propagationPolicy for deleting jobs. This results in pods from jobs being deleted in k8s but not on OpenShift. With the value fixed to "Background", the jobs should get deleted on every system.
    Foreground would be blocking, so we use Background to be non blocking.

    -   @comet/blocks-api@4.3.0

## 4.2.0

### Minor Changes

-   0fdb1b33: Add new extractGraphqlFields helper function that extracts requested fields from GraphQLResolveInfo

    Usage example:

    ```
    async products(@Info() info: GraphQLResolveInfo): Promise<PaginatedProducts> {
        const fields = extractGraphqlFields(info, { root: "nodes" });
        const options: FindOptions<Product, any> = { };
        if (fields.includes("category")) options.populate = ["category"];
        //alternative if graphql structure completely matches entities: options.populate = fields;
        const [entities, totalCount] = await this.repository.findAndCount({}, options);
    ```

### Patch Changes

-   @comet/blocks-api@4.2.0

## 4.1.0

### Minor Changes

-   51466b1a: Add support for enum types to API CRUD Generator

### Patch Changes

-   51466b1a: Fix page tree node visibility update
    -   @comet/blocks-api@4.1.0
