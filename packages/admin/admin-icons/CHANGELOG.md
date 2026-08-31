# @comet/admin-icons

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

## 7.13.0

## 7.12.0

## 7.11.0

## 7.10.0

## 7.9.0

### Minor Changes

-   7cea765fe: Add UI for Impersonation Feature

    -   Add indicator to display when impersonation mode is active in `UserHeaderItem`
    -   Add button to allow users to switch on impersonation in the `UserGrid`
    -   Integrate `CrudMoreActionsMenu` in `UserPageToolbar` with an impersonation entry for easy access to this feature.
    -   Add `ImpersonateUser` icon

### Patch Changes

-   55d40ef08: Add icon for indeterminate checkbox

## 7.8.0

### Minor Changes

-   e78315c9c: Add `ContactPage` icon
-   c6d3ac36b: Add new icons `Backward` and `Forward`

## 7.7.0

## 7.6.0

## 7.5.0

## 7.4.2

## 7.4.1

## 7.4.0

## 7.3.2

## 7.3.1

## 7.3.0

### Minor Changes

-   5364ecb37: Add new "DragIndicator" icon
-   2ab7b688e: Add `Api` icon

### Patch Changes

-   a1f4c0dec: Replace `YouTube` and `Vimeo` icon with correctly colored versions

## 7.2.1

## 7.2.0

## 7.1.0

### Minor Changes

-   b1bbd6a0c: Export a type for all icon names: `IconName`

## 7.0.0

## 7.0.0-beta.6

## 7.0.0-beta.5

## 7.0.0-beta.4

## 7.0.0-beta.3

## 7.0.0-beta.2

## 7.0.0-beta.1

## 7.0.0-beta.0

## 6.17.1

## 6.17.0

## 6.16.0

## 6.15.1

## 6.15.0

### Minor Changes

-   406027806: Add `RteUppercase` icon

## 6.14.1

## 6.14.0

### Minor Changes

-   efccc42a3: Add `YouTube` and `Vimeo` icons

## 6.13.0

## 6.12.0

## 6.11.0

## 6.10.0

## 6.9.0

## 6.8.0

## 6.7.0

## 6.6.2

## 6.6.1

## 6.6.0

## 6.5.0

## 6.4.0

## 6.3.0

## 6.2.1

## 6.2.0

## 6.1.0

### Patch Changes

-   08e0da09: Fix icons inside tooltips by forwarding the ref

## 6.0.0

### Major Changes

-   a525766c: Remove deprecated icons `Betrieb`, `Logische Filter`, `Pool`, `Pool 2`, `State Green`, `State Green Ring`, `State Orange`, `State Orange Ring`, `State Red`, `State Red Ring`, `Vignette 1` and `Vignette 2`.

### Patch Changes

-   76e50aa8: Fix broken `Logout` icon

## 5.6.0

## 5.5.0

## 5.4.0

## 5.3.0

### Minor Changes

-   0ff9b9ba: Deprecate icons `StateGreen`, `StateGreenRing`, `StateOrange`, `StateOrangeRing`, `StateRed`, and `StateRedRing`,

### Patch Changes

-   0ff9b9ba: Fix various icons

    Since version 5.2.0 several icons were not displayed correctly. This problem has been fixed.

## 5.2.0

### Minor Changes

-   9fc7d474: Add new icons from the Comet UX library. Replace existing icons with new versions. Mark icons Pool, Pool2, Vignette1, Vignette2, Betrieb, LogischeFilter as deprecated.

## 5.1.0

## 5.0.0

### Minor Changes

-   ed692f50: Add new open and close hamburger icons and use them in the `AppHeaderMenuButton`

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

## 4.6.0

### Minor Changes

-   c3b7f992: Add new icons intended to be used in the RTE
-   c3b7f992: Change how `maxVisible` in `FeaturesButtonGroup` works:

    -   If maxVisible = 4 and there are four features -> all four features (and no dropdown) are shown
    -   If maxVisible = 4 and there are five features -> three features and the dropdown (containing two features) are shown

## 4.5.0

## 4.4.3

## 4.4.2

## 4.4.1

## 4.4.0

## 4.3.0

## 4.2.0

## 4.1.0

### Minor Changes

-   51466b1a: Add `QuestionMark` and `Block` icon
