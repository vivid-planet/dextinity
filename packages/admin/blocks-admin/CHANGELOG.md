# @comet/blocks-admin

## 7.26.1

### Patch Changes

-   @comet/admin@7.26.1
-   @comet/admin-icons@7.26.1

## 7.26.0

### Patch Changes

-   @comet/admin@7.26.0
-   @comet/admin-icons@7.26.0

## 7.25.15

### Patch Changes

-   @comet/admin@7.25.15
-   @comet/admin-icons@7.25.15

## 7.25.14

### Patch Changes

-   @comet/admin@7.25.14
-   @comet/admin-icons@7.25.14

## 7.25.13

### Patch Changes

-   @comet/admin@7.25.13
-   @comet/admin-icons@7.25.13

## 7.25.12

### Patch Changes

-   @comet/admin@7.25.12
-   @comet/admin-icons@7.25.12

## 7.25.11

### Patch Changes

-   @comet/admin@7.25.11
-   @comet/admin-icons@7.25.11

## 7.25.10

### Patch Changes

-   @comet/admin@7.25.10
-   @comet/admin-icons@7.25.10

## 7.25.9

### Patch Changes

-   @comet/admin@7.25.9
-   @comet/admin-icons@7.25.9

## 7.25.8

### Patch Changes

-   @comet/admin@7.25.8
-   @comet/admin-icons@7.25.8

## 7.25.7

### Patch Changes

-   @comet/admin@7.25.7
-   @comet/admin-icons@7.25.7

## 7.25.6

### Patch Changes

-   @comet/admin@7.25.6
-   @comet/admin-icons@7.25.6

## 7.25.5

### Patch Changes

-   @comet/admin@7.25.5
-   @comet/admin-icons@7.25.5

## 7.25.4

### Patch Changes

-   @comet/admin@7.25.4
-   @comet/admin-icons@7.25.4

## 7.25.3

### Patch Changes

-   @comet/admin@7.25.3
-   @comet/admin-icons@7.25.3

## 7.25.2

### Patch Changes

-   @comet/admin@7.25.2
-   @comet/admin-icons@7.25.2

## 7.25.1

### Patch Changes

-   @comet/admin@7.25.1
-   @comet/admin-icons@7.25.1

## 7.25.0

### Patch Changes

-   @comet/admin@7.25.0
-   @comet/admin-icons@7.25.0

## 7.24.0

### Patch Changes

-   751616321: Fix sticky behavior of `RteToolbar`
-   Updated dependencies [fc900f217]
    -   @comet/admin@7.24.0
    -   @comet/admin-icons@7.24.0

## 7.23.0

### Patch Changes

-   @comet/admin@7.23.0
-   @comet/admin-icons@7.23.0

## 7.22.0

### Patch Changes

-   Updated dependencies [2cf573b72]
-   Updated dependencies [086774f01]
    -   @comet/admin@7.22.0
    -   @comet/admin-icons@7.22.0

## 7.21.1

### Patch Changes

-   Updated dependencies [b771bd6d8]
    -   @comet/admin@7.21.1
    -   @comet/admin-icons@7.21.1

## 7.21.0

### Patch Changes

-   Updated dependencies [1a30eb858]
-   Updated dependencies [3e9ea613e]
    -   @comet/admin@7.21.0
    -   @comet/admin-icons@7.21.0

## 7.20.0

### Patch Changes

-   Updated dependencies [415a83165]
-   Updated dependencies [99f904f81]
-   Updated dependencies [2d1726543]
    -   @comet/admin@7.20.0
    -   @comet/admin-icons@7.20.0

## 7.19.0

### Patch Changes

-   17b79b581: Undeprecate `category` option in `createCompositeBlock`
-   Updated dependencies [3544127ad]
    -   @comet/admin@7.19.0
    -   @comet/admin-icons@7.19.0

## 7.18.0

### Patch Changes

-   f496734f8: Prevent the content of `AdminComponentRoot` from being cut off at the top when not rendered inside tabs
    -   @comet/admin@7.18.0
    -   @comet/admin-icons@7.18.0

## 7.17.0

### Patch Changes

-   @comet/admin@7.17.0
-   @comet/admin-icons@7.17.0

## 7.16.0

### Minor Changes

-   ed9282b3b: createOneOfBlock: Add support for dynamic display names of child blocks

### Patch Changes

-   9bd499dcd: Remove incorrect clear button from type select in `createOneOfBlock`
-   Updated dependencies [ec1cf3cf8]
-   Updated dependencies [bf7b89ffc]
    -   @comet/admin@7.16.0
    -   @comet/admin-icons@7.16.0

## 7.15.0

### Patch Changes

-   e056e8f3d: Change "Add column" button label in `createColumnsBlock` to "Add item"
-   Updated dependencies [a189d4ed9]
-   Updated dependencies [faa54eb8e]
-   Updated dependencies [7d8c36e6c]
-   Updated dependencies [a189d4ed9]
-   Updated dependencies [6827982fe]
    -   @comet/admin@7.15.0
    -   @comet/admin-icons@7.15.0

## 7.14.0

### Minor Changes

-   948e07bba: Add an `override` argument to all block factories to follow `createCompositeBlock`'s pattern
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

-   Updated dependencies [6b75f20e4]
    -   @comet/admin@7.14.0
    -   @comet/admin-icons@7.14.0

## 7.13.0

### Patch Changes

-   bd562d325: Prevent router prompt when using a block with subroutes in a form
-   Updated dependencies [bd562d325]
-   Updated dependencies [5c06e4bee]
-   Updated dependencies [b918c810b]
    -   @comet/admin@7.13.0
    -   @comet/admin-icons@7.13.0

## 7.12.0

### Minor Changes

-   86479e770: Simplify setting field props when using `createCompositeBlockTextField` or `createCompositeBlockSelectField`

    The props can now be set directly without nesting them inside the `fieldProps` object.

    ```diff
     block: createCompositeBlockTextField({
    -    fieldProps: {
             label: "Title",
             fullWidth: true,
    -    },
     }),
    ```

-   af350d086: Add `createCompositeBlockSwitchField` helper function

    To simplify the creation of a switch field block by hiding the verbose definition of `Form`, `Field` and items.

-   86479e770: Support `disabled` in select options when using `createCompositeBlockSelectField`

### Patch Changes

-   5583c9cff: Allow passing a function as child to `BlocksFinalForm`
-   Updated dependencies [af51bb408]
-   Updated dependencies [92b3255d2]
-   Updated dependencies [954635630]
-   Updated dependencies [e8003f9c7]
-   Updated dependencies [4f6e6b011]
-   Updated dependencies [5583c9cff]
-   Updated dependencies [7da81fa2e]
-   Updated dependencies [3ddc2278b]
-   Updated dependencies [0bb181a52]
    -   @comet/admin@7.12.0
    -   @comet/admin-icons@7.12.0

## 7.11.0

### Patch Changes

-   Updated dependencies [b8b8e2747]
-   Updated dependencies [1e01cca21]
-   Updated dependencies [a30f0ee4d]
-   Updated dependencies [20f63417e]
-   Updated dependencies [e9f547d95]
-   Updated dependencies [8114a6ae7]
    -   @comet/admin@7.11.0
    -   @comet/admin-icons@7.11.0

## 7.10.0

### Patch Changes

-   Updated dependencies [8f924d591]
-   Updated dependencies [aa02ca13f]
-   Updated dependencies [6eba5abea]
-   Updated dependencies [6eba5abea]
-   Updated dependencies [bf6b03fe0]
-   Updated dependencies [589b0b9ee]
    -   @comet/admin@7.10.0
    -   @comet/admin-icons@7.10.0

## 7.9.0

### Minor Changes

-   92f9d078f: Add `hiddenForState` option to `createCompositeBlock`

    This function can be used to hide a block in the `AdminComponent` for a given state.

    **Example**

    ```tsx
    const TextWithMediaVariantBlock = createCompositeBlock({
        name: "TextWithMediaVariant",
        blocks: {
            variant: {
                block: createCompositeBlockSelectField<string>({
                    defaultValue: "text-image",
                    fieldProps: { label: "Variant", fullWidth: true },
                    options: [
                        { value: "text-image", label: "Text Image" },
                        { value: "text-only", label: "Text Only" },
                    ],
                }),
            },
            text: {
                block: RichTextBlock,
            },
            media: {
                block: MediaBlock,
                // The media block isn't needed for the "text-only" variant
                hiddenForState: (state) => state.variant === "text-only",
            },
        },
    });
    ```

-   047b9d17b: Add `label` prop to `ColumnsLayoutPreview`

    Use it to customize the label of the column displayed in the `FinalFormLayoutSelect`.
    For instance, to add an icon or add custom text:

    ```tsx
    <ColumnsLayoutPreviewContent width={10} label={<Image />} />
    ```

-   59b4b6f77: Add `visibleOrderedBlocksForState` option to `createCompositeBlock`

    The option can be used to hide and order child blocks in the `AdminComponent`.
    It should return an array of visible block keys for a given state.
    The order of the keys define the order in which the blocks will be rendered.
    If key is not present in the array, the block will not be rendered.

    **Example**

    ```tsx
    const LayoutBlock = createCompositeBlock({
        /* ... */
        blocks: {
            layout: {
                /* A layout select */
            },
            headline1: { block: HeadlineBlock },
            image1: { block: DamImageBlock },
            headline2: { block: HeadlineBlock },
            image2: { block: DamImageBlock },
        },
        visibleOrderedBlocksForState: (state: LayoutBlockData) => {
            if (state.layout === "compact") {
                // headline2 and image2 will be hidden
                return ["headline1", "image1"];
            } else {
                return ["headline1", "image1", "headline2", "image2"];
            }
        },
    });
    ```

### Patch Changes

-   Updated dependencies [6d6131b16]
-   Updated dependencies [7cea765fe]
-   Updated dependencies [48cac4dac]
-   Updated dependencies [0919e3ba6]
-   Updated dependencies [55d40ef08]
    -   @comet/admin@7.9.0
    -   @comet/admin-icons@7.9.0

## 7.8.0

### Minor Changes

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

-   4338a6c07: Make the space select required in the form when using `createSpaceBlock()`
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
-   Updated dependencies [daacf1ea6]
-   Updated dependencies [9cc75c141]
    -   @comet/admin@7.8.0
    -   @comet/admin-icons@7.8.0

## 7.7.0

### Patch Changes

-   8ffc90eb1: Set the select field in `OneOfBlock` to `required` based on the `allowEmpty` prop
-   a9d2e2e25: Fix linking from block preview to block admin for composite + list/blocks/columns block combinations

    Previously, the generated route was wrong if a composite contained multiple nested list, blocks or columns blocks.

    -   @comet/admin@7.7.0
    -   @comet/admin-icons@7.7.0

## 7.6.0

### Patch Changes

-   Updated dependencies [bc19fb18c]
-   Updated dependencies [37d71a89a]
-   Updated dependencies [cf2ee898f]
-   Updated dependencies [03afcd073]
-   Updated dependencies [00d7ddae1]
-   Updated dependencies [fe8909404]
    -   @comet/admin@7.6.0
    -   @comet/admin-icons@7.6.0

## 7.5.0

### Patch Changes

-   Updated dependencies [bb7c2de72]
-   Updated dependencies [9a6a64ef3]
-   Updated dependencies [c59a60023]
-   Updated dependencies [b5838209b]
-   Updated dependencies [c8f37fbd1]
-   Updated dependencies [4cea3e31b]
-   Updated dependencies [216d93a10]
    -   @comet/admin@7.5.0
    -   @comet/admin-icons@7.5.0

## 7.4.2

### Patch Changes

-   @comet/admin@7.4.2
-   @comet/admin-icons@7.4.2

## 7.4.1

### Patch Changes

-   @comet/admin@7.4.1
-   @comet/admin-icons@7.4.1

## 7.4.0

### Patch Changes

-   46f932299: Fix the top position of the rich text editor toolbar

    Previously, the rich text editor's toolbar would be moved too far down when used inside `AdminComponentRoot`, but not as a direct child.

-   Updated dependencies [22863c202]
-   Updated dependencies [cab7c427a]
-   Updated dependencies [48d1403d7]
-   Updated dependencies [1ca46e8da]
-   Updated dependencies [1ca46e8da]
-   Updated dependencies [bef162a60]
-   Updated dependencies [bc1ed880a]
-   Updated dependencies [3e013b05d]
    -   @comet/admin@7.4.0
    -   @comet/admin-icons@7.4.0

## 7.3.2

### Patch Changes

-   Updated dependencies [2286234e5]
    -   @comet/admin@7.3.2
    -   @comet/admin-icons@7.3.2

## 7.3.1

### Patch Changes

-   Updated dependencies [91bfda996]
    -   @comet/admin@7.3.1
    -   @comet/admin-icons@7.3.1

## 7.3.0

### Patch Changes

-   Updated dependencies [6a1310cf6]
-   Updated dependencies [5364ecb37]
-   Updated dependencies [a1f4c0dec]
-   Updated dependencies [2ab7b688e]
    -   @comet/admin@7.3.0
    -   @comet/admin-icons@7.3.0

## 7.2.1

### Patch Changes

-   @comet/admin@7.2.1
-   @comet/admin-icons@7.2.1

## 7.2.0

### Patch Changes

-   Updated dependencies [0fb8d9a26]
-   Updated dependencies [4b267f90d]
    -   @comet/admin@7.2.0
    -   @comet/admin-icons@7.2.0

## 7.1.0

### Minor Changes

-   1fe10e883: Add `maxVisibleBlocks` option to `createBlocksBlock`
-   e53f4ce06: OneOfBlock: Remove label for the type field

    The label was unnecessary and occasionally caused UI problems when having two labels next each other.

### Patch Changes

-   2253a1d00: createListBlock: Don't show the minimum visible blocks tooltip when the option isn't used
-   6be41b668: Fix color for visible icon button in `ListBlock` and `ColumnsBlock`
-   Updated dependencies [04844d39e]
-   Updated dependencies [dfc4a7fff]
-   Updated dependencies [b1bbd6a0c]
-   Updated dependencies [c0488eb84]
-   Updated dependencies [39ab15616]
-   Updated dependencies [c1ab2b340]
-   Updated dependencies [99a1f0ae6]
-   Updated dependencies [edf14d066]
-   Updated dependencies [2b68513be]
-   Updated dependencies [374f383ba]
-   Updated dependencies [c050f2242]
    -   @comet/admin@7.1.0
    -   @comet/admin-icons@7.1.0

## 7.0.0

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

-   92eae2ba9: Change the method of overriding the styling of Admin components

    -   Remove dependency on the legacy `@mui/styles` package in favor of `@mui/material/styles`.
    -   Add the ability to style components using [MUI's `sx` prop](https://mui.com/system/getting-started/the-sx-prop/).
    -   Add the ability to style individual elements (slots) of a component using the `slotProps` and `sx` props.
    -   The `# @comet/blocks-admin syntax in the theme's `styleOverrides` is no longer supported, see: https://mui.com/material-ui/migration/v5-style-changes/#migrate-theme-styleoverrides-to-emotion

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

### Patch Changes

-   Updated dependencies [05ce68ec0]
-   Updated dependencies [949356e84]
-   Updated dependencies [51a0861d8]
-   Updated dependencies [dc8bb6a99]
-   Updated dependencies [54f775497]
-   Updated dependencies [73140014f]
-   Updated dependencies [9a4530b06]
-   Updated dependencies [dc8bb6a99]
-   Updated dependencies [e3efdfcc3]
-   Updated dependencies [02d33e230]
-   Updated dependencies [a0bd09afa]
-   Updated dependencies [8cc51b368]
-   Updated dependencies [c46146cb3]
-   Updated dependencies [6054fdcab]
-   Updated dependencies [d0869ac82]
-   Updated dependencies [9a4530b06]
-   Updated dependencies [47ec528a4]
-   Updated dependencies [956111ab2]
-   Updated dependencies [19eaee4ca]
-   Updated dependencies [758c65656]
-   Updated dependencies [9a4530b06]
-   Updated dependencies [04ed68cc9]
-   Updated dependencies [61b2acfb2]
-   Updated dependencies [0263a45fa]
-   Updated dependencies [4ca4830f3]
-   Updated dependencies [3397ec1b6]
-   Updated dependencies [20b2bafd8]
-   Updated dependencies [51a0861d8]
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
-   Updated dependencies [119714999]
-   Updated dependencies [2a7bc765c]
-   Updated dependencies [d2e64d1ec]
-   Updated dependencies [241249bd4]
-   Updated dependencies [be4e6392d]
-   Updated dependencies [a53545438]
-   Updated dependencies [1a1d83156]
-   Updated dependencies [a2f278bbd]
-   Updated dependencies [66330e4e6]
-   Updated dependencies [b0249e3bc]
-   Updated dependencies [92eae2ba9]
    -   @comet/admin@7.0.0
    -   @comet/admin-icons@7.0.0

## 7.0.0-beta.6

### Patch Changes

-   Updated dependencies [119714999]
    -   @comet/admin@7.0.0-beta.6
    -   @comet/admin-icons@7.0.0-beta.6

## 7.0.0-beta.5

### Patch Changes

-   Updated dependencies [569ad0463]
    -   @comet/admin@7.0.0-beta.5
    -   @comet/admin-icons@7.0.0-beta.5

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

### Patch Changes

-   Updated dependencies [a0bd09afa]
-   Updated dependencies [170720b0c]
    -   @comet/admin@7.0.0-beta.4
    -   @comet/admin-icons@7.0.0-beta.4

## 7.0.0-beta.3

### Patch Changes

-   Updated dependencies [ce5eaede2]
    -   @comet/admin@7.0.0-beta.3
    -   @comet/admin-icons@7.0.0-beta.3

## 7.0.0-beta.2

### Patch Changes

-   Updated dependencies [2fc764e29]
    -   @comet/admin@7.0.0-beta.2
    -   @comet/admin-icons@7.0.0-beta.2

## 7.0.0-beta.1

### Patch Changes

-   @comet/admin@7.0.0-beta.1
-   @comet/admin-icons@7.0.0-beta.1

## 7.0.0-beta.0

### Major Changes

-   92eae2ba9: Change the method of overriding the styling of Admin components

    -   Remove dependency on the legacy `@mui/styles` package in favor of `@mui/material/styles`.
    -   Add the ability to style components using [MUI's `sx` prop](https://mui.com/system/getting-started/the-sx-prop/).
    -   Add the ability to style individual elements (slots) of a component using the `slotProps` and `sx` props.
    -   The `# @comet/blocks-admin syntax in the theme's `styleOverrides` is no longer supported, see: https://mui.com/material-ui/migration/v5-style-changes/#migrate-theme-styleoverrides-to-emotion

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

### Patch Changes

-   Updated dependencies [865f253d8]
-   Updated dependencies [05ce68ec0]
-   Updated dependencies [51a0861d8]
-   Updated dependencies [dc8bb6a99]
-   Updated dependencies [54f775497]
-   Updated dependencies [73140014f]
-   Updated dependencies [9a4530b06]
-   Updated dependencies [dc8bb6a99]
-   Updated dependencies [e3efdfcc3]
-   Updated dependencies [02d33e230]
-   Updated dependencies [6054fdcab]
-   Updated dependencies [d0869ac82]
-   Updated dependencies [9a4530b06]
-   Updated dependencies [47ec528a4]
-   Updated dependencies [956111ab2]
-   Updated dependencies [19eaee4ca]
-   Updated dependencies [758c65656]
-   Updated dependencies [9a4530b06]
-   Updated dependencies [04ed68cc9]
-   Updated dependencies [61b2acfb2]
-   Updated dependencies [0263a45fa]
-   Updated dependencies [4ca4830f3]
-   Updated dependencies [3397ec1b6]
-   Updated dependencies [20b2bafd8]
-   Updated dependencies [51a0861d8]
-   Updated dependencies [9c4b7c974]
-   Updated dependencies [b5753e612]
-   Updated dependencies [2a7bc765c]
-   Updated dependencies [774977311]
-   Updated dependencies [f8114cd39]
-   Updated dependencies [b87c3c292]
-   Updated dependencies [f06f4bea6]
-   Updated dependencies [2a7bc765c]
-   Updated dependencies [d2e64d1ec]
-   Updated dependencies [241249bd4]
-   Updated dependencies [be4e6392d]
-   Updated dependencies [a53545438]
-   Updated dependencies [1a1d83156]
-   Updated dependencies [a2f278bbd]
-   Updated dependencies [66330e4e6]
-   Updated dependencies [b0249e3bc]
-   Updated dependencies [92eae2ba9]
    -   @comet/admin@7.0.0-beta.0
    -   @comet/admin-icons@7.0.0-beta.0

## 6.17.1

### Patch Changes

-   @comet/admin@6.17.1
-   @comet/admin-icons@6.17.1

## 6.17.0

### Patch Changes

-   Updated dependencies [536e95c02]
-   Updated dependencies [7ecc30eba]
-   Updated dependencies [ec4685bf3]
    -   @comet/admin@6.17.0
    -   @comet/admin-icons@6.17.0

## 6.16.0

### Patch Changes

-   Updated dependencies [fb0fe2539]
-   Updated dependencies [747fe32cc]
    -   @comet/admin@6.16.0
    -   @comet/admin-icons@6.16.0

## 6.15.1

### Patch Changes

-   @comet/admin@6.15.1
-   @comet/admin-icons@6.15.1

## 6.15.0

### Patch Changes

-   ec7fb9ff2: Fix a validation error for default values in `YouTubeVideoBlock`
-   Updated dependencies [406027806]
-   Updated dependencies [0654f7bce]
    -   @comet/admin-icons@6.15.0
    -   @comet/admin@6.15.0

## 6.14.1

### Patch Changes

-   @comet/admin@6.14.1
-   @comet/admin-icons@6.14.1

## 6.14.0

### Patch Changes

-   Updated dependencies [2fc764e29]
-   Updated dependencies [efccc42a3]
-   Updated dependencies [012a768ee]
    -   @comet/admin@6.14.0
    -   @comet/admin-icons@6.14.0

## 6.13.0

### Patch Changes

-   Updated dependencies [5e25348bb]
-   Updated dependencies [796e83206]
    -   @comet/admin@6.13.0
    -   @comet/admin-icons@6.13.0

## 6.12.0

### Patch Changes

-   Updated dependencies [16ffa7be9]
    -   @comet/admin@6.12.0
    -   @comet/admin-icons@6.12.0

## 6.11.0

### Patch Changes

-   Updated dependencies [8e3dec523]
    -   @comet/admin@6.11.0
    -   @comet/admin-icons@6.11.0

## 6.10.0

### Patch Changes

-   Updated dependencies [a8a098a24]
-   Updated dependencies [d4a269e1e]
-   Updated dependencies [52130afba]
-   Updated dependencies [e938254bf]
    -   @comet/admin@6.10.0
    -   @comet/admin-icons@6.10.0

## 6.9.0

### Minor Changes

-   e85837a17: Loosen peer dependency on `react-intl` to allow using v6

### Patch Changes

-   Updated dependencies [9ff9d66c6]
-   Updated dependencies [e85837a17]
    -   @comet/admin@6.9.0
    -   @comet/admin-icons@6.9.0

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

-   @comet/admin@6.8.0
-   @comet/admin-icons@6.8.0

## 6.7.0

### Patch Changes

-   @comet/admin@6.7.0
-   @comet/admin-icons@6.7.0

## 6.6.2

### Patch Changes

-   @comet/admin@6.6.2
-   @comet/admin-icons@6.6.2

## 6.6.1

### Patch Changes

-   @comet/admin@6.6.1
-   @comet/admin-icons@6.6.1

## 6.6.0

### Minor Changes

-   a65679ba3: Add `minVisibleBlocks` option to `createListBlock` factory

    This enables the possibility to enforce a minimum amount of blocks added to a list block. List blocks with less than the required amount of visible entries can't be saved.

    **Example usage:**

    ```diff
    export const SomeListBlock = createListBlock({
        // ...
    +   minVisibleBlocks: 2,
    });
    ```

### Patch Changes

-   Updated dependencies [95b97d768]
-   Updated dependencies [6b04ac9a4]
    -   @comet/admin@6.6.0
    -   @comet/admin-icons@6.6.0

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

-   Updated dependencies [6cb2f9046]
    -   @comet/admin@6.5.0
    -   @comet/admin-icons@6.5.0

## 6.4.0

### Minor Changes

-   30d9e0dee: Add `createCompositeBlockSelectField` helper function

    To simplify the creation of a select field blocks by hiding the verbose definition of `Form`, `Field` and items.

-   322da3831: Add `resolveDependencyPath()` to `BlockMethods` interface

    Blocks must now offer a `resolveDependencyPath()` method that returns a URL path based on the block's `state` and `jsonPath`.
    It can be used to build the URL to a block's edit view.

    For most cases, the default implementation of this method should be sufficient, so you don't have to implement it yourself.
    You must only override it manually if your block's admin component contains special routing logic (e.g. `RouterTabs`).

-   887365c76: Add `createCompositeBlockTextField` helper function

    To simplify the creation of a text block field by hiding the verbose definition of `Form` and `Field`.

### Patch Changes

-   811903e60: Disable the content translation feature for input fields where it doesn't make sense
-   Updated dependencies [8ce21f34b]
-   Updated dependencies [811903e60]
    -   @comet/admin@6.4.0
    -   @comet/admin-icons@6.4.0

## 6.3.0

### Patch Changes

-   @comet/admin@6.3.0
-   @comet/admin-icons@6.3.0

## 6.2.1

### Patch Changes

-   @comet/admin@6.2.1
-   @comet/admin-icons@6.2.1

## 6.2.0

### Patch Changes

-   @comet/admin@6.2.0
-   @comet/admin-icons@6.2.0

## 6.1.0

### Patch Changes

-   Updated dependencies [dcfa03ca]
-   Updated dependencies [08e0da09]
-   Updated dependencies [b35bb8d1]
-   Updated dependencies [8eb13750]
-   Updated dependencies [a4fac913]
    -   @comet/admin@6.1.0
    -   @comet/admin-icons@6.1.0

## 6.0.0

### Patch Changes

-   Updated dependencies [921f6378]
-   Updated dependencies [76e50aa8]
-   Updated dependencies [298b63b7]
-   Updated dependencies [a525766c]
-   Updated dependencies [0d768540]
-   Updated dependencies [62779124]
    -   @comet/admin@6.0.0
    -   @comet/admin-icons@6.0.0

## 5.6.0

### Patch Changes

-   76f85abe: Fix linking from block preview to block admin for non-trivial composite/list block combinations
    -   @comet/admin@5.6.0
    -   @comet/admin-icons@5.6.0

## 5.5.0

### Patch Changes

-   @comet/admin@5.5.0
-   @comet/admin-icons@5.5.0

## 5.4.0

### Patch Changes

-   Updated dependencies [ba800163]
-   Updated dependencies [60a18392]
    -   @comet/admin@5.4.0
    -   @comet/admin-icons@5.4.0

## 5.3.0

### Minor Changes

-   a2273887: Add support for custom block categories

    Allows specifying custom block categories in application code.

    **Example:**

    In `src/common/blocks/customBlockCategories.tsx`:

    ```tsx
    import { BlockCategory, CustomBlockCategory } from "@comet/blocks-admin";
    import React from "react";
    import { FormattedMessage } from "react-intl";

    const productsBlockCategory: CustomBlockCategory = {
        id: "Products",
        label: <FormattedMessage id="blocks.category.products" defaultMessage="Products" />,
        // Specify where category will be shown in drawer
        insertBefore: BlockCategory.Teaser,
    };

    export { productsBlockCategory };
    ```

    In `src/documents/pages/blocks/MyBlock.tsx`:

    ```tsx
    import { productsBlockCategory } from "@src/common/blocks/customBlockCategories";

    const MyBlock: BlockInterface = {
        category: productsBlockCategory,
        ...
    };
    ```

### Patch Changes

-   Updated dependencies [0ff9b9ba]
-   Updated dependencies [0ff9b9ba]
-   Updated dependencies [a677a162]
-   Updated dependencies [60cc1b2a]
-   Updated dependencies [5435b278]
    -   @comet/admin-icons@5.3.0
    -   @comet/admin@5.3.0

## 5.2.0

### Minor Changes

-   824ea66a: Improve layout selection UX in `createColumnsBlock`

    Hide select when there's only one layout for a specific number of columns

### Patch Changes

-   3702bb23: Infer additional item fields in `BlocksBlock` and `ListBlock`

    Additional fields in the `item` prop of `AdditionalItemContextMenuItems` and `AdditionalItemContent` will be typed correctly if the `additionalItemFields` option is strongly typed.

-   Updated dependencies [25daac07]
-   Updated dependencies [0bed4e7c]
-   Updated dependencies [9fc7d474]
    -   @comet/admin@5.2.0
    -   @comet/admin-icons@5.2.0

## 5.1.0

### Patch Changes

-   Updated dependencies [21c30931]
-   Updated dependencies [93b3d971]
-   Updated dependencies [e33cd652]
    -   @comet/admin@5.1.0
    -   @comet/admin-icons@5.1.0

## 5.0.0

### Major Changes

-   9875e7d4: Support automatically importing DAM files into another scope when copying documents from one scope to another

    The copy process was reworked:

    -   The `DocumentInterface` now requires a `dependencies()` and a `replaceDependenciesInOutput()` method
    -   The `BlockInterface` now has an optional `dependencies()` and a required `replaceDependenciesInOutput()` method
    -   `rewriteInternalLinks()` was removed from `@comet/cms-admin`. Its functionality is replaced by `replaceDependenciesInOutput()`.

    `dependencies()` returns information about dependencies of a document or block (e.g. a used `DamFile` or linked `PageTreeNode`). `replaceDependenciesInOutput()` replaces the IDs of all dependencies of a document or block with new IDs (necessary for copying documents or blocks to another scope).

    You can use the new `createDocumentRootBlocksMethods()` to generate the methods for documents (see section @comet/cms-admin).

-   4fe08312: Remove `BlockPreview` component, use higher level `BlockPreviewContent` instead

    **Before:**

    ```tsx
    const state = linkBlock.input2State(params.value);

    return <BlockPreview title={linkBlock.dynamicDisplayName?.(state) ?? linkBlock.displayName} content={linkBlock.previewContent(state)} />;
    ```

    **After:**

    ```tsx
    return <BlockPreviewContent block={linkBlock} input={params.value} />;
    ```

### Minor Changes

-   a7116784: Allow composite blocks with multiple sub blocks that have their own subroutes (e.g. a list)

### Patch Changes

-   Updated dependencies [0453c36a]
-   Updated dependencies [692c8555]
-   Updated dependencies [2559ff74]
-   Updated dependencies [fe5e0735]
-   Updated dependencies [ed692f50]
-   Updated dependencies [987f08b3]
-   Updated dependencies [d0773a1a]
-   Updated dependencies [5f0f8e6e]
-   Updated dependencies [7c6eb68e]
-   Updated dependencies [d4bcab04]
-   Updated dependencies [0f2794e7]
-   Updated dependencies [80b007ae]
-   Updated dependencies [a7116784]
-   Updated dependencies [e57c6c66]
    -   @comet/admin@5.0.0
    -   @comet/admin-icons@5.0.0

## 4.7.0

### Patch Changes

-   f48a768c: Fix padding behavior of `YoutubeVideoBlock` and `DamVideoBlock` when used inside `AdminComponentPaper`
-   Updated dependencies [dbdc0f55]
-   Updated dependencies [eac9990b]
-   Updated dependencies [fe310df8]
-   Updated dependencies [fde8e42b]
    -   @comet/admin-icons@4.7.0
    -   @comet/admin@4.7.0

## 4.6.0

### Patch Changes

-   031d86eb: Fix drag and drop reordering in collection blocks
-   Updated dependencies [c3b7f992]
-   Updated dependencies [c3b7f992]
    -   @comet/admin-icons@4.6.0
    -   @comet/admin@4.6.0

## 4.5.0

### Patch Changes

-   Updated dependencies [46cf5a8b]
-   Updated dependencies [8a2c3302]
-   Updated dependencies [6d4ca5bf]
-   Updated dependencies [07d921d2]
    -   @comet/admin@4.5.0
    -   @comet/admin-icons@4.5.0

## 4.4.3

### Patch Changes

-   @comet/admin@4.4.3
-   @comet/admin-icons@4.4.3

## 4.4.2

### Patch Changes

-   @comet/admin@4.4.2
-   @comet/admin-icons@4.4.2

## 4.4.1

### Patch Changes

-   Updated dependencies [662abcc9]
    -   @comet/admin@4.4.1
    -   @comet/admin-icons@4.4.1

## 4.4.0

### Minor Changes

-   d4960b05: Add loop toggle to YouTubeVideo block

### Patch Changes

-   Updated dependencies [e824ffa6]
-   Updated dependencies [3e15b819]
-   Updated dependencies [a77da844]
    -   @comet/admin@4.4.0
    -   @comet/admin-icons@4.4.0

## 4.3.0

### Patch Changes

-   @comet/admin@4.3.0
-   @comet/admin-icons@4.3.0

## 4.2.0

### Patch Changes

-   b4d564b6: Add spacing by default between the tabs and the tab content when using `AdminTabs` or `BlockPreviewWithTabs`. This may add unwanted additional spacing in cases where the spacing was added manually.
-   0f4ed6c1: Prevent unintentional movement of sticky header when scrolling in Tabs.
-   Updated dependencies [67e54a82]
-   Updated dependencies [3567533e]
-   Updated dependencies [7b614c13]
-   Updated dependencies [aaf1586c]
-   Updated dependencies [d25a7cbb]
    -   @comet/admin@4.2.0
    -   @comet/admin-icons@4.2.0

## 4.1.0

### Patch Changes

-   Updated dependencies [51466b1a]
-   Updated dependencies [51466b1a]
-   Updated dependencies [51466b1a]
-   Updated dependencies [51466b1a]
-   Updated dependencies [51466b1a]
-   Updated dependencies [51466b1a]
-   Updated dependencies [c5f2f918]
    -   @comet/admin@4.1.0
    -   @comet/admin-icons@4.1.0
