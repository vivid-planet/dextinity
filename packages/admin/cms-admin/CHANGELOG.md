# @comet/cms-admin

## 7.26.1

### Patch Changes

-   ccda21388e: Update `axios` to `^0.33.0` to fix known security vulnerabilities

    The previously used `axios@^0.21.0` is affected by multiple published advisories (among them SSRF and credential leakage via absolute URLs, `Proxy-Authorization` leakage across redirects, prototype-pollution gadgets and several denial-of-service issues). Version `0.33.0` of the maintained 0.x line contains the fixes for all of them while keeping the API compatible, so no changes are required in projects using Comet.

    -   @comet/admin@7.26.1
    -   @comet/admin-date-time@7.26.1
    -   @comet/admin-icons@7.26.1
    -   @comet/admin-rte@7.26.1
    -   @comet/admin-theme@7.26.1
    -   @comet/blocks-admin@7.26.1

## 7.26.0

### Patch Changes

-   @comet/admin@7.26.0
-   @comet/admin-date-time@7.26.0
-   @comet/admin-icons@7.26.0
-   @comet/admin-rte@7.26.0
-   @comet/admin-theme@7.26.0
-   @comet/blocks-admin@7.26.0

## 7.25.15

### Patch Changes

-   @comet/admin@7.25.15
-   @comet/admin-date-time@7.25.15
-   @comet/admin-icons@7.25.15
-   @comet/admin-rte@7.25.15
-   @comet/admin-theme@7.25.15
-   @comet/blocks-admin@7.25.15

## 7.25.14

### Patch Changes

-   @comet/admin@7.25.14
-   @comet/admin-date-time@7.25.14
-   @comet/admin-icons@7.25.14
-   @comet/admin-rte@7.25.14
-   @comet/admin-theme@7.25.14
-   @comet/blocks-admin@7.25.14

## 7.25.13

### Patch Changes

-   @comet/admin@7.25.13
-   @comet/admin-date-time@7.25.13
-   @comet/admin-icons@7.25.13
-   @comet/admin-rte@7.25.13
-   @comet/admin-theme@7.25.13
-   @comet/blocks-admin@7.25.13

## 7.25.12

### Patch Changes

-   @comet/admin@7.25.12
-   @comet/admin-date-time@7.25.12
-   @comet/admin-icons@7.25.12
-   @comet/admin-rte@7.25.12
-   @comet/admin-theme@7.25.12
-   @comet/blocks-admin@7.25.12

## 7.25.11

### Patch Changes

-   @comet/admin@7.25.11
-   @comet/admin-date-time@7.25.11
-   @comet/admin-icons@7.25.11
-   @comet/admin-rte@7.25.11
-   @comet/admin-theme@7.25.11
-   @comet/blocks-admin@7.25.11

## 7.25.10

### Patch Changes

-   @comet/admin@7.25.10
-   @comet/admin-date-time@7.25.10
-   @comet/admin-icons@7.25.10
-   @comet/admin-rte@7.25.10
-   @comet/admin-theme@7.25.10
-   @comet/blocks-admin@7.25.10

## 7.25.9

### Patch Changes

-   79a90e7f6: Prevent phishing in SitePreview

    Affected applications: if the property `resolvePath` of the `SitePreview` component returns the plain path. The default implementation in the starter is not affected.

    -   @comet/admin@7.25.9
    -   @comet/admin-date-time@7.25.9
    -   @comet/admin-icons@7.25.9
    -   @comet/admin-rte@7.25.9
    -   @comet/admin-theme@7.25.9
    -   @comet/blocks-admin@7.25.9

## 7.25.8

### Patch Changes

-   c85d16277: Fix styling of `DialogTitle` in `ChooseFileDialog`
    -   @comet/admin@7.25.8
    -   @comet/admin-date-time@7.25.8
    -   @comet/admin-icons@7.25.8
    -   @comet/admin-rte@7.25.8
    -   @comet/admin-theme@7.25.8
    -   @comet/blocks-admin@7.25.8

## 7.25.7

### Patch Changes

-   1f6b81f8c: Copying a page between scopes with the same DAM scope now retains DAM file references

    Previously, when copying a page from one scope to another and these scopes shared the same DAM scope, the copied page would lose all references to DAM files.

    Example:

    -   You copy a page from scope `{ domain: "main", language: "en" }` to `{ domain: "main", language: "de" }`
    -   And the DAM scope is only `{ domain: "main" }`

    → the copied page would lose all references to DAM files

    Now, the copied page retains references to DAM files, if both scopes share the same DAM scope.

    -   @comet/admin@7.25.7
    -   @comet/admin-date-time@7.25.7
    -   @comet/admin-icons@7.25.7
    -   @comet/admin-rte@7.25.7
    -   @comet/admin-theme@7.25.7
    -   @comet/blocks-admin@7.25.7

## 7.25.6

### Patch Changes

-   ddeba0239: Fix missing "Crop image" button in `PixelImageBlock`
    -   @comet/admin@7.25.6
    -   @comet/admin-date-time@7.25.6
    -   @comet/admin-icons@7.25.6
    -   @comet/admin-rte@7.25.6
    -   @comet/admin-theme@7.25.6
    -   @comet/blocks-admin@7.25.6

## 7.25.5

### Patch Changes

-   @comet/admin@7.25.5
-   @comet/admin-date-time@7.25.5
-   @comet/admin-icons@7.25.5
-   @comet/admin-rte@7.25.5
-   @comet/admin-theme@7.25.5
-   @comet/blocks-admin@7.25.5

## 7.25.4

### Patch Changes

-   404317584: Validate path parameter in site preview

    Prevents phishing attacks.

    -   @comet/admin@7.25.4
    -   @comet/admin-date-time@7.25.4
    -   @comet/admin-icons@7.25.4
    -   @comet/admin-rte@7.25.4
    -   @comet/admin-theme@7.25.4
    -   @comet/blocks-admin@7.25.4

## 7.25.3

### Patch Changes

-   @comet/admin@7.25.3
-   @comet/admin-date-time@7.25.3
-   @comet/admin-icons@7.25.3
-   @comet/admin-rte@7.25.3
-   @comet/admin-theme@7.25.3
-   @comet/blocks-admin@7.25.3

## 7.25.2

### Patch Changes

-   @comet/admin@7.25.2
-   @comet/admin-date-time@7.25.2
-   @comet/admin-icons@7.25.2
-   @comet/admin-rte@7.25.2
-   @comet/admin-theme@7.25.2
-   @comet/blocks-admin@7.25.2

## 7.25.1

### Patch Changes

-   02394453f: Consider all scope dimensions when automatically disabling grouping and matching the selected option in `ContentScopeSelect`

    This solves two issues where for scopes with optional parts

    -   the `ContentScopeSelect` switched between disabled and enabled grouping depending on the selected scope
    -   the wrong selected scope was shown because the matching didn't consider all dimensions
    -   @comet/admin@7.25.1
    -   @comet/admin-date-time@7.25.1
    -   @comet/admin-icons@7.25.1
    -   @comet/admin-rte@7.25.1
    -   @comet/admin-theme@7.25.1
    -   @comet/blocks-admin@7.25.1

## 7.25.0

### Minor Changes

-   b421ed273: Support captions in the `DamVideoBlock`

    The captions can be set uploaded as .vtt files and linked to videos in the DAM.

-   c95365d03: Add the possibility to attach captions (.vtt files) to videos in the DAM
-   a1a129e00: Allow uploading .vtt files to the DAM

### Patch Changes

-   @comet/admin@7.25.0
-   @comet/admin-date-time@7.25.0
-   @comet/admin-icons@7.25.0
-   @comet/admin-rte@7.25.0
-   @comet/admin-theme@7.25.0
-   @comet/blocks-admin@7.25.0

## 7.24.0

### Patch Changes

-   6d293de63: Consider required permission of ancestors in `MasterMenuRoutes`
-   Updated dependencies [751616321]
-   Updated dependencies [fa611381b]
-   Updated dependencies [fa611381b]
-   Updated dependencies [fc900f217]
-   Updated dependencies [24e046fb3]
    -   @comet/blocks-admin@7.24.0
    -   @comet/admin-date-time@7.24.0
    -   @comet/admin@7.24.0
    -   @comet/admin-theme@7.24.0
    -   @comet/admin-rte@7.24.0
    -   @comet/admin-icons@7.24.0

## 7.23.0

### Minor Changes

-   afaa49d6e: Page Tree: Add support for scope parts

    **Example**

    ```tsx
    <CmsBlockContextProvider
        // Dimension "domain" is used for the page tree scope
        pageTreeScopeParts={["domain"]}
    >
        {/* ... */}
    </CmsBlockContextProvider>
    ```

### Patch Changes

-   @comet/admin@7.23.0
-   @comet/admin-date-time@7.23.0
-   @comet/admin-icons@7.23.0
-   @comet/admin-rte@7.23.0
-   @comet/admin-theme@7.23.0
-   @comet/blocks-admin@7.23.0

## 7.22.0

### Minor Changes

-   2cf573b72: Adapt styling of `DamTable` to align with Comet DXP design

### Patch Changes

-   8b80b254e: Set `altText` and `title` fields to null in the DAM when deleting the field value

    Previously, the `altText` and `title` fields value couldn't be completely removed.

-   6d8159d67: Prevent the `UserPermissionsUserGrid` from losing focus while entering text in the search input
-   Updated dependencies [2cf573b72]
-   Updated dependencies [086774f01]
    -   @comet/admin@7.22.0
    -   @comet/admin-date-time@7.22.0
    -   @comet/admin-icons@7.22.0
    -   @comet/admin-rte@7.22.0
    -   @comet/admin-theme@7.22.0
    -   @comet/blocks-admin@7.22.0

## 7.21.1

### Patch Changes

-   Updated dependencies [b771bd6d8]
    -   @comet/admin@7.21.1
    -   @comet/admin-date-time@7.21.1
    -   @comet/admin-icons@7.21.1
    -   @comet/admin-rte@7.21.1
    -   @comet/admin-theme@7.21.1
    -   @comet/blocks-admin@7.21.1

## 7.21.0

### Patch Changes

-   Updated dependencies [1a30eb858]
-   Updated dependencies [1a30eb858]
-   Updated dependencies [3e9ea613e]
    -   @comet/admin-date-time@7.21.0
    -   @comet/admin@7.21.0
    -   @comet/admin-icons@7.21.0
    -   @comet/admin-rte@7.21.0
    -   @comet/admin-theme@7.21.0
    -   @comet/blocks-admin@7.21.0

## 7.20.0

### Minor Changes

-   ea26f5d89: Add a nullable column `activatedAt` to `Redirects` table to display the latest activation date of a redirect

### Patch Changes

-   Updated dependencies [415a83165]
-   Updated dependencies [99f904f81]
-   Updated dependencies [2d1726543]
    -   @comet/admin@7.20.0
    -   @comet/admin-date-time@7.20.0
    -   @comet/admin-icons@7.20.0
    -   @comet/admin-rte@7.20.0
    -   @comet/admin-theme@7.20.0
    -   @comet/blocks-admin@7.20.0

## 7.19.0

### Minor Changes

-   91cb37bb9: Add `mimetype` to `DamFileDownloadLinkBlock`

### Patch Changes

-   ea932357e: Prevent `ContentScopeSelect` from overlapping the header
-   Updated dependencies [3544127ad]
-   Updated dependencies [17b79b581]
    -   @comet/admin@7.19.0
    -   @comet/blocks-admin@7.19.0
    -   @comet/admin-date-time@7.19.0
    -   @comet/admin-icons@7.19.0
    -   @comet/admin-rte@7.19.0
    -   @comet/admin-theme@7.19.0

## 7.18.0

### Minor Changes

-   2dc23dd6d: Remove visual device frames (Mobile, Tablet, Desktop) from Admin Preview
-   ec9778450: Support multiple paths `ContentScopeProvider` by default

    Change the default implementation of `location.createPath` to create multiple paths based on the content scope shapes.

### Patch Changes

-   0acf80d30: User Permissions: Allow permission-specific content scopes to override by-rule content scopes
-   Updated dependencies [e6092df34]
-   Updated dependencies [f496734f8]
-   Updated dependencies [e6092df34]
    -   @comet/admin-date-time@7.18.0
    -   @comet/blocks-admin@7.18.0
    -   @comet/admin@7.18.0
    -   @comet/admin-icons@7.18.0
    -   @comet/admin-rte@7.18.0
    -   @comet/admin-theme@7.18.0

## 7.17.0

### Minor Changes

-   4c3b64610: Add `video/webm` to allowedMimetypes of `DamVideoBlock`
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

### Patch Changes

-   ae56e879e: Prevent the content of `ContentScopeIndicator` from breaking on mobile to align with the Comet DXP design
    -   @comet/admin@7.17.0
    -   @comet/admin-date-time@7.17.0
    -   @comet/admin-icons@7.17.0
    -   @comet/admin-rte@7.17.0
    -   @comet/admin-theme@7.17.0
    -   @comet/blocks-admin@7.17.0

## 7.16.0

### Minor Changes

-   997b220fa: Adapt styling of the link dialog in `createRichTextBlock` to match the Comet DXP design
-   ed9282b3b: Improve the block preview of redirect targets

    Display the redirect target in the first line.
    Move additional information (type, path) to the second line.

### Patch Changes

-   ea014c5e3: Set the correct icon for the button to confirm page actions
-   e59fffbb2: Adapt styling of the page tree search input to match the Comet DXP design
-   Updated dependencies [9bd499dcd]
-   Updated dependencies [ed9282b3b]
-   Updated dependencies [ec1cf3cf8]
-   Updated dependencies [bf7b89ffc]
-   Updated dependencies [5b7c6b4a7]
    -   @comet/blocks-admin@7.16.0
    -   @comet/admin-theme@7.16.0
    -   @comet/admin@7.16.0
    -   @comet/admin-date-time@7.16.0
    -   @comet/admin-icons@7.16.0
    -   @comet/admin-rte@7.16.0

## 7.15.0

### Patch Changes

-   46ab330da: Adapt styling of the dashboard header to match the Comet DXP design
-   Updated dependencies [e056e8f3d]
-   Updated dependencies [a189d4ed9]
-   Updated dependencies [faa54eb8e]
-   Updated dependencies [7d8c36e6c]
-   Updated dependencies [a189d4ed9]
-   Updated dependencies [6827982fe]
-   Updated dependencies [7d8c36e6c]
    -   @comet/blocks-admin@7.15.0
    -   @comet/admin@7.15.0
    -   @comet/admin-theme@7.15.0
    -   @comet/admin-date-time@7.15.0
    -   @comet/admin-icons@7.15.0
    -   @comet/admin-rte@7.15.0

## 7.14.0

### Minor Changes

-   97cd0a3dd: User Permissions: Use Data Grid instead of a checkbox list for displaying and selecting content scopes
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

-   c71604e71: Add an `override` argument to all block factories to follow `createCompositeBlock`'s pattern

### Patch Changes

-   Updated dependencies [6b75f20e4]
-   Updated dependencies [9b190db59]
-   Updated dependencies [84e063642]
-   Updated dependencies [948e07bba]
-   Updated dependencies [bb041f7a7]
-   Updated dependencies [7f72e82fc]
    -   @comet/admin@7.14.0
    -   @comet/admin-theme@7.14.0
    -   @comet/blocks-admin@7.14.0
    -   @comet/admin-rte@7.14.0
    -   @comet/admin-date-time@7.14.0
    -   @comet/admin-icons@7.14.0

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

-   Updated dependencies [bd562d325]
-   Updated dependencies [5c06e4bee]
-   Updated dependencies [bd562d325]
-   Updated dependencies [b918c810b]
-   Updated dependencies [86c1d5996]
    -   @comet/admin@7.13.0
    -   @comet/blocks-admin@7.13.0
    -   @comet/admin-rte@7.13.0
    -   @comet/admin-date-time@7.13.0
    -   @comet/admin-icons@7.13.0
    -   @comet/admin-theme@7.13.0

## 7.12.0

### Minor Changes

-   604491df5: Validate filename length for uploads to DAM or FileUploads

    The filename can't exceed 255 characters.

### Patch Changes

-   64173b513: Fix page tree node slug validation to prevent URL encoded characters
-   0837c4c64: Hide the "Dependents" tab in the DAM for users without the permission `dependencies`
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

-   02dd20ac4: Export `useDamScope` hook

    This allows accessing the DAM scope in the application. This might be necessary when developing integrations with a third-party DAM.

-   954635630: Update default icon of `ContentScopeSelect` and fix mobile styling for `AppHeader` components

    -   Update the default icon in `ContentScopeSelect` from `<Domain />` to `<Language />`
    -   Fix mobile styling of `BuildEntry` and `ContentScopeSelect` and `UserHeaderItem`

-   Updated dependencies [af51bb408]
-   Updated dependencies [92b3255d2]
-   Updated dependencies [47be4ebd3]
-   Updated dependencies [86479e770]
-   Updated dependencies [954635630]
-   Updated dependencies [e8003f9c7]
-   Updated dependencies [4f6e6b011]
-   Updated dependencies [5583c9cff]
-   Updated dependencies [ee597535a]
-   Updated dependencies [5583c9cff]
-   Updated dependencies [7da81fa2e]
-   Updated dependencies [3ddc2278b]
-   Updated dependencies [af350d086]
-   Updated dependencies [86479e770]
-   Updated dependencies [0bb181a52]
-   Updated dependencies [af51bb408]
    -   @comet/admin@7.12.0
    -   @comet/admin-theme@7.12.0
    -   @comet/blocks-admin@7.12.0
    -   @comet/admin-date-time@7.12.0
    -   @comet/admin-icons@7.12.0
    -   @comet/admin-rte@7.12.0

## 7.11.0

### Minor Changes

-   3acbb04d4: Update design of the user menu in the header and add information about the impersonated user

### Patch Changes

-   94cc411a6: Adapt styling of `ContentScopeSelect` to match the Comet design
-   6778c4e97: Prevent the creation of a second home page
-   7992a9a9e: Enable setting `importSourceId` and `importSourceType` for each individual file in the `useDamFileUpload#uploadFiles` function
-   Updated dependencies [b8b8e2747]
-   Updated dependencies [9f2a1272b]
-   Updated dependencies [1e01cca21]
-   Updated dependencies [a30f0ee4d]
-   Updated dependencies [a4fcdeb51]
-   Updated dependencies [5ba64aab6]
-   Updated dependencies [20f63417e]
-   Updated dependencies [e9f547d95]
-   Updated dependencies [8114a6ae7]
    -   @comet/admin@7.11.0
    -   @comet/admin-theme@7.11.0
    -   @comet/admin-date-time@7.11.0
    -   @comet/admin-icons@7.11.0
    -   @comet/admin-rte@7.11.0
    -   @comet/blocks-admin@7.11.0

## 7.10.0

### Minor Changes

-   2b9fac2cf: Add support for passing title and alt text to `useDamFileUpload`

    This can be useful when importing files from an external DAM.

### Patch Changes

-   d210ef74a: Remove vertical and horizontal scroll bars from block preview iframe
-   Updated dependencies [7e94c55f6]
-   Updated dependencies [22f3d402e]
-   Updated dependencies [8f924d591]
-   Updated dependencies [aa02ca13f]
-   Updated dependencies [6eba5abea]
-   Updated dependencies [6eba5abea]
-   Updated dependencies [bf6b03fe0]
-   Updated dependencies [b51bf6d85]
-   Updated dependencies [71876ea69]
-   Updated dependencies [589b0b9ee]
    -   @comet/admin-theme@7.10.0
    -   @comet/admin@7.10.0
    -   @comet/admin-date-time@7.10.0
    -   @comet/admin-icons@7.10.0
    -   @comet/admin-rte@7.10.0
    -   @comet/blocks-admin@7.10.0

## 7.9.0

### Minor Changes

-   7cea765fe: Add UI for Impersonation Feature

    -   Add indicator to display when impersonation mode is active in `UserHeaderItem`
    -   Add button to allow users to switch on impersonation in the `UserGrid`
    -   Integrate `CrudMoreActionsMenu` in `UserPageToolbar` with an impersonation entry for easy access to this feature.
    -   Add `ImpersonateUser` icon

### Patch Changes

-   6d6131b16: Use consistent date and time formatting across the Admin UI
-   27510c22f: Prevent `ContentScopeIndicator` from crashing when a scope part is `undefined`
-   8ed5795a1: Don't add non-existing scope parts to the `DamScope` as `undefined`
-   7ce4b0f0a: Fix DAM license duration input when no values are provided
-   Updated dependencies [6d6131b16]
-   Updated dependencies [7cea765fe]
-   Updated dependencies [92f9d078f]
-   Updated dependencies [48cac4dac]
-   Updated dependencies [047b9d17b]
-   Updated dependencies [0919e3ba6]
-   Updated dependencies [55d40ef08]
-   Updated dependencies [9aa6947b7]
-   Updated dependencies [59b4b6f77]
    -   @comet/admin@7.9.0
    -   @comet/admin-icons@7.9.0
    -   @comet/blocks-admin@7.9.0
    -   @comet/admin-theme@7.9.0
    -   @comet/admin-date-time@7.9.0
    -   @comet/admin-rte@7.9.0

## 7.8.0

### Minor Changes

-   44a54554c: Allow replacing a file with a new one on the file detail page in the DAM
-   b721ac044: Harmonize the size and alignment of the DAM filters
-   c6d3ac36b: Add support for file replacement on upload in the DAM

    When uploading a file to the DAM with the same filename as an existing file, it's now possible to replace the existing file.
    This is useful when you want to update a file without changing its URL.

-   4037b4d8c: Rework the DAM crop/focus settings UI
-   059636aba: Pass the `graphQLApiUrl` for `useBlockPreviewFetch` through the `IFrameBridge`

    It's not necessary to set it in the site anymore. To migrate, remove the argument from `useBlockPreviewFetch()`:

    ```diff
    const PreviewPage = () => {
        const iFrameBridge = useIFrameBridge();

    -   const { fetch, graphQLFetch } = useBlockPreviewFetch(graphQLApiUrl);
    +   const { fetch, graphQLFetch } = useBlockPreviewFetch();

        const [blockData, setBlockData] = useState<PageContentBlockData>();
        useEffect(() => {
            async function load() {
    +           if (!graphQLFetch) {
    +               return;
    +           }
                if (!iFrameBridge.block) {
                    setBlockData(undefined);
                    return;
                }
                const newData = await recursivelyLoadBlockData({
                    blockType: "PageContent",
                    blockData: iFrameBridge.block,
                    graphQLFetch,
                    fetch,
                    pageTreeNodeId: undefined, //we don't have a pageTreeNodeId in preview
                });
                setBlockData(newData);
            }
            load();
        }, [iFrameBridge.block, fetch, graphQLFetch]);

        return <div>{blockData && <PageContentBlock data={blockData} />}</div>;
    };
    ```

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

-   62ead06fa: Master Menu: render collapsible or grouped menu items only when at least one item of the submenu is allowed.
-   Updated dependencies [139616be6]
-   Updated dependencies [d8fca0522]
-   Updated dependencies [a168e5514]
-   Updated dependencies [e16ad1a02]
-   Updated dependencies [e78315c9c]
-   Updated dependencies [c6d3ac36b]
-   Updated dependencies [139616be6]
-   Updated dependencies [eefb0546f]
-   Updated dependencies [795ec73d9]
-   Updated dependencies [8617c3bcd]
-   Updated dependencies [d8298d59a]
-   Updated dependencies [059636aba]
-   Updated dependencies [daacf1ea6]
-   Updated dependencies [4338a6c07]
-   Updated dependencies [9cc75c141]
    -   @comet/admin@7.8.0
    -   @comet/admin-icons@7.8.0
    -   @comet/blocks-admin@7.8.0
    -   @comet/admin-date-time@7.8.0
    -   @comet/admin-rte@7.8.0
    -   @comet/admin-theme@7.8.0

## 7.7.0

### Minor Changes

-   6cb498f51: Add search results highlighting to `ContentScopeSelect`

    Also, add the helper function `findTextMatches`, which can be used to add search highlighting to a custom `renderOption` implementation:

    ```tsx
    <ContentScopeSelect
        renderOption={(option, query) => {
            const text = `${option.domain.label} – ${option.language.label}`;
            const matches = findTextMatches(text, query);
            return <ListItemText primary={<MarkedMatches text={text} matches={matches} />} />;
        }}
    />
    ```

### Patch Changes

-   bb9215f25: Don't move files to a folder called "." when uploading them to the DAM

    This bug only occurred in projects with a `react-dropzone` version >= 14.3.2.

-   Updated dependencies [8ffc90eb1]
-   Updated dependencies [a9d2e2e25]
    -   @comet/blocks-admin@7.7.0
    -   @comet/admin@7.7.0
    -   @comet/admin-date-time@7.7.0
    -   @comet/admin-icons@7.7.0
    -   @comet/admin-rte@7.7.0
    -   @comet/admin-theme@7.7.0

## 7.6.0

### Minor Changes

-   1f5c29ce8: Show the number of permissions and content scopes in the User Permissions Admin panel
-   671e2b234: Create site preview JWT in the API

    With this change the site preview can be deployed unprotected. Authentication is made via a JWT created in the API and validated in the site. A separate domain for the site preview is still necessary.

    **Note:** This requires the `sitePreviewSecret` option to be configured in the `PageTreeModule`.
    Run `npx @comet/upgrade@latest v7/add-site-preview-secret.ts` in the root of your project to perform the necessary code changes.
    Changes to the deployment setup might still be necessary.

-   3ea66fb38: Add support for user impersonation

    Prerequisites for setups with separate domains for admin and api: `credentials: "include"` must be set in the `createApolloClient` function in the admin.

    Adds an "Impersonation" button to the detail view of a user in the User Permissions admin panel. The impersonation can be exited by clicking the button in the user's info on the top right.

-   d54a8c9f8: Add support for multiple paths in `ContentScopeProvider`

    This enables using different paths for scopes with non-overlapping dimensions.
    The `location.createPath` and `location.createUrl` functions can be used to override the default behavior.

    **Example**

    ```tsx
    <ContentScopeProvider
        location={{
            createPath: () => ["/organization/:organizationId", "/channel/:channelId"],
            createUrl: (scope) => {
                if (scope.organizationId) {
                    return `/organization/${scope.organizationId}`;
                } else if (scope.channelId) {
                    return `/channel/${scope.channelId}`;
                } else {
                    throw new Error("Invalid scope");
                }
            },
        }}
    />
    ```

-   05058fc1b: Export components to allow customization of User Permissions Admin panel

    The application can provide a custom UserPermissionsPage based on the [default UserPermissionsPage](https://github.com/vivid-planet/comet/blob/main/packages/admin/cms-admin/src/userPermissions/UserPermissionsPage.tsx).

-   0589ef554: Add `displayName` prop to `createTextLinkBlock` factory to support setting a custom display name

### Patch Changes

-   11ce320e9: Fix validation of empty `PhoneLinkBlock`

    Previously, the default phone value was an empty string, meaning `@IsOptional()` didn't prevent validation.
    Since an empty string is not a valid phone number, the validation failed.

    This change sets the default value to `undefined`.

-   700ddc340: Fix copy/paste for documents containing a `DamFileDownloadLinkBlock`
-   18a9f22a7: Keep current location when changing scope on publisher and user permissions page
-   6a43beebc: Display global `ContentScopeIndicator` if redirects are scoped globally

    Previously, an empty `ContentScopeIndicator` was displayed if no `scopeParts` were passed to `createRedirectsPage`.

-   1cf01f70f: Fix `ContentScopeIndicator` for scope with optional dimensions
-   Updated dependencies [bc19fb18c]
-   Updated dependencies [37d71a89a]
-   Updated dependencies [cf2ee898f]
-   Updated dependencies [03afcd073]
-   Updated dependencies [00d7ddae1]
-   Updated dependencies [fe8909404]
    -   @comet/admin@7.6.0
    -   @comet/admin-date-time@7.6.0
    -   @comet/admin-icons@7.6.0
    -   @comet/admin-rte@7.6.0
    -   @comet/admin-theme@7.6.0
    -   @comet/blocks-admin@7.6.0

## 7.5.0

### Minor Changes

-   5a48ae482: Add file size to `DamFileDownloadLinkBlock`
-   2639fe51a: Add "License" column to DAM Data Grid

    It is only shown if the license feature is enabled by setting `enableLicenseFeature` in `DamConfigProvider` to `true`.

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

-   bc124d267: Support numbers as content scope values in User Permissions administration panel
-   Updated dependencies [bb7c2de72]
-   Updated dependencies [9a6a64ef3]
-   Updated dependencies [c59a60023]
-   Updated dependencies [b5838209b]
-   Updated dependencies [c8f37fbd1]
-   Updated dependencies [4cea3e31b]
-   Updated dependencies [216d93a10]
    -   @comet/admin@7.5.0
    -   @comet/admin-date-time@7.5.0
    -   @comet/admin-icons@7.5.0
    -   @comet/admin-rte@7.5.0
    -   @comet/admin-theme@7.5.0
    -   @comet/blocks-admin@7.5.0

## 7.4.2

### Patch Changes

-   @comet/admin@7.4.2
-   @comet/admin-date-time@7.4.2
-   @comet/admin-icons@7.4.2
-   @comet/admin-rte@7.4.2
-   @comet/admin-theme@7.4.2
-   @comet/blocks-admin@7.4.2

## 7.4.1

### Patch Changes

-   fa31e0856: Display validation errors of file name field in DAM
    -   @comet/admin@7.4.1
    -   @comet/admin-date-time@7.4.1
    -   @comet/admin-icons@7.4.1
    -   @comet/admin-rte@7.4.1
    -   @comet/admin-theme@7.4.1
    -   @comet/blocks-admin@7.4.1

## 7.4.0

### Minor Changes

-   aad4eef42: Use a `Chip` in combination with a `Menu` for the page visibility selection

    This replaces a `Button` which was used previously as trigger for the menu.

-   44f1c593e: Add dialog to confirm manually starting a cron job
-   cab7c427a: Add support for downloading previously uploaded files to `FileUploadField`
-   1ca46e8da: Add support for `badgeContent` prop in `MenuItemRouterLink`

    **Example usage in `masterMenuData`:**

    ```ts
    const masterMenuData = [
        // ...
        {
            type: "route",
            primary: "Some Route",
            to: "/someRoute",
            badgeContent: 2,
        },
        // ...
    ];
    ```

    **Example usage as element:**

    ```tsx
    <MenuItemRouterLink primary="Some Route" to="/someRoute" badgeContent={2} />
    ```

-   bfb8f04e6: Add `VimeoVideoBlock` to support Vimeo videos
-   5fc1fc393: Add info alert for dependents and duplicates in DAM

### Patch Changes

-   Updated dependencies [22863c202]
-   Updated dependencies [cab7c427a]
-   Updated dependencies [48d1403d7]
-   Updated dependencies [1ca46e8da]
-   Updated dependencies [1ca46e8da]
-   Updated dependencies [bef162a60]
-   Updated dependencies [bc1ed880a]
-   Updated dependencies [46f932299]
-   Updated dependencies [3e013b05d]
    -   @comet/admin@7.4.0
    -   @comet/blocks-admin@7.4.0
    -   @comet/admin-date-time@7.4.0
    -   @comet/admin-icons@7.4.0
    -   @comet/admin-rte@7.4.0
    -   @comet/admin-theme@7.4.0

## 7.3.2

### Patch Changes

-   Updated dependencies [2286234e5]
    -   @comet/admin@7.3.2
    -   @comet/admin-date-time@7.3.2
    -   @comet/admin-icons@7.3.2
    -   @comet/admin-rte@7.3.2
    -   @comet/admin-theme@7.3.2
    -   @comet/blocks-admin@7.3.2

## 7.3.1

### Patch Changes

-   Updated dependencies [91bfda996]
    -   @comet/admin@7.3.1
    -   @comet/admin-date-time@7.3.1
    -   @comet/admin-icons@7.3.1
    -   @comet/admin-rte@7.3.1
    -   @comet/admin-theme@7.3.1
    -   @comet/blocks-admin@7.3.1

## 7.3.0

### Patch Changes

-   3f1b9617d: Allow emptying `targetUrl` in `ExternalLinkBlock`
-   Updated dependencies [6a1310cf6]
-   Updated dependencies [5364ecb37]
-   Updated dependencies [a1f4c0dec]
-   Updated dependencies [2ab7b688e]
    -   @comet/admin-date-time@7.3.0
    -   @comet/admin@7.3.0
    -   @comet/admin-icons@7.3.0
    -   @comet/admin-rte@7.3.0
    -   @comet/admin-theme@7.3.0
    -   @comet/blocks-admin@7.3.0

## 7.2.1

### Patch Changes

-   @comet/admin@7.2.1
-   @comet/admin-date-time@7.2.1
-   @comet/admin-icons@7.2.1
-   @comet/admin-rte@7.2.1
-   @comet/admin-theme@7.2.1
-   @comet/blocks-admin@7.2.1

## 7.2.0

### Patch Changes

-   4b267f90d: Fix broken export/import of `commonErrorMessages` from the file form field
-   Updated dependencies [9b800c9f6]
-   Updated dependencies [0fb8d9a26]
-   Updated dependencies [4b267f90d]
    -   @comet/admin-theme@7.2.0
    -   @comet/admin@7.2.0
    -   @comet/admin-date-time@7.2.0
    -   @comet/admin-icons@7.2.0
    -   @comet/admin-rte@7.2.0
    -   @comet/blocks-admin@7.2.0

## 7.1.0

### Minor Changes

-   7410aae83: Add new `FileUploadField` component for uploading files in forms using the `FileUploadsModule`
-   945ba8725: Add `icon` prop to `DashboardWidgetRoot`
-   9a8098488: Rework `EditImageDialog`

    Changes

    -   Increase image size
    -   Add hover effects for focal points
    -   Add "Open in DAM" button

        Note: This feature only works if the `DependenciesConfig` is configured for `DamFile`:

        ```diff
        // App.tsx

        <DependenciesConfigProvider
            entityDependencyMap={{
        +       DamFile: createDamFileDependency(),
                // ...
            }}
        >
        ```

-   91b154b06: Make the details and creator/author fields optional when using the DAM license feature

### Patch Changes

-   7dabe8d11: Fix the content scope indicator on the `EditFile` page if DAM scoping is disabled
-   452a12a3c: Change text color of `FilePreview` action buttons to white

    Previously, the text was invisible because it was black on a black background.

-   bbb753600: Fix false positives in `resolveHasSaveConflict` check

    The check occasionally failed due to rounding errors.
    This is fixed by rounding to full seconds before checking.

-   Updated dependencies [3adf5fecd]
-   Updated dependencies [04844d39e]
-   Updated dependencies [2253a1d00]
-   Updated dependencies [dfc4a7fff]
-   Updated dependencies [1fe10e883]
-   Updated dependencies [c90ae39d4]
-   Updated dependencies [b1bbd6a0c]
-   Updated dependencies [c0488eb84]
-   Updated dependencies [e53f4ce06]
-   Updated dependencies [39ab15616]
-   Updated dependencies [c1ab2b340]
-   Updated dependencies [99a1f0ae6]
-   Updated dependencies [edf14d066]
-   Updated dependencies [2b68513be]
-   Updated dependencies [6be41b668]
-   Updated dependencies [374f383ba]
-   Updated dependencies [c050f2242]
    -   @comet/admin-theme@7.1.0
    -   @comet/admin@7.1.0
    -   @comet/blocks-admin@7.1.0
    -   @comet/admin-icons@7.1.0
    -   @comet/admin-date-time@7.1.0
    -   @comet/admin-rte@7.1.0

## 7.0.0

### Major Changes

-   0588e212c: Remove `language` field from `User` object

    -   Providing the locale is not mandatory for ID-Tokens
    -   Does not have a real use case (better rely on the Accept-Language header of the browser to determine the language of the current user)

-   3574617ea: Remove `EditPageLayout`

    You can completely remove `EditPageLayout` from your application.
    Instead, use `MainContent` to wrap all your page content except the `Toolbar`.
    If needed, wrap `MainContent` and `Toolbar` in a fragment.

    Example:

    ```diff
    - <EditPageLayout>
    + <>
          <Toolbar>
              // ...
          </Toolbar>
    -     <div>
    +     <MainContent>
              // ...
    -     </div>
    +     </MainContent>
    - </EditPageLayout>
    + </>
    ```

-   0e6debb06: CRUD Generator: Remove `lastUpdatedAt` argument from update mutations
-   2abc096fe: Replace the `ContentScopeIndicator` with a new version intended for use in the new `Toolbar`

    The old `ContentScopeIndicator` was a purely cosmetic component. Hence, the logic for displaying the current scope had to be implemented in the project (usually in a project-internal `ContentScopeIndicator` component).

    The new `ContentScopeIndicator` has the logic for displaying the current scope built-in. Thus, you can remove your project's `ContentScopeIndicator` implementation and directly use the `ContentScopeIndicator` from this library.

    Usage:

    -   Per default, the `ContentScopeIndicator` displays the current `ContentScope`
    -   Pass a scope object via the `scope` prop if your page has a custom scope
    -   Pass the `global` prop if your page has no scope
    -   Pass `children` if you want to render completely custom content

-   c8e7a0496: Restructure `MasterMenuData`

    Items now need an explicit `type`. There are four types available:

    -   `route`

        ```diff
        {
        +   type: "route",
            primary: <FormattedMessage id="menu.dashboard" defaultMessage="Dashboard" />,
            icon: <DashboardIcon />,
            route: {
                path: "/dashboard",
                component: Dashboard,
            },
        },
        ```

    -   `externalLink`

        ```diff
        {
        +   type: "externalLink",
            primary: <FormattedMessage id="menu.cometDxp" defaultMessage="COMET DXP" />,
            icon: <Snips />,
            href: "https://comet-dxp.com",
        },
        ```

    -   `collapsible`

        ```diff
        {
        +   type: "collapsible",
            primary: <FormattedMessage id="menu.structuredContent" defaultMessage="Structured Content" />,
            icon: <Data />,
        -   submenu: [
        +   items: [
                // ...
            ],
        },
        ```

    -   `group` (new)

        ```diff
        {
        +  type: "group",
        +  title: <FormattedMessage id="menu.products" defaultMessage="Products" />,
        +  items: [
        +      // ...
        +  ]
        },
        ```

-   06768a70f: Make icon required for top level menu and group items

    This fixes the problem, that there was no icon or text to display in the collapsed state of the menu if no icon was passed.
    Icons are required for all top level menu items and the items of groups. Groups themselves do not require an icon.

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

-   b777136f8: Rework `ContentScopeProvider` and `ContentScopeControls`

    The content scope controls were changed to display all available combinations in a single select.

    This requires a few breaking changes:

    1. The `values` props of `ContentScopeProvider` has been changed to an array:

        **Before**

        ```ts
        const values: ContentScopeValues<ContentScope> = {
            domain: [
                { label: "Main", value: "main" },
                { label: "Secondary", value: "secondary" },
            ],
            language: [
                { label: "English", value: "en" },
                { label: "German", value: "de" },
            ],
        };
        ```

        **Now**

        ```ts
        const values: ContentScopeValues<ContentScope> = [
            {
                domain: { label: "Main", value: "main" },
                language: { label: "English", value: "en" },
            },
            {
                domain: { label: "Main", value: "main" },
                language: { label: "German", value: "de" },
            },
            {
                domain: { label: "Secondary", value: "secondary" },
                language: { label: "English", value: "en" },
            },
        ];
        ```

    2. The `config` prop of `ContentScopeControls` has been removed.
       You can use the props `searchable`, `groupBy`, and `icon` instead.
       You may also remove the convenience wrapper defined in the application as it doesn't offer a real benefit anymore:

        ```diff
        + import { ContentScopeControls } from "@comet/cms-admin";
        - import { ContentScopeControls as ContentScopeControlsLibrary } from "@comet/cms-admin";

        - export const ContentScopeControls: React.FC = () => {
        -     return <ContentScopeControlsLibrary<ContentScope> config={controlsConfig} />;
        - };
        ```

-   ae0142029: Support single host for block preview

    The content scope is passed through the iframe-bridge in the admin and accessible in the site in the IFrameBridgeProvider.
    Breaking: `previewUrl`-property of `SiteConfig` has changed to `blockPreviewBaseUrl`

-   c3940df58: Replace `additionalMimeTypes` and `overrideAcceptedMimeTypes` in `DamConfigProvider` with `acceptedMimeTypes`

    You can now add mime types like this:

    ```tsx
    <DamConfigProvider
        value={{
            acceptedMimeTypes: [...damDefaultAcceptedMimetypes, "something-else"],
        }}
    >
        {/* ... */}
    </DamConfigProvider>
    ```

    And remove them like this:

    ```tsx
    <DamConfigProvider
        value={{
            acceptedMimeTypes: damDefaultAcceptedMimetypes.filter((mimeType) => mimeType !== "application/zip"),
        }}
    >
        {/* ... */}
    </DamConfigProvider>
    ```

    Don't forget to also remove/add the mime types in the API's `DamModule`

-   92eae2ba9: Change the method of overriding the styling of Admin components

    -   Remove dependency on the legacy `@mui/styles` package in favor of `@mui/material/styles`.
    -   Add the ability to style components using [MUI's `sx` prop](https://mui.com/system/getting-started/the-sx-prop/).
    -   Add the ability to style individual elements (slots) of a component using the `slotProps` and `sx` props.
    -   The `# @comet/cms-admin syntax in the theme's `styleOverrides` is no longer supported, see: https://mui.com/material-ui/migration/v5-style-changes/#migrate-theme-styleoverrides-to-emotion

    ```diff
     const theme = createCometTheme({
         components: {
             CometAdminMyComponent: {
                 styleOverrides: {
    -                root: {
    -                    "&$hasShadow": {
    -                        boxShadow: "2px 2px 5px 0 rgba(0, 0, 0, 0.25)",
    -                    },
    -                    "& $header": {
    -                        backgroundColor: "lime",
    -                    },
    -                },
    +                hasShadow: {
    +                    boxShadow: "2px 2px 5px 0 rgba(0, 0, 0, 0.25)",
    +                },
    +                header: {
    +                    backgroundColor: "lime",
    +                },
                 },
             },
         },
     });
    ```

    -   Overriding a component's styles using `withStyles` is no longer supported. Use the `sx` and `slotProps` props instead:

    ```diff
    -import { withStyles } from "@mui/styles";
    -
    -const StyledMyComponent = withStyles({
    -    root: {
    -        backgroundColor: "lime",
    -    },
    -    header: {
    -        backgroundColor: "fuchsia",
    -    },
    -})(MyComponent);
    -
    -// ...
    -
    -<StyledMyComponent title="Hello World" />;
    +<MyComponent
    +    title="Hello World"
    +    sx={{
    +        backgroundColor: "lime",
    +    }}
    +    slotProps={{
    +        header: {
    +            sx: {
    +                backgroundColor: "fuchsia",
    +            },
    +        },
    +    }}
    +/>
    ```

    -   The module augmentation for the `DefaultTheme` type from `@mui/styles/defaultTheme` is no longer needed and needs to be removed from the admins theme file, usually located in `admin/src/theme.ts`:

    ```diff
    -declare module "@mui/styles/defaultTheme" {
    -    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    -    export interface DefaultTheme extends Theme {}
    -}
    ```

    -   Class-keys originating from MUI components have been removed from Comet Admin components, causing certain class-names and `styleOverrides` to no longer be applied.
        The components `root` class-key is not affected. Other class-keys will retain the class-names and `styleOverrides` from the underlying MUI component.
        For example, in `ClearInputAdornment` (when used with `position="end"`) the class-name `CometAdminClearInputAdornment-positionEnd` and the `styleOverrides` for `CometAdminClearInputAdornment.positionEnd` will no longer be applied.
        The component will retain the class-names `MuiInputAdornment-positionEnd`, `MuiInputAdornment-root`, and `CometAdminClearInputAdornment-root`.
        Also, the `styleOverrides` for `MuiInputAdornment.positionEnd`, `MuiInputAdornment.root`, and `CometAdminClearInputAdornment.root` will continue to be applied.

        This affects the following components:

        -   `AppHeader`
        -   `AppHeaderMenuButton`
        -   `ClearInputAdornment`
        -   `Tooltip`
        -   `CancelButton`
        -   `DeleteButton`
        -   `OkayButton`
        -   `SaveButton`
        -   `StackBackButton`
        -   `DatePicker`
        -   `DateRangePicker`
        -   `TimePicker`

    -   For more details, see MUI's migration guide: https://mui.com/material-ui/migration/v5-style-changes/#mui-styles

-   769bd72f0: Use the Next.js Preview Mode for the site preview

    The preview is entered by navigating to an API Route in the site, which has to be executed in a secured environment.
    In the API Route the current scope is checked (and possibly stored), then the client is redirected to the preview.

### Minor Changes

-   b777136f8: Add `ContentScopeSelect` component

    This can be used as the basis for both content-driven and data-driven applications.

    **Example**

    ```tsx
    function ContentScopeControls() {
        const [value, setValue] = useState({ domain: "main", language: "en" });

        return (
            <ContentScopeSelect
                value={value}
                onChange={(value) => {
                    setValue(value);
                }}
                options={[
                    { domain: { label: "Main", value: "main" }, language: { label: "English", value: "en" } },
                    { domain: { label: "Main", value: "main" }, language: { label: "German", value: "de" } },
                    { domain: { label: "Secondary", value: "secondary" }, language: { label: "English", value: "en" } },
                    { domain: { label: "Secondary", value: "secondary" }, language: { label: "German", value: "de" } },
                ]}
            />
        );
    }
    ```

-   2486e8a91: Add future Admin Generator that works with configuration files
-   5c5500733: Remove "Re-login"-button from `CurrentUserProvider`

    The button is already implemented in `createErrorDialogApolloLink()`. The correct arrangement of
    the components in `App.tsx` (see migration guide) makes the double implementation needless.

-   8d920da56: CRUD Generator: Add support for date-only fields
-   52a925e0f: Admin Generator: Use variant="horizontal" for all generated form fields
-   3b1dc72d3: Adapt `Header` and `UserHeaderItem` used in `AppHeader` for mobile devices (<900px)
-   569ad0463: Deprecate `SplitButton`, `FinalFormSaveSplitButton` and `SplitButtonContext` and remove all uses of these components in our libraries

    The reason is that we decided to retire the SplitButton pattern.

-   b7560e3a7: Add preview image to `YouTubeVideoBlock` and `DamVideoBlock`

    The `YouTubeVideoBlock` and the `DamVideoBlock` now support a preview image out of the box. For customisation the default `VideoPreviewImage` component can be overridden with the optional `renderPreviewImage` method.

    It is recommended to replace the custom implemented video blocks in the projects with the updated `YouTubeVideoBlock` and `DamVideoBlock` from the library.

### Patch Changes

-   53fe8d76e: Redirect to edit page after adding a redirect

    Previously, the user wasn't redirected to the edit page after creating a new redirect.
    This caused strange validation errors and made it impossible to edit the redirect after creating it.

-   Updated dependencies [05ce68ec0]
-   Updated dependencies [949356e84]
-   Updated dependencies [51a0861d8]
-   Updated dependencies [dc8bb6a99]
-   Updated dependencies [803bc607f]
-   Updated dependencies [54f775497]
-   Updated dependencies [33ba50719]
-   Updated dependencies [73140014f]
-   Updated dependencies [9a4530b06]
-   Updated dependencies [dc8bb6a99]
-   Updated dependencies [33ba50719]
-   Updated dependencies [e3efdfcc3]
-   Updated dependencies [02d33e230]
-   Updated dependencies [a0bd09afa]
-   Updated dependencies [8cc51b368]
-   Updated dependencies [c702cc5b2]
-   Updated dependencies [c46146cb3]
-   Updated dependencies [ad73068f4]
-   Updated dependencies [6054fdcab]
-   Updated dependencies [535444623]
-   Updated dependencies [d0869ac82]
-   Updated dependencies [9a4530b06]
-   Updated dependencies [47ec528a4]
-   Updated dependencies [33ba50719]
-   Updated dependencies [956111ab2]
-   Updated dependencies [f9615fbf4]
-   Updated dependencies [19eaee4ca]
-   Updated dependencies [758c65656]
-   Updated dependencies [9a4530b06]
-   Updated dependencies [cb544bc3e]
-   Updated dependencies [04ed68cc9]
-   Updated dependencies [61b2acfb2]
-   Updated dependencies [0263a45fa]
-   Updated dependencies [4ca4830f3]
-   Updated dependencies [3397ec1b6]
-   Updated dependencies [20b2bafd8]
-   Updated dependencies [33ba50719]
-   Updated dependencies [51a0861d8]
-   Updated dependencies [b7560e3a7]
-   Updated dependencies [9c4b7c974]
-   Updated dependencies [b5753e612]
-   Updated dependencies [2a7bc765c]
-   Updated dependencies [774977311]
-   Updated dependencies [27efe7bd8]
-   Updated dependencies [f8114cd39]
-   Updated dependencies [569ad0463]
-   Updated dependencies [b87c3c292]
-   Updated dependencies [170720b0c]
-   Updated dependencies [f06f4bea6]
-   Updated dependencies [cce88d448]
-   Updated dependencies [a58918893]
-   Updated dependencies [119714999]
-   Updated dependencies [2a7bc765c]
-   Updated dependencies [b87c3c292]
-   Updated dependencies [d2e64d1ec]
-   Updated dependencies [865f253d8]
-   Updated dependencies [f8114cd39]
-   Updated dependencies [241249bd4]
-   Updated dependencies [be4e6392d]
-   Updated dependencies [a53545438]
-   Updated dependencies [1a1d83156]
-   Updated dependencies [a2f278bbd]
-   Updated dependencies [66330e4e6]
-   Updated dependencies [b0249e3bc]
-   Updated dependencies [92eae2ba9]
-   Updated dependencies [33ba50719]
    -   @comet/admin@7.0.0
    -   @comet/admin-theme@7.0.0
    -   @comet/admin-date-time@7.0.0
    -   @comet/blocks-admin@7.0.0
    -   @comet/admin-rte@7.0.0
    -   @comet/admin-icons@7.0.0

## 7.0.0-beta.6

### Patch Changes

-   Updated dependencies [119714999]
    -   @comet/admin@7.0.0-beta.6
    -   @comet/admin-date-time@7.0.0-beta.6
    -   @comet/admin-icons@7.0.0-beta.6
    -   @comet/admin-rte@7.0.0-beta.6
    -   @comet/admin-theme@7.0.0-beta.6
    -   @comet/blocks-admin@7.0.0-beta.6

## 7.0.0-beta.5

### Minor Changes

-   569ad0463: Deprecate `SplitButton`, `FinalFormSaveSplitButton` and `SplitButtonContext` and remove all uses of these components in our libraries

    The reason is that we decided to retire the SplitButton pattern.

### Patch Changes

-   Updated dependencies [569ad0463]
    -   @comet/admin@7.0.0-beta.5
    -   @comet/admin-date-time@7.0.0-beta.5
    -   @comet/admin-icons@7.0.0-beta.5
    -   @comet/admin-rte@7.0.0-beta.5
    -   @comet/admin-theme@7.0.0-beta.5
    -   @comet/blocks-admin@7.0.0-beta.5

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

### Minor Changes

-   b7560e3a7: Add preview image to `YouTubeVideoBlock` and `DamVideoBlock`

    The `YouTubeVideoBlock` and the `DamVideoBlock` now support a preview image out of the box. For customisation the default `VideoPreviewImage` component can be overridden with the optional `renderPreviewImage` method.

    It is recommended to replace the custom implemented video blocks in the projects with the updated `YouTubeVideoBlock` and `DamVideoBlock` from the library.

### Patch Changes

-   Updated dependencies [a0bd09afa]
-   Updated dependencies [b7560e3a7]
-   Updated dependencies [170720b0c]
-   Updated dependencies [a58918893]
    -   @comet/admin@7.0.0-beta.4
    -   @comet/blocks-admin@7.0.0-beta.4
    -   @comet/admin-date-time@7.0.0-beta.4
    -   @comet/admin-icons@7.0.0-beta.4
    -   @comet/admin-rte@7.0.0-beta.4
    -   @comet/admin-theme@7.0.0-beta.4

## 7.0.0-beta.3

### Major Changes

-   06768a70f: Make icon required for top level menu and group items

    This fixes the problem, that there was no icon or text to display in the collapsed state of the menu if no icon was passed.
    Icons are required for all top level menu items and the items of groups. Groups themselves do not require an icon.

### Patch Changes

-   Updated dependencies [ce5eaede2]
    -   @comet/admin@7.0.0-beta.3
    -   @comet/admin-date-time@7.0.0-beta.3
    -   @comet/admin-icons@7.0.0-beta.3
    -   @comet/admin-rte@7.0.0-beta.3
    -   @comet/admin-theme@7.0.0-beta.3
    -   @comet/blocks-admin@7.0.0-beta.3

## 7.0.0-beta.2

### Major Changes

-   3574617ea: Remove `EditPageLayout`

    You can completely remove `EditPageLayout` from your application.
    Instead, use `MainContent` to wrap all your page content except the `Toolbar`.
    If needed, wrap `MainContent` and `Toolbar` in a fragment.

    Example:

    ```diff
    - <EditPageLayout>
    + <>
          <Toolbar>
              // ...
          </Toolbar>
    -     <div>
    +     <MainContent>
              // ...
    -     </div>
    +     </MainContent>
    - </EditPageLayout>
    + </>
    ```

### Minor Changes

-   acfcef9e4: The `documentTypes` prop of `PagesPage` now also accepts a function mapping categories to document types

    Previously, only the supported documentTypes of the current category could be passed to the `PagesPage`.
    That made it impossible to verify if a document can be moved to another category.
    If a document was moved to a category that didn't support its type, the PageTree crashed.

    If a mapping function is passed to `documentTypes`, documents can only be moved to categories that support their type.

    ```diff
    <PagesPage
    -   documentTypes={pageTreeDocumentTypes}
    +   documentTypes={(category): Record<DocumentType, DocumentInterface> => {
    +       if (category === "TopMenu") {
    +           return {
    +               Page,
    +               PredefinedPage,
    +           };
    +       }
    +
    +       return {
    +           Page,
    +           PredefinedPage,
    +           Link,
    +       };
    +   }}
        // ...
    />
    ```

-   61a43d270: Add a menu item to `PixelImageBlock`, `SvgImageBlock` and `DamVideoBlock` that opens the chosen file in the DAM

    Note: This feature only works if the `DependenciesConfig` is configured for `DamFile`:

    ```diff
    // App.tsx

    <DependenciesConfigProvider
        entityDependencyMap={{
    +       DamFile: createDamFileDependency(),
            // ...
        }}
    >
    ```

### Patch Changes

-   e106a02b2: Make the `ContentScopeIndicator` show the scope label instead of the scope value
-   Updated dependencies [2fc764e29]
-   Updated dependencies [2de81e40b]
    -   @comet/admin@7.0.0-beta.2
    -   @comet/admin-theme@7.0.0-beta.2
    -   @comet/admin-date-time@7.0.0-beta.2
    -   @comet/admin-icons@7.0.0-beta.2
    -   @comet/admin-rte@7.0.0-beta.2
    -   @comet/blocks-admin@7.0.0-beta.2

## 7.0.0-beta.1

### Major Changes

-   c3940df58: Replace `additionalMimeTypes` and `overrideAcceptedMimeTypes` in `DamConfigProvider` with `acceptedMimeTypes`

    You can now add mime types like this:

    ```tsx
    <DamConfigProvider
        value={{
            acceptedMimeTypes: [...damDefaultAcceptedMimetypes, "something-else"],
        }}
    >
        {/* ... */}
    </DamConfigProvider>
    ```

    And remove them like this:

    ```tsx
    <DamConfigProvider
        value={{
            acceptedMimeTypes: damDefaultAcceptedMimetypes.filter((mimeType) => mimeType !== "application/zip"),
        }}
    >
        {/* ... */}
    </DamConfigProvider>
    ```

    Don't forget to also remove/add the mime types in the API's `DamModule`

### Minor Changes

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

### Patch Changes

-   @comet/admin@7.0.0-beta.1
-   @comet/admin-date-time@7.0.0-beta.1
-   @comet/admin-icons@7.0.0-beta.1
-   @comet/admin-rte@7.0.0-beta.1
-   @comet/admin-theme@7.0.0-beta.1
-   @comet/blocks-admin@7.0.0-beta.1

## 7.0.0-beta.0

### Major Changes

-   f74544524: Change language field in User and CurrentUser to locale
-   0588e212c: Remove `locale`-field from `User`-object

    -   Providing the locale is not mandatory for ID-Tokens
    -   Does not have a real use case (better rely on the Accept-Language header of the browser to determine the language of the current user)

-   865f253d8: Add `@comet/admin-theme` as a peer dependency

    `@comet/cms-admin` now uses the custom `Typography` variants `list` and `listItem` defined in `@comet/admin-theme`.

-   0e6debb06: CRUD Generator: Remove `lastUpdatedAt` argument from update mutations
-   2abc096fe: Replace the `ContentScopeIndicator` with a new version intended for use in the new `Toolbar`

    The old `ContentScopeIndicator` was a purely cosmetic component. Hence, the logic for displaying the current scope had to be implemented in the project (usually in a project-internal `ContentScopeIndicator` component).

    The new `ContentScopeIndicator` has the logic for displaying the current scope built-in. Thus, you can remove your project's `ContentScopeIndicator` implementation and directly use the `ContentScopeIndicator` from this library.

    Usage:

    -   Per default, the `ContentScopeIndicator` displays the current `ContentScope`
    -   Pass a scope object via the `scope` prop if your page has a custom scope
    -   Pass the `global` prop if your page has no scope
    -   Pass `children` if you want to render completely custom content

-   c8e7a0496: Restructure `MasterMenuData`

    Items now need an explicit `type`. There are four types available:

    -   `route`

        ```diff
        {
        +   type: "route",
            primary: <FormattedMessage id="menu.dashboard" defaultMessage="Dashboard" />,
            icon: <DashboardIcon />,
            route: {
                path: "/dashboard",
                component: Dashboard,
            },
        },
        ```

    -   `externalLink`

        ```diff
        {
        +   type: "externalLink",
            primary: <FormattedMessage id="menu.cometDxp" defaultMessage="COMET DXP" />,
            icon: <Snips />,
            href: "https://comet-dxp.com",
        },
        ```

    -   `collapsible`

        ```diff
        {
        +   type: "collapsible",
            primary: <FormattedMessage id="menu.structuredContent" defaultMessage="Structured Content" />,
            icon: <Data />,
        -   submenu: [
        +   items: [
                // ...
            ],
        },
        ```

    -   `group` (new)

        ```diff
        {
        +  type: "group",
        +  title: <FormattedMessage id="menu.products" defaultMessage="Products" />,
        +  items: [
        +      // ...
        +  ]
        },
        ```

-   ebf597120: Remove unused/unnecessary peer dependencies

    Some dependencies were incorrectly marked as peer dependencies.
    If you don't use them in your application, you may remove the following dependencies:

    -   Admin: `axios`
    -   API: `@aws-sdk/client-s3`, `@azure/storage-blob` and `pg-error-constants`

-   b777136f8: Rework `ContentScopeProvider` and `ContentScopeControls`

    The content scope controls were changed to display all available combinations in a single select.

    This requires a few breaking changes:

    1. The `values` props of `ContentScopeProvider` has been changed to an array:

        **Before**

        ```ts
        const values: ContentScopeValues<ContentScope> = {
            domain: [
                { label: "Main", value: "main" },
                { label: "Secondary", value: "secondary" },
            ],
            language: [
                { label: "English", value: "en" },
                { label: "German", value: "de" },
            ],
        };
        ```

        **Now**

        ```ts
        const values: ContentScopeValues<ContentScope> = [
            {
                domain: { label: "Main", value: "main" },
                language: { label: "English", value: "en" },
            },
            {
                domain: { label: "Main", value: "main" },
                language: { label: "German", value: "de" },
            },
            {
                domain: { label: "Secondary", value: "secondary" },
                language: { label: "English", value: "en" },
            },
        ];
        ```

    2. The `config` prop of `ContentScopeControls` has been removed.
       You can use the props `searchable`, `groupBy`, and `icon` instead.
       You may also remove the convenience wrapper defined in the application as it doesn't offer a real benefit anymore:

        ```diff
        + import { ContentScopeControls } from "@comet/cms-admin";
        - import { ContentScopeControls as ContentScopeControlsLibrary } from "@comet/cms-admin";

        - export const ContentScopeControls: React.FC = () => {
        -     return <ContentScopeControlsLibrary<ContentScope> config={controlsConfig} />;
        - };
        ```

-   ae0142029: Support single host for block preview

    The content scope is passed through the iframe-bridge in the admin and accessible in the site in the IFrameBridgeProvider.
    Breaking: `previewUrl`-property of `SiteConfig` has changed to `blockPreviewBaseUrl`

-   92eae2ba9: Change the method of overriding the styling of Admin components

    -   Remove dependency on the legacy `@mui/styles` package in favor of `@mui/material/styles`.
    -   Add the ability to style components using [MUI's `sx` prop](https://mui.com/system/getting-started/the-sx-prop/).
    -   Add the ability to style individual elements (slots) of a component using the `slotProps` and `sx` props.
    -   The `# @comet/cms-admin syntax in the theme's `styleOverrides` is no longer supported, see: https://mui.com/material-ui/migration/v5-style-changes/#migrate-theme-styleoverrides-to-emotion

    ```diff
     const theme = createCometTheme({
         components: {
             CometAdminMyComponent: {
                 styleOverrides: {
    -                root: {
    -                    "&$hasShadow": {
    -                        boxShadow: "2px 2px 5px 0 rgba(0, 0, 0, 0.25)",
    -                    },
    -                    "& $header": {
    -                        backgroundColor: "lime",
    -                    },
    -                },
    +                hasShadow: {
    +                    boxShadow: "2px 2px 5px 0 rgba(0, 0, 0, 0.25)",
    +                },
    +                header: {
    +                    backgroundColor: "lime",
    +                },
                 },
             },
         },
     });
    ```

    -   Overriding a component's styles using `withStyles` is no longer supported. Use the `sx` and `slotProps` props instead:

    ```diff
    -import { withStyles } from "@mui/styles";
    -
    -const StyledMyComponent = withStyles({
    -    root: {
    -        backgroundColor: "lime",
    -    },
    -    header: {
    -        backgroundColor: "fuchsia",
    -    },
    -})(MyComponent);
    -
    -// ...
    -
    -<StyledMyComponent title="Hello World" />;
    +<MyComponent
    +    title="Hello World"
    +    sx={{
    +        backgroundColor: "lime",
    +    }}
    +    slotProps={{
    +        header: {
    +            sx: {
    +                backgroundColor: "fuchsia",
    +            },
    +        },
    +    }}
    +/>
    ```

    -   The module augmentation for the `DefaultTheme` type from `@mui/styles/defaultTheme` is no longer needed and needs to be removed from the admins theme file, usually located in `admin/src/theme.ts`:

    ```diff
    -declare module "@mui/styles/defaultTheme" {
    -    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    -    export interface DefaultTheme extends Theme {}
    -}
    ```

    -   Class-keys originating from MUI components have been removed from Comet Admin components, causing certain class-names and `styleOverrides` to no longer be applied.
        The components `root` class-key is not affected. Other class-keys will retain the class-names and `styleOverrides` from the underlying MUI component.
        For example, in `ClearInputAdornment` (when used with `position="end"`) the class-name `CometAdminClearInputAdornment-positionEnd` and the `styleOverrides` for `CometAdminClearInputAdornment.positionEnd` will no longer be applied.
        The component will retain the class-names `MuiInputAdornment-positionEnd`, `MuiInputAdornment-root`, and `CometAdminClearInputAdornment-root`.
        Also, the `styleOverrides` for `MuiInputAdornment.positionEnd`, `MuiInputAdornment.root`, and `CometAdminClearInputAdornment.root` will continue to be applied.

        This affects the following components:

        -   `AppHeader`
        -   `AppHeaderMenuButton`
        -   `ClearInputAdornment`
        -   `Tooltip`
        -   `CancelButton`
        -   `DeleteButton`
        -   `OkayButton`
        -   `SaveButton`
        -   `StackBackButton`
        -   `DatePicker`
        -   `DateRangePicker`
        -   `TimePicker`

    -   For more details, see MUI's migration guide: https://mui.com/material-ui/migration/v5-style-changes/#mui-styles

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

-   b777136f8: Add `ContentScopeSelect` component

    This can be used as the basis for both content-driven and data-driven applications.

    **Example**

    ```tsx
    function ContentScopeControls() {
        const [value, setValue] = useState({ domain: "main", language: "en" });

        return (
            <ContentScopeSelect
                value={value}
                onChange={(value) => {
                    setValue(value);
                }}
                options={[
                    { domain: { label: "Main", value: "main" }, language: { label: "English", value: "en" } },
                    { domain: { label: "Main", value: "main" }, language: { label: "German", value: "de" } },
                    { domain: { label: "Secondary", value: "secondary" }, language: { label: "English", value: "en" } },
                    { domain: { label: "Secondary", value: "secondary" }, language: { label: "German", value: "de" } },
                ]}
            />
        );
    }
    ```

-   2486e8a91: Add future Admin Generator that works with configuration files
-   5c5500733: Remove "Re-login"-button from `CurrentUserProvider`

    The button is already implemented in `createErrorDialogApolloLink()`. The correct arrangement of
    the components in `App.tsx` (see migration guide) makes the double implementation needless.

-   3b1dc72d3: Adapt `Header` and `UserHeaderItem` used in `AppHeader` for mobile devices (<900px)

### Patch Changes

-   Updated dependencies [865f253d8]
-   Updated dependencies [05ce68ec0]
-   Updated dependencies [51a0861d8]
-   Updated dependencies [dc8bb6a99]
-   Updated dependencies [803bc607f]
-   Updated dependencies [54f775497]
-   Updated dependencies [33ba50719]
-   Updated dependencies [73140014f]
-   Updated dependencies [9a4530b06]
-   Updated dependencies [dc8bb6a99]
-   Updated dependencies [33ba50719]
-   Updated dependencies [e3efdfcc3]
-   Updated dependencies [02d33e230]
-   Updated dependencies [c702cc5b2]
-   Updated dependencies [ad73068f4]
-   Updated dependencies [6054fdcab]
-   Updated dependencies [535444623]
-   Updated dependencies [d0869ac82]
-   Updated dependencies [9a4530b06]
-   Updated dependencies [47ec528a4]
-   Updated dependencies [33ba50719]
-   Updated dependencies [956111ab2]
-   Updated dependencies [f9615fbf4]
-   Updated dependencies [19eaee4ca]
-   Updated dependencies [758c65656]
-   Updated dependencies [9a4530b06]
-   Updated dependencies [cb544bc3e]
-   Updated dependencies [04ed68cc9]
-   Updated dependencies [61b2acfb2]
-   Updated dependencies [0263a45fa]
-   Updated dependencies [4ca4830f3]
-   Updated dependencies [3397ec1b6]
-   Updated dependencies [20b2bafd8]
-   Updated dependencies [33ba50719]
-   Updated dependencies [51a0861d8]
-   Updated dependencies [9c4b7c974]
-   Updated dependencies [b5753e612]
-   Updated dependencies [2a7bc765c]
-   Updated dependencies [774977311]
-   Updated dependencies [f8114cd39]
-   Updated dependencies [b87c3c292]
-   Updated dependencies [f06f4bea6]
-   Updated dependencies [cce88d448]
-   Updated dependencies [2a7bc765c]
-   Updated dependencies [b87c3c292]
-   Updated dependencies [d2e64d1ec]
-   Updated dependencies [865f253d8]
-   Updated dependencies [f8114cd39]
-   Updated dependencies [241249bd4]
-   Updated dependencies [be4e6392d]
-   Updated dependencies [a53545438]
-   Updated dependencies [1a1d83156]
-   Updated dependencies [a2f278bbd]
-   Updated dependencies [66330e4e6]
-   Updated dependencies [b0249e3bc]
-   Updated dependencies [92eae2ba9]
-   Updated dependencies [33ba50719]
    -   @comet/admin@7.0.0-beta.0
    -   @comet/admin-theme@7.0.0-beta.0
    -   @comet/admin-date-time@7.0.0-beta.0
    -   @comet/admin-rte@7.0.0-beta.0
    -   @comet/blocks-admin@7.0.0-beta.0
    -   @comet/admin-icons@7.0.0-beta.0

## 6.17.1

### Patch Changes

-   @comet/admin@6.17.1
-   @comet/admin-date-time@6.17.1
-   @comet/admin-icons@6.17.1
-   @comet/admin-rte@6.17.1
-   @comet/admin-theme@6.17.1
-   @comet/blocks-admin@6.17.1

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

### Patch Changes

-   987fe9adf: Fix `DocumentInterface.updateMutation` type

    The type for the `input` variable needs to be `DocumentOutput`, not `DocumentInput`.

-   Updated dependencies [536e95c02]
-   Updated dependencies [7ecc30eba]
-   Updated dependencies [ec4685bf3]
    -   @comet/admin@6.17.0
    -   @comet/admin-date-time@6.17.0
    -   @comet/admin-icons@6.17.0
    -   @comet/admin-rte@6.17.0
    -   @comet/admin-theme@6.17.0
    -   @comet/blocks-admin@6.17.0

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
            };
        }
    }
    ```

    Users need the `translation` permission to use the translation feature.

    **Admin:**

    Wrap the section where you want to use the content translation with the `AzureAiTranslatorProvider` provider:

    ```tsx
    <AzureAiTranslatorProvider enabled={true}>{/*  ...  */}</AzureAiTranslatorProvider>
    ```

    Note: `AzureAiTranslatorProvider` automatically checks for the `translation` permission. The translation button is only shown for users with this permission.

### Patch Changes

-   Updated dependencies [fb0fe2539]
-   Updated dependencies [747fe32cc]
    -   @comet/admin@6.16.0
    -   @comet/admin-date-time@6.16.0
    -   @comet/admin-icons@6.16.0
    -   @comet/admin-rte@6.16.0
    -   @comet/admin-theme@6.16.0
    -   @comet/blocks-admin@6.16.0

## 6.15.1

### Patch Changes

-   @comet/admin@6.15.1
-   @comet/admin-date-time@6.15.1
-   @comet/admin-icons@6.15.1
-   @comet/admin-rte@6.15.1
-   @comet/admin-theme@6.15.1
-   @comet/blocks-admin@6.15.1

## 6.15.0

### Minor Changes

-   cdc861cb7: Add `buttonChildren` and `children` props to `UserHeaderItem`

    This increases the flexibility of the `UserHeaderItem` component by allowing the `AppHeaderDropdown` label to be passed via `buttonChildren`. More buttons or other list items in the dropdown can be passed via `children`.

    **Example:**

    ```tsx
    <UserHeaderItem buttonChildren="Some custom label">
        <Button variant="contained">Some custom button</Button>
        <Button>Some custom button 2</Button>
    </UserHeaderItem>
    ```

### Patch Changes

-   0654f7bce: Handle unauthorized and unauthenticated correctly in error dialog

    The error dialog now presents screens according to the current state. Required to work in all conditions:

    -   `CurrentUserProvider` must be beneath `MuiThemeProvider` and `IntlProvider` and above `RouterBrowserRouter`
    -   `ErrorDialogHandler` must be parallel to `CurrentUserProvider`

-   Updated dependencies [406027806]
-   Updated dependencies [0654f7bce]
-   Updated dependencies [ec7fb9ff2]
    -   @comet/admin-icons@6.15.0
    -   @comet/admin@6.15.0
    -   @comet/blocks-admin@6.15.0
    -   @comet/admin-date-time@6.15.0
    -   @comet/admin-rte@6.15.0
    -   @comet/admin-theme@6.15.0

## 6.14.1

### Patch Changes

-   @comet/admin@6.14.1
-   @comet/admin-date-time@6.14.1
-   @comet/admin-icons@6.14.1
-   @comet/admin-rte@6.14.1
-   @comet/admin-theme@6.14.1
-   @comet/blocks-admin@6.14.1

## 6.14.0

### Minor Changes

-   73dfb61c9: Add `PhoneLinkBlock` and `EmailLinkBlock`
-   9055ff71a: Remove label from `DamVideoBlock` file field

    This was done to streamline it with the `DamImageBlock`.

-   dddb03d1b: Add capability to generate alt texts and titles for images in DAM

    You can find instructions for adding this feature to your project [in the docs](https://docs.comet-dxp.com/docs/content-generation/).

-   acfcef9e4: The `documentTypes` prop of `PagesPage` now also accepts a function mapping categories to document types

    Previously, only the supported documentTypes of the current category could be passed to the `PagesPage`.
    That made it impossible to verify if a document can be moved to another category.
    If a document was moved to a category that didn't support its type, the PageTree crashed.

    If a mapping function is passed to `documentTypes`, documents can only be moved to categories that support their type.

    ```diff
    <PagesPage
    -   documentTypes={pageTreeDocumentTypes}
    +   documentTypes={(category): Record<DocumentType, DocumentInterface> => {
    +       if (category === "TopMenu") {
    +           return {
    +               Page,
    +               PredefinedPage,
    +           };
    +       }
    +
    +       return {
    +           Page,
    +           PredefinedPage,
    +           Link,
    +       };
    +   }}
        // ...
    />
    ```

-   61a43d270: Add a menu item to `PixelImageBlock`, `SvgImageBlock` and `DamVideoBlock` that opens the chosen file in the DAM

    Note: This feature only works if the `DependenciesConfig` is configured for `DamFile`:

    ```diff
    // App.tsx

    <DependenciesConfigProvider
        entityDependencyMap={{
    +       DamFile: createDamFileDependency(),
            // ...
        }}
    >
    ```

### Patch Changes

-   Updated dependencies [2fc764e29]
-   Updated dependencies [2de81e40b]
-   Updated dependencies [efccc42a3]
-   Updated dependencies [012a768ee]
    -   @comet/admin@6.14.0
    -   @comet/admin-theme@6.14.0
    -   @comet/admin-icons@6.14.0
    -   @comet/admin-date-time@6.14.0
    -   @comet/admin-rte@6.14.0
    -   @comet/blocks-admin@6.14.0

## 6.13.0

### Minor Changes

-   c51b250ca: Add loading spinner to `IFrameViewer`

    This feature was added to inform users that the iframe is loading. It is particularly useful when loading takes a long time due to a slow network connection or a large amount of content or data. The feedback remains visible until the iframe is fully loaded and the `onLoad` event is triggered.

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

### Patch Changes

-   aee7ae4a2: Use the same logic for checking the user's content scope in Admin as it is used in the API.
-   Updated dependencies [5e25348bb]
-   Updated dependencies [796e83206]
    -   @comet/admin@6.13.0
    -   @comet/admin-rte@6.13.0
    -   @comet/admin-date-time@6.13.0
    -   @comet/admin-icons@6.13.0
    -   @comet/admin-theme@6.13.0
    -   @comet/blocks-admin@6.13.0

## 6.12.0

### Minor Changes

-   3ee8c7a33: Add a `DamFileDownloadLinkBlock` that can be used to download a file or open it in a new tab

    Also, add new `/dam/files/download/:hash/:fileId/:filename` endpoint for downloading assets.

### Patch Changes

-   Updated dependencies [dc7eaeccb]
-   Updated dependencies [16ffa7be9]
-   Updated dependencies [c06c6f1e9]
    -   @comet/admin-rte@6.12.0
    -   @comet/admin@6.12.0
    -   @comet/admin-theme@6.12.0
    -   @comet/admin-date-time@6.12.0
    -   @comet/admin-icons@6.12.0
    -   @comet/blocks-admin@6.12.0

## 6.11.0

### Minor Changes

-   e10753b65: Allow disabling the "Open preview" button in the `PageTree` for certain document types

    The "Open preview" button is shown for all document types in the `PageTree`.
    But some document types (e.g., links) don't have a preview.
    Clicking on the preview button leads to an error page.

    Now, it's possible to disable the button by setting `hasNoSitePreview` for the document:

    ```diff
    export const Link: DocumentInterface<Pick<GQLLink, "content">, GQLLinkInput> = {
        // ...
    +   hasNoSitePreview: true,
    };
    ```

-   fdf9fa7cb: Automatic Redirects are now set to false if the page is unpublished or archived

### Patch Changes

-   815ba51e7: Fix link target validation in `ExternalLinkBlock`

    Previously, two different validation checks were used.
    This resulted in an error when saving an invalid link target but no error message was shown.

-   Updated dependencies [8e3dec523]
    -   @comet/admin@6.11.0
    -   @comet/admin-date-time@6.11.0
    -   @comet/admin-icons@6.11.0
    -   @comet/admin-rte@6.11.0
    -   @comet/admin-theme@6.11.0
    -   @comet/blocks-admin@6.11.0

## 6.10.0

### Minor Changes

-   f89af8bb2: Add `disableHideInMenu` option to `createEditPageNode` to hide the "Hide in menu" checkbox
-   d4a269e1e: Add `filterByFragment` to replace graphql-anywhere's `filter`

    [graphql-anywhere](https://www.npmjs.com/package/graphql-anywhere) is no longer maintained.
    However, its `filter` utility is useful for filtering data by a GraphQL document, e.g., a fragment.
    Therefore, the function was copied to `@comet/admin`.
    To migrate, replace all `filter` calls with `filterByFragment`:

    ```diff
    - import { filter } from "graphql-anywhere";
    + import { filterByFragment } from "@comet/admin";

    const initialValues: Partial<FormValues> = data?.product
        ? {
    -       ...filter<GQLProductPriceFormFragment>(productPriceFormFragment, data.product),
    +       ...filterByFragment<GQLProductPriceFormFragment>(productPriceFormFragment, data.product),
            price: String(data.product.price),
        }
        : {};
    ```

    You can then uninstall the `graphql-anywhere` package:

    ```bash
    # In admin/
    npm uninstall graphql-anywhere
    ```

-   f528bc340: CronJobModule: Show logs for job run

### Patch Changes

-   d340cabc2: DAM: Fix the duplicate name check when updating a file

    Previously, there were two bugs:

    1. In the `EditFile` form, the `folderId` wasn't passed to the mutation
    2. In `FilesService#updateByEntity`, the duplicate check was always done against the root folder if no `folderId` was passed

    This caused an error when saving a file in any folder if there was another file with the same name in the root folder.
    And it was theoretically possible to create two files with the same name in one folder (though this was still prevented by admin-side validation).

-   Updated dependencies [a8a098a24]
-   Updated dependencies [d4a269e1e]
-   Updated dependencies [52130afba]
-   Updated dependencies [e938254bf]
    -   @comet/admin@6.10.0
    -   @comet/admin-date-time@6.10.0
    -   @comet/admin-icons@6.10.0
    -   @comet/admin-rte@6.10.0
    -   @comet/admin-theme@6.10.0
    -   @comet/blocks-admin@6.10.0

## 6.9.0

### Minor Changes

-   e85837a17: Loosen peer dependency on `react-intl` to allow using v6

### Patch Changes

-   Updated dependencies [9ff9d66c6]
-   Updated dependencies [8fb8b209a]
-   Updated dependencies [e85837a17]
    -   @comet/admin@6.9.0
    -   @comet/admin-rte@6.9.0
    -   @comet/admin-date-time@6.9.0
    -   @comet/blocks-admin@6.9.0
    -   @comet/admin-icons@6.9.0
    -   @comet/admin-theme@6.9.0

## 6.8.0

### Patch Changes

-   c1ca9c335: Don't remove references to `DamFile` from blocks when copying a document from one scope to another if DAM scoping is not enabled
-   Updated dependencies [90c6f192e]
-   Updated dependencies [90c6f192e]
    -   @comet/blocks-admin@6.8.0
    -   @comet/admin@6.8.0
    -   @comet/admin-date-time@6.8.0
    -   @comet/admin-icons@6.8.0
    -   @comet/admin-rte@6.8.0
    -   @comet/admin-theme@6.8.0

## 6.7.0

### Patch Changes

-   2db3bc855: Fix `CurrentUserInterface` type

    Add missing `id` field, make `name`, `email`, and `language` required.

    -   @comet/admin@6.7.0
    -   @comet/admin-date-time@6.7.0
    -   @comet/admin-icons@6.7.0
    -   @comet/admin-rte@6.7.0
    -   @comet/admin-theme@6.7.0
    -   @comet/blocks-admin@6.7.0

## 6.6.2

### Patch Changes

-   0758d2339: Hide the "Dependents" tab in the DAM if the `DependenciesConfigProvider` is not configured

    Previously, the tab was always shown, even if the feature wasn't configured. Though it didn't cause an error, the tab showed no valuable information.

    Now, we hide the tab if no configuration is passed via the `DependenciesConfigProvider`.

    -   @comet/admin@6.6.2
    -   @comet/admin-date-time@6.6.2
    -   @comet/admin-icons@6.6.2
    -   @comet/admin-rte@6.6.2
    -   @comet/admin-theme@6.6.2
    -   @comet/blocks-admin@6.6.2

## 6.6.1

### Patch Changes

-   @comet/admin@6.6.1
-   @comet/admin-date-time@6.6.1
-   @comet/admin-icons@6.6.1
-   @comet/admin-rte@6.6.1
-   @comet/admin-theme@6.6.1
-   @comet/blocks-admin@6.6.1

## 6.6.0

### Patch Changes

-   c76666503: Make headers in `includeInvisibleContentContext` overridable in query

    You can now override the headers `x-include-invisible-content` and `x-preview-dam-urls` in your query like this:

    ```tsx
    const { loading, data, error } = useQuery(exampleQuery, {
        // ...
        context: {
            headers: {
                "x-include-invisible-content": [],
                "x-preview-dam-urls": 0,
            },
        },
    });
    ```

-   Updated dependencies [95b97d768]
-   Updated dependencies [a65679ba3]
-   Updated dependencies [6b04ac9a4]
    -   @comet/admin@6.6.0
    -   @comet/blocks-admin@6.6.0
    -   @comet/admin-date-time@6.6.0
    -   @comet/admin-icons@6.6.0
    -   @comet/admin-rte@6.6.0
    -   @comet/admin-theme@6.6.0

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
-   Updated dependencies [6cb2f9046]
    -   @comet/blocks-admin@6.5.0
    -   @comet/admin@6.5.0
    -   @comet/admin-date-time@6.5.0
    -   @comet/admin-icons@6.5.0
    -   @comet/admin-rte@6.5.0
    -   @comet/admin-theme@6.5.0

## 6.4.0

### Minor Changes

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

-   322da3831: Add `DependencyInterface`

    The `DependencyInterface` must be implemented for entities to be displayed correctly in the `DependencyList`.
    The implementation must then be passed to the `DependenciesConfigProvider`.

    You can use one of the helper methods to implement the `resolvePath()` method required by `DependencyInterface`:

    -   `createDocumentDependencyMethods()` for documents
    -   `createDependencyMethods()` for all other entities

    You can find more information in [the docs](https://docs.comet-dxp.com/docs/dependencies/).

-   322da3831: Add `DependencyList` that can be used to display the dependencies of an entity in the admin

    The `DependencyList` is intended to be used in `Tabs` (as done in the DAM).

### Patch Changes

-   f6c972e59: Correctly evaluate the `language`-field of the `CurrentUser`-object
-   811903e60: Disable the content translation feature for input fields where it doesn't make sense
-   0efae68ff: Prevent XSS attacks in `isLinkTarget()` validator
-   Updated dependencies [30d9e0dee]
-   Updated dependencies [811903e60]
-   Updated dependencies [8ce21f34b]
-   Updated dependencies [322da3831]
-   Updated dependencies [811903e60]
-   Updated dependencies [887365c76]
    -   @comet/blocks-admin@6.4.0
    -   @comet/admin@6.4.0
    -   @comet/admin-date-time@6.4.0
    -   @comet/admin-icons@6.4.0
    -   @comet/admin-rte@6.4.0
    -   @comet/admin-theme@6.4.0

## 6.3.0

### Minor Changes

-   80e6fde4: Show DAM import source in grid

    To show the "Source" column in the DAM's data grid, provide `importSources` in `DamConfigProvider`:

    ```tsx
    <DamConfigProvider
        value={{
            ...
            importSources: {
                unsplash: {
                    label: <FormattedMessage id="dam.importSource.unsplash.label" defaultMessage="Unsplash" />,
                },
            },
        }}
    >
        ...
    </DamConfigProvider>
    ```

### Patch Changes

-   @comet/admin@6.3.0
-   @comet/admin-date-time@6.3.0
-   @comet/admin-icons@6.3.0
-   @comet/admin-rte@6.3.0
-   @comet/admin-theme@6.3.0
-   @comet/blocks-admin@6.3.0

## 6.2.1

### Patch Changes

-   @comet/admin@6.2.1
-   @comet/admin-date-time@6.2.1
-   @comet/admin-icons@6.2.1
-   @comet/admin-rte@6.2.1
-   @comet/admin-theme@6.2.1
-   @comet/blocks-admin@6.2.1

## 6.2.0

### Minor Changes

-   75865caa: Deprecate `isHref` validator, `IsHref` decorator and `IsHrefConstraint` class.

    New versions `isLinkTarget`, `IsLinkTarget` and `IsLinkTargetConstraint` are added as replacement.

### Patch Changes

-   ad153c99: Add the `x-preview-dam-urls` header to our axios client

    Now the axios client always requests preview DAM urls just like the GraphQL client.

-   5dfe4839: Prevent the document editor from losing its state when (re)gaining focus

    In v6.1.0 a loading indicator was added to the document editor (in `PagesPage`).
    This had an unwanted side effect: Focusing the edit page automatically causes a GraphQL request to check for a newer version of the document. This request also caused the loading indicator to render, thus unmounting the editor (`EditComponent`). Consequently, the local state of the editor was lost.

    -   @comet/admin@6.2.0
    -   @comet/admin-date-time@6.2.0
    -   @comet/admin-icons@6.2.0
    -   @comet/admin-rte@6.2.0
    -   @comet/admin-theme@6.2.0
    -   @comet/blocks-admin@6.2.0

## 6.1.0

### Patch Changes

-   7ea5f61f: Use `useCurrentUser` hook where possible
-   693cbdb4: Add loading state for edit `StackPage` in `PagesPage`

    Prevents flash of "Document not found" error message when reloading the page editor

-   Updated dependencies [dcfa03ca]
-   Updated dependencies [08e0da09]
-   Updated dependencies [b35bb8d1]
-   Updated dependencies [f1fc9e20]
-   Updated dependencies [8eb13750]
-   Updated dependencies [a4fac913]
    -   @comet/admin@6.1.0
    -   @comet/admin-icons@6.1.0
    -   @comet/admin-rte@6.1.0
    -   @comet/admin-theme@6.1.0
    -   @comet/admin-date-time@6.1.0
    -   @comet/blocks-admin@6.1.0

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

-   d86d5a90: Make sites config generic

    The sites config was previously assumed to be `Record<string, SiteConfg>`.
    However, as the sites config is solely used in application code, it could be of any shape.
    Therefore, the `SitesConfigProvider` and `useSitesConfig` are made generic.
    The following changes have to be made in the application:

    1.  Define the type of your sites config

        Preferably this should be done in `config.ts`:

        ```diff
        export function createConfig() {
            // ...

            return {
                ...cometConfig,
                apiUrl: environmentVariables.API_URL,
                adminUrl: environmentVariables.ADMIN_URL,
        +       sitesConfig: JSON.parse(environmentVariables.SITES_CONFIG) as SitesConfig,
            };
        }

        + export type SitesConfig = Record<string, SiteConfig>;
        ```

    2.  Use the type when using `useSitesConfig`

        ```diff
        - const sitesConfig = useSitesConfig();
        + const sitesConfig = useSitesConfig<SitesConfig>();
        ```

    3.  Optional: Remove type annotation from `ContentScopeProvider#resolveSiteConfigForScope` (as it's now inferred)

        ```diff
        - resolveSiteConfigForScope: (configs: Record<string, SiteConfig>, scope: ContentScope) => configs[scope.domain],
        + resolveSiteConfigForScope: (configs, scope: ContentScope) => configs[scope.domain],
        ```

### Minor Changes

-   0f814c5e: Add `MasterMenu` and `MasterMenuRoutes` components which both take a single data structure to define menu and routes.

### Patch Changes

-   Updated dependencies [921f6378]
-   Updated dependencies [76e50aa8]
-   Updated dependencies [298b63b7]
-   Updated dependencies [803f5045]
-   Updated dependencies [a525766c]
-   Updated dependencies [0d768540]
-   Updated dependencies [62779124]
    -   @comet/admin@6.0.0
    -   @comet/admin-icons@6.0.0
    -   @comet/admin-rte@6.0.0
    -   @comet/admin-date-time@6.0.0
    -   @comet/blocks-admin@6.0.0
    -   @comet/admin-theme@6.0.0

## 5.6.0

### Minor Changes

-   fe26a6e6: Show an error message when trying to edit a non-existing document and when trying to edit an archived document
-   3ee4ce09: Return newly uploaded items from `useDamFileUpload#uploadFiles`

### Patch Changes

-   Updated dependencies [fb6c8063]
-   Updated dependencies [76f85abe]
    -   @comet/admin-theme@5.6.0
    -   @comet/blocks-admin@5.6.0
    -   @comet/admin@5.6.0
    -   @comet/admin-date-time@5.6.0
    -   @comet/admin-icons@5.6.0
    -   @comet/admin-rte@5.6.0

## 5.5.0

### Patch Changes

-   1b37b1f6: Show `additionalToolbarItems` in `ChooseFileDialog`

    The `additionalToolbarItems` were only shown inside the `DamPage`, but not in the `ChooseFileDialog`.
    To fix this, use the `additionalToolbarItems` option in `DamConfigProvider`.
    The `additionalToolbarItems` prop of `DamPage` has been deprecated in favor of this option.

    **Previously:**

    ```tsx
    <DamPage
        // ...
        additionalToolbarItems={<ImportFromExternalDam />}
    />
    ```

    **Now:**

    ```tsx
    <DamConfigProvider
        value={{
            // ...
            additionalToolbarItems: <ImportFromExternalDam />,
        }}
    >
        {/*...*/}
    </DamConfigProvider>
    ```

-   85aa962c: Set unhandled dependencies to `undefined` when copying documents to another scope

    This prevents leaks between scopes. In practice, this mostly concerns links to documents that don't exist in the target scope.

    **Example:**

    -   Page A links to Page B
    -   Page A is copied from Scope A to Scope B
    -   Link to Page B is removed from Page A by replacing the `id` with `undefined` (since Page B doesn't exist in Scope B)

    **Note:** The link is only retained if both pages are copied in the same operation.

-   c4639be5: Clip crop values when cropping an image in the DAM or `PixelImageBlock`

    Previously, negative values could occur, causing the image proxy to fail on delivery.

    -   @comet/admin@5.5.0
    -   @comet/admin-date-time@5.5.0
    -   @comet/admin-icons@5.5.0
    -   @comet/admin-rte@5.5.0
    -   @comet/admin-theme@5.5.0
    -   @comet/blocks-admin@5.5.0

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

-   51d6c2b9: Move soft-hyphen functionality to `@comet/admin-rte`

    This allows using the soft-hyphen functionality in plain RTEs, and not only in `RichTextBlock`

    ```tsx
    const [useRteApi] = makeRteApi();

    export default function MyRte() {
        const { editorState, setEditorState } = useRteApi();
        return (
            <Rte
                value={editorState}
                onChange={setEditorState}
                options={{
                    supports: [
                        // Soft Hyphen
                        "soft-hyphen",
                        // Other options you may wish to support
                        "bold",
                        "italic",
                    ],
                }}
            />
        );
    }
    ```

-   dcaf750d: Make all DAM license fields optional if `LicenseType` is `ROYALTY_FREE` even if `requireLicense` is true in `DamConfig`

### Patch Changes

-   087cb01d: Enable copying documents from one `PageTree` category to another (e.g. from "Main navigation" to "Top menu" in Demo)
-   Updated dependencies [ba800163]
-   Updated dependencies [981bf48c]
-   Updated dependencies [60a18392]
-   Updated dependencies [51d6c2b9]
    -   @comet/admin@5.4.0
    -   @comet/admin-rte@5.4.0
    -   @comet/admin-date-time@5.4.0
    -   @comet/admin-icons@5.4.0
    -   @comet/admin-theme@5.4.0
    -   @comet/blocks-admin@5.4.0

## 5.3.0

### Patch Changes

-   0fdf4eaf: Always use the `/preview` file URLs in the admin application

    This is achieved by setting the `x-preview-dam-urls` in the `includeInvisibleContentContext`.

    This fixes a page copy bug where all files were downloaded and uploaded again, even when copying within the same environment.

-   Updated dependencies [0ff9b9ba]
-   Updated dependencies [0ff9b9ba]
-   Updated dependencies [a677a162]
-   Updated dependencies [60cc1b2a]
-   Updated dependencies [5435b278]
-   Updated dependencies [a2273887]
    -   @comet/admin-icons@5.3.0
    -   @comet/admin@5.3.0
    -   @comet/blocks-admin@5.3.0
    -   @comet/admin-date-time@5.3.0
    -   @comet/admin-rte@5.3.0
    -   @comet/admin-theme@5.3.0

## 5.2.0

### Minor Changes

-   0bed4e7c: Improve the `SaveConflictDialog`

    -   extend the text in the dialog to explain
        -   what happened
        -   what the next steps are
        -   what can be done to avoid conflicts
    -   make the button labels more precise
    -   once the save dialog is closed
        -   stop polling
        -   mark the save button red and with an error icon

-   0bed4e7c: `useSaveConflict()`, `useSaveConflictQuery()` and `useFormSaveConflict()` now return a `hasConflict` prop

    If `hasConflict` is true, a save conflict has been detected.
    You should pass `hasConflict` on to `SaveButton`, `FinalFormSaveButton` or `FinalFormSaveSplitButton`. The button will then display a "conflict" state.

-   0bed4e7c: Admin Generator: In the generated form, the `hasConflict` prop is passed from the `useFormSaveConflict()` hook to the `FinalFormSaveSplitButton`
-   6fda5a53: CRUD Generator: Change the file ending of the private sibling GraphQL files from `.gql.tsx` to `.gql.ts`

    The GraphQL files do not contain JSX.
    Regenerate the files to apply this change to a project.

### Patch Changes

-   Updated dependencies [25daac07]
-   Updated dependencies [0bed4e7c]
-   Updated dependencies [9fc7d474]
-   Updated dependencies [3702bb23]
-   Updated dependencies [824ea66a]
    -   @comet/admin@5.2.0
    -   @comet/admin-icons@5.2.0
    -   @comet/blocks-admin@5.2.0
    -   @comet/admin-date-time@5.2.0
    -   @comet/admin-rte@5.2.0
    -   @comet/admin-theme@5.2.0

## 5.1.0

### Patch Changes

-   e1d3f007: Prevent false positive save conflicts while editing documents (e.g. `Page`):

    -   Stop checking for conflicts while saving is in progress
    -   Ensure that all "CheckForChanges" polls are cleared

-   6d69dfac: Fix issue in PixelImageBlock that caused the preview URLs for files without a file extension in their filename to be invalid
-   21c30931: Improved the EditPageNode dialog ("Page Properties" dialog):

    -   Execute the asynchronous slug validation less often (increased the debounce wait time from 200ms to 500ms)
    -   Cache the slug validation results. Evict the cache on the initial render of the dialog

-   Updated dependencies [21c30931]
-   Updated dependencies [93b3d971]
-   Updated dependencies [e33cd652]
    -   @comet/admin@5.1.0
    -   @comet/admin-date-time@5.1.0
    -   @comet/admin-icons@5.1.0
    -   @comet/admin-rte@5.1.0
    -   @comet/admin-theme@5.1.0
    -   @comet/blocks-admin@5.1.0

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

-   9875e7d4: Support automatically importing DAM files into another scope when copying documents from one scope to another

    The copy process was reworked:

    -   The `DocumentInterface` now requires a `dependencies()` and a `replaceDependenciesInOutput()` method
    -   The `BlockInterface` now has an optional `dependencies()` and a required `replaceDependenciesInOutput()` method
    -   `rewriteInternalLinks()` was removed from `@comet/cms-admin`. Its functionality is replaced by `replaceDependenciesInOutput()`.

    `dependencies()` returns information about dependencies of a document or block (e.g. a used `DamFile` or linked `PageTreeNode`). `replaceDependenciesInOutput()` replaces the IDs of all dependencies of a document or block with new IDs (necessary for copying documents or blocks to another scope).

    You can use the new `createDocumentRootBlocksMethods()` to generate the methods for documents.

-   c3f96d7d: Don't remember the last folder or file the user opened in the DAM. The `ChooseFileDialog` still remembers the last folder opened.

### Minor Changes

-   168380d9: Add Admin CRUD Generator that creates a simple CRUD admin view for an entity

    It automatically generates an admin page, grid and form based on the GraphQL schema definition of an object type.
    It's meant to be used together with the existing API CRUD Generator.
    Go through [the commits of this PR](https://github.com/vivid-planet/comet/pull/1294/files) for a step-by-step example of how to use the API and Admin Generators.

-   8ed96981: Support copy/pasting DAM files across server instances by downloading the copied file
-   adb5bc34: Add `queryUpdatedAt()` helper that can be used to check conflicts without having to write an additional query
-   6b9787e6: It's now possible to opt-out of creating a redirect when changing the slug of a page. Previously, a redirect was always created.
-   e6b8ec60: Show a bigger version of an image when hovering over an image thumbnail in the DAM and `ChooseFileDialog`
-   5bae9ab3: Show `LinearProgress` instead of `CircularProgress` when polling after initially loading the PageTree
-   47a7272c: Add `requireLicense` option to `DamConfig` to allow making DAM license fields required (when updating a file)
-   e26bd900: Add various UI/UX improvements to the DAM

    -   Replace underlying `Table` with `DataGrid`
    -   Add paging to improve performance
    -   Add a dialog to move files to another folder (instead of drag and drop)
    -   Highlight newly uploaded files
    -   Add a new footer to execute bulk actions
    -   Add a "More Actions" dropdown above the `DataGrid` to execute bulk actions

-   a6734760: Add new `createDocumentRootBlocksMethods()` helper for creating methods needed by DocumentInterface

    It automatically adds `inputToOutput()`, `anchors()`, `dependencies()` and `replaceDependenciesInOutput()` to a document.

    You can see how it can be used [in the COMET Demo project](https://github.com/vivid-planet/comet/blob/a673476017fa35efb6361877d0fcf2b0c8231439/demo/admin/src/pages/Page.tsx#L57-L60).

-   f25eccf0: Add a hover preview for images to the DAM
-   e57c6c66: Move dashboard components from the COMET Starter to the library (`DashboardHeader`, `LatestBuildsDashboardWidget`, `LatestContentUpdatesDashboardWidget`)
-   2d0f320c: Add `useFormSaveConflict()` hook to check for save conflicts in forms

### Patch Changes

-   564f66d3: Allow `:`, `?`, `=` and `&` in redirect source paths
-   c0e03edc: Add a progress dialog to the `PageTree` when pasting pages
-   49e85432: Show a button to re-login when API responses with 401 - Not Authenticated instead of a plain error message.
-   Updated dependencies [0453c36a]
-   Updated dependencies [692c8555]
-   Updated dependencies [2559ff74]
-   Updated dependencies [fe5e0735]
-   Updated dependencies [ed692f50]
-   Updated dependencies [987f08b3]
-   Updated dependencies [d0773a1a]
-   Updated dependencies [4fe08312]
-   Updated dependencies [5f0f8e6e]
-   Updated dependencies [7c6eb68e]
-   Updated dependencies [9875e7d4]
-   Updated dependencies [d4bcab04]
-   Updated dependencies [0f2794e7]
-   Updated dependencies [80b007ae]
-   Updated dependencies [a7116784]
-   Updated dependencies [a7116784]
-   Updated dependencies [e57c6c66]
    -   @comet/admin@5.0.0
    -   @comet/admin-icons@5.0.0
    -   @comet/blocks-admin@5.0.0
    -   @comet/admin-date-time@5.0.0
    -   @comet/admin-rte@5.0.0
    -   @comet/admin-theme@5.0.0

## 4.7.0

### Minor Changes

-   dbdc0f55: Add support for non-breaking spaces to RTE

    Add `"non-breaking-space"` to `supports` when creating an RTE:

    ```tsx
    const [useRteApi] = makeRteApi();

    export default function MyRte() {
        const { editorState, setEditorState } = useRteApi();
        return (
            <Rte
                value={editorState}
                onChange={setEditorState}
                options={{
                    supports: [
                        // Non-breaking space
                        "non-breaking-space",
                        // Other options you may wish to support
                        "bold",
                        "italic",
                    ],
                }}
            />
        );
    }
    ```

-   17f977aa: Add the possibility to search for a path in PageSearch

### Patch Changes

-   Updated dependencies [d1c7a1c5]
-   Updated dependencies [dbdc0f55]
-   Updated dependencies [eac9990b]
-   Updated dependencies [fe310df8]
-   Updated dependencies [fde8e42b]
-   Updated dependencies [f48a768c]
    -   @comet/admin-theme@4.7.0
    -   @comet/admin-icons@4.7.0
    -   @comet/admin-rte@4.7.0
    -   @comet/admin@4.7.0
    -   @comet/blocks-admin@4.7.0
    -   @comet/admin-date-time@4.7.0

## 4.6.0

### Patch Changes

-   c3b7f992: Replace current icons in the RTE toolbar with new icons from `@comet/admin-icons`
-   Updated dependencies [c3b7f992]
-   Updated dependencies [c3b7f992]
-   Updated dependencies [031d86eb]
-   Updated dependencies [c3b7f992]
    -   @comet/admin-rte@4.6.0
    -   @comet/admin-icons@4.6.0
    -   @comet/blocks-admin@4.6.0
    -   @comet/admin@4.6.0
    -   @comet/admin-date-time@4.6.0
    -   @comet/admin-theme@4.6.0

## 4.5.0

### Patch Changes

-   8a2c3302: Correctly position loading indicators by centring them using the new `Loading` component
-   Updated dependencies [46cf5a8b]
-   Updated dependencies [8a2c3302]
-   Updated dependencies [6d4ca5bf]
-   Updated dependencies [07d921d2]
-   Updated dependencies [01677075]
    -   @comet/admin@4.5.0
    -   @comet/admin-theme@4.5.0
    -   @comet/admin-date-time@4.5.0
    -   @comet/admin-icons@4.5.0
    -   @comet/admin-rte@4.5.0
    -   @comet/blocks-admin@4.5.0

## 4.4.3

### Patch Changes

-   0d2a2b96: Ignore empty labels for publisher
    -   @comet/admin@4.4.3
    -   @comet/admin-date-time@4.4.3
    -   @comet/admin-icons@4.4.3
    -   @comet/admin-rte@4.4.3
    -   @comet/admin-theme@4.4.3
    -   @comet/blocks-admin@4.4.3

## 4.4.2

### Patch Changes

-   b299375f: Fix the typing of `lastUpdatedAt` in the `createUsePage()` factory
    -   @comet/admin@4.4.2
    -   @comet/admin-date-time@4.4.2
    -   @comet/admin-icons@4.4.2
    -   @comet/admin-rte@4.4.2
    -   @comet/admin-theme@4.4.2
    -   @comet/blocks-admin@4.4.2

## 4.4.1

### Patch Changes

-   Updated dependencies [662abcc9]
    -   @comet/admin@4.4.1
    -   @comet/admin-date-time@4.4.1
    -   @comet/admin-icons@4.4.1
    -   @comet/admin-rte@4.4.1
    -   @comet/admin-theme@4.4.1
    -   @comet/blocks-admin@4.4.1

## 4.4.0

### Minor Changes

-   9b1a6507: Silence polling errors in page tree

    Errors during polling (pages query, check for changes query) led to multiple consecutive error dialogs, which were irritating for our users. As these errors occurred randomly and would typically be resolved by the next poll, we decided to silence them altogether.

-   a77da844: Add little helper for mui grid pagination (muiGridPagingToGql)

    Sample usage:

    ```
    const { data, loading, error } = useQuery<GQLProductsListQuery, GQLProductsListQueryVariables>(productsQuery, {
        variables: {
            ...muiGridFilterToGql(columns, dataGridProps.filterModel),
            ...muiGridPagingToGql({ page: dataGridProps.page, pageSize: dataGridProps.pageSize }),
            sort: muiGridSortToGql(sortModel),
        },
    });
    ```

### Patch Changes

-   11583624: Add content validation for SVG files to prevent the upload of SVGs containing JavaScript
-   Updated dependencies [e824ffa6]
-   Updated dependencies [d4960b05]
-   Updated dependencies [3e15b819]
-   Updated dependencies [a77da844]
    -   @comet/admin@4.4.0
    -   @comet/blocks-admin@4.4.0
    -   @comet/admin-date-time@4.4.0
    -   @comet/admin-icons@4.4.0
    -   @comet/admin-rte@4.4.0
    -   @comet/admin-theme@4.4.0

## 4.3.0

### Minor Changes

-   afc7a6b6: Add human readable label for publisher (cron jobs and jobs)
-   c302bc46: Admin: AboutModal: make logo configurable

### Patch Changes

-   c725984f: Disable the DAM license feature per default.

    The form fields to add license information to assets are now hidden per default. License warnings are not shown per default.
    Setting the `enableLicenseFeature` option via the DamConfigProvider is now necessary to show the license fields and warnings.

-   Updated dependencies [3dc5f55a]
-   Updated dependencies [865cc5cf]
    -   @comet/admin-rte@4.3.0
    -   @comet/admin@4.3.0
    -   @comet/admin-date-time@4.3.0
    -   @comet/admin-icons@4.3.0
    -   @comet/admin-theme@4.3.0
    -   @comet/blocks-admin@4.3.0

## 4.2.0

### Minor Changes

-   7b7b786e: Add support to search values in content scope controls. Add `searchable: true` to a control's config to make it searchable. See [ContentScopeProvider](demo/admin/src/common/ContentScopeProvider.tsx) for an example

### Patch Changes

-   b4d564b6: Add spacing by default between the tabs and the tab content when using `AdminTabs` or `BlockPreviewWithTabs`. This may add unwanted additional spacing in cases where the spacing was added manually.
-   Updated dependencies [67e54a82]
-   Updated dependencies [3567533e]
-   Updated dependencies [7b614c13]
-   Updated dependencies [aaf1586c]
-   Updated dependencies [b4d564b6]
-   Updated dependencies [d25a7cbb]
-   Updated dependencies [0f4ed6c1]
    -   @comet/admin-theme@4.2.0
    -   @comet/admin@4.2.0
    -   @comet/blocks-admin@4.2.0
    -   @comet/admin-date-time@4.2.0
    -   @comet/admin-icons@4.2.0
    -   @comet/admin-rte@4.2.0

## 4.1.0

### Patch Changes

-   51466b1a: Fix DAM path display
-   Updated dependencies [51466b1a]
-   Updated dependencies [51466b1a]
-   Updated dependencies [51466b1a]
-   Updated dependencies [51466b1a]
-   Updated dependencies [51466b1a]
-   Updated dependencies [51466b1a]
-   Updated dependencies [c5f2f918]
    -   @comet/admin@4.1.0
    -   @comet/admin-icons@4.1.0
    -   @comet/admin-date-time@4.1.0
    -   @comet/admin-rte@4.1.0
    -   @comet/admin-theme@4.1.0
    -   @comet/blocks-admin@4.1.0
