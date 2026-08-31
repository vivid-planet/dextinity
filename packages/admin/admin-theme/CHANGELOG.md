# @comet/admin-theme

## 7.26.1

### Patch Changes

-   @comet/admin-icons@7.26.1

## 7.26.0

### Patch Changes

-   @comet/admin-icons@7.26.0

## 7.25.15

### Patch Changes

-   @comet/admin-icons@7.25.15

## 7.25.14

### Patch Changes

-   @comet/admin-icons@7.25.14

## 7.25.13

### Patch Changes

-   @comet/admin-icons@7.25.13

## 7.25.12

### Patch Changes

-   @comet/admin-icons@7.25.12

## 7.25.11

### Patch Changes

-   @comet/admin-icons@7.25.11

## 7.25.10

### Patch Changes

-   @comet/admin-icons@7.25.10

## 7.25.9

### Patch Changes

-   @comet/admin-icons@7.25.9

## 7.25.8

### Patch Changes

-   @comet/admin-icons@7.25.8

## 7.25.7

### Patch Changes

-   @comet/admin-icons@7.25.7

## 7.25.6

### Patch Changes

-   @comet/admin-icons@7.25.6

## 7.25.5

### Patch Changes

-   @comet/admin-icons@7.25.5

## 7.25.4

### Patch Changes

-   @comet/admin-icons@7.25.4

## 7.25.3

### Patch Changes

-   @comet/admin-icons@7.25.3

## 7.25.2

### Patch Changes

-   @comet/admin-icons@7.25.2

## 7.25.1

### Patch Changes

-   @comet/admin-icons@7.25.1

## 7.25.0

### Patch Changes

-   @comet/admin-icons@7.25.0

## 7.24.0

### Patch Changes

-   24e046fb3: Data Grid: Fix styling of filter input fields
    -   @comet/admin-icons@7.24.0

## 7.23.0

### Patch Changes

-   @comet/admin-icons@7.23.0

## 7.22.0

### Patch Changes

-   @comet/admin-icons@7.22.0

## 7.21.1

### Patch Changes

-   @comet/admin-icons@7.21.1

## 7.21.0

### Patch Changes

-   @comet/admin-icons@7.21.0

## 7.20.0

### Patch Changes

-   @comet/admin-icons@7.20.0

## 7.19.0

### Patch Changes

-   @comet/admin-icons@7.19.0

## 7.18.0

### Patch Changes

-   @comet/admin-icons@7.18.0

## 7.17.0

### Patch Changes

-   @comet/admin-icons@7.17.0

## 7.16.0

### Patch Changes

-   ec1cf3cf8: Adapt styling of `Button` variants to align with Comet DXP design
    -   @comet/admin-icons@7.16.0

## 7.15.0

### Minor Changes

-   7d8c36e6c: Improve the styling of the filter and columns panels of `DataGrid`

### Patch Changes

-   @comet/admin-icons@7.15.0

## 7.14.0

### Patch Changes

-   9b190db59: Fix spacing for `ListItemIcon` and `ListItemAvatar` to align with Comet DXP design
-   84e063642: Fix dialog header height for dialogs with no title
    -   @comet/admin-icons@7.14.0

## 7.13.0

### Patch Changes

-   @comet/admin-icons@7.13.0

## 7.12.0

### Minor Changes

-   ee597535a: Add styling of `Card` and `CardHeader` to align with Comet DXP design

### Patch Changes

-   47be4ebd3: Adapt styling of `DialogActions`, `DialogContent`, and `DialogTitle` to match the Comet DXP design
-   af51bb408: Prevent the input value of `GridToolbarQuickFilter` from being truncated too early
    -   @comet/admin-icons@7.12.0

## 7.11.0

### Minor Changes

-   a4fcdeb51: Enable vertical resizing for `TextAreaField` and other multiline inputs
-   5ba64aab6: Add support and styling for full screen dialogs using the `fullScreen` prop

    ```tsx
    <Dialog open fullScreen>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogContent>Dialog content</DialogContent>
    </Dialog>
    ```

### Patch Changes

-   9f2a1272b: Fix an issue where setting `defaultProps` of `MuiDataGrid` would override the `defaultProps` defined by `createCometTheme()`
-   a30f0ee4d: Fix `border-color` of `InputBase` on default and hover state
    -   @comet/admin-icons@7.11.0

## 7.10.0

### Minor Changes

-   7e94c55f6: Rework `GridFilterPanel` to match the updated Comet CI
-   22f3d402e: Adapt `Chip` styling to align with Comet DXP design

    -   Fix hover styling
    -   Add new styling for `<Chip variant="filled" color="info">`

-   589b0b9ee: Enhance `FieldContainer` with `secondaryHelperText` prop and `helperTextIcon` prop

    -   `helperTextIcon` displays an icon alongside the text for `helperText`, `error` or `warning`.
    -   `secondaryHelperText` provides an additional helper text positioned beneath the input field, aligned to the bottom-right corner.

    **Example:**

    ```tsx
    <FieldContainer label="Helper Text Icon" helperTextIcon={<Info />} helperText="Helper Text with icon" secondaryHelperText="0/100">
        <InputBase onChange={handleChange} value={value} placeholder="Placeholder" />
    </FieldContainer>
    ```

### Patch Changes

-   b51bf6d85: Adapt `Radio` and `Checkbox` styling to Comet DXP design

    Fix colors of disabled states.

-   71876ea69: Adapt size of arrow in `Select` and `Autocomplete` fields according to Comet DXP design
    -   @comet/admin-icons@7.10.0

## 7.9.0

### Minor Changes

-   9aa6947b7: Add hover styling for MUI's `Switch`

### Patch Changes

-   48cac4dac: Fix styling issues of inputs like `FinalFormInput`, `FinalFormNumberInput`, `FinalFormSelect`, `TextAreaField`

    -   Change background-color, border-color and color of the label for different states (`default`, `disabled` and `focused`).
    -   For required inputs, fix spacing between the label and asterisk.
    -   Fix font-weight and margin of `helperText`.

-   55d40ef08: Add icon for indeterminate checkbox
-   Updated dependencies [7cea765fe]
-   Updated dependencies [55d40ef08]
    -   @comet/admin-icons@7.9.0

## 7.8.0

### Patch Changes

-   Updated dependencies [e78315c9c]
-   Updated dependencies [c6d3ac36b]
    -   @comet/admin-icons@7.8.0

## 7.7.0

### Patch Changes

-   @comet/admin-icons@7.7.0

## 7.6.0

### Patch Changes

-   @comet/admin-icons@7.6.0

## 7.5.0

### Patch Changes

-   @comet/admin-icons@7.5.0

## 7.4.2

### Patch Changes

-   @comet/admin-icons@7.4.2

## 7.4.1

### Patch Changes

-   @comet/admin-icons@7.4.1

## 7.4.0

### Patch Changes

-   @comet/admin-icons@7.4.0

## 7.3.2

### Patch Changes

-   @comet/admin-icons@7.3.2

## 7.3.1

### Patch Changes

-   @comet/admin-icons@7.3.1

## 7.3.0

### Patch Changes

-   Updated dependencies [5364ecb37]
-   Updated dependencies [a1f4c0dec]
-   Updated dependencies [2ab7b688e]
    -   @comet/admin-icons@7.3.0

## 7.2.1

### Patch Changes

-   @comet/admin-icons@7.2.1

## 7.2.0

### Minor Changes

-   9b800c9f6: Slightly adjust the styling of pinned columns in DataGrid

### Patch Changes

-   @comet/admin-icons@7.2.0

## 7.1.0

### Minor Changes

-   04844d39e: Adjust the alignment and spacing of the label, the input, and child fields inside `FieldContainer` and `Field`

### Patch Changes

-   3adf5fecd: Remove unnecessary padding of DataGrid rows
-   c90ae39d4: Fix spacing between page number and chevron icon in the pagination select of `DataGrid`
-   Updated dependencies [b1bbd6a0c]
    -   @comet/admin-icons@7.1.0

## 7.0.0

### Major Changes

-   803bc607f: Rework theme of MUI's `Chip` to match the updated Comet CI
-   33ba50719: Rework `typographyOptions`

    -   Replace `typographyOptions` with `createTypographyOptions()` to enable using the theme's breakpoints for media queries
    -   Add new default styles for variants `subtitle1`, `subtitle2`, `caption` and `overline`
    -   Remove custom `fontWeights`
    -   Switch the font from `Roboto` to `Roboto Flex`

    The font switch requires you to make the following two changes in your admin application:

    **Note: The `@comet/upgrade` script handles these changes automatically.**

    ```diff
    // package.json
    - "@fontsource/roboto": "^4.5.5",
    + "@fontsource-variable/roboto-flex": "^5.0.0",
    ```

    ```diff
    // App.tsx
    - import "@fontsource/roboto/100.css";
    - import "@fontsource/roboto/300.css";
    - import "@fontsource/roboto/400.css";
    - import "@fontsource/roboto/500.css";
    + import "@fontsource-variable/roboto-flex/full.css";
    ```

-   33ba50719: Rework colors

    -   Rename `bluePalette` to `primaryPalette`
    -   Rename `neutrals` to `greyPalette`
    -   Remove `greenPalette`
    -   Change colors in all palettes
    -   Change `text` colors
    -   Add `highlight` colors `purple`, `green`, `orange`, `yellow` and `red` to palette

    Hint: To use the `highlight` colors without getting a type error, you must adjust the `vendors.d.ts` in your project:

    ```diff
    + /// <reference types="@comet/admin-theme" />

    // ...
    ```

-   33ba50719: Change `Link` text styling
-   cce88d448: Adapt `Typography` headlines for mobile devices (<900px)
-   92eae2ba9: Change the method of overriding the styling of Admin components

    -   Remove dependency on the legacy `@mui/styles` package in favor of `@mui/material/styles`.
    -   Add the ability to style components using [MUI's `sx` prop](https://mui.com/system/getting-started/the-sx-prop/).
    -   Add the ability to style individual elements (slots) of a component using the `slotProps` and `sx` props.
    -   The `# @comet/admin-theme syntax in the theme's `styleOverrides` is no longer supported, see: https://mui.com/material-ui/migration/v5-style-changes/#migrate-theme-styleoverrides-to-emotion

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

-   33ba50719: Rework shadows

    -   Change shadows 1 - 4

### Minor Changes

-   c702cc5b2: Override the default theme of `Badge`

    If no children are passed, the Badge renders as is without position relative and absolute.

-   535444623: Slightly increase the default size of dialogs
-   f9615fbf4: Adapt styling of filter panel in `DataGrid` for mobile devices (<900px)
-   33ba50719: Add `breakpointsOptions` to theme
-   865f253d8: Add custom `Typography` variants for displaying inline lists

    ```tsx
    <Typography variant="list">
        <Typography variant="listItem">Lorem ipsum</Typography>
        <Typography variant="listItem">Lorem ipsum</Typography>
        <Typography variant="listItem">Lorem ipsum</Typography>
    </Typography>
    ```

    Hint: To use the custom variants without getting a type error, you must adjust the `vendors.d.ts` in your project:

    ```diff
    + /// <reference types="@comet/admin-theme" />

    // ...
    ```

### Patch Changes

-   @comet/admin-icons@7.0.0

## 7.0.0-beta.6

### Patch Changes

-   @comet/admin-icons@7.0.0-beta.6

## 7.0.0-beta.5

### Patch Changes

-   @comet/admin-icons@7.0.0-beta.5

## 7.0.0-beta.4

### Patch Changes

-   @comet/admin-icons@7.0.0-beta.4

## 7.0.0-beta.3

### Patch Changes

-   @comet/admin-icons@7.0.0-beta.3

## 7.0.0-beta.2

### Patch Changes

-   2de81e40b: Fix top position of end-adornment in MuiAutocomplete
    -   @comet/admin-icons@7.0.0-beta.2

## 7.0.0-beta.1

### Patch Changes

-   @comet/admin-icons@7.0.0-beta.1

## 7.0.0-beta.0

### Major Changes

-   803bc607f: Rework theme of MUI's `Chip` to match the updated Comet CI
-   33ba50719: Rework `typographyOptions`

    -   Replace `typographyOptions` with `createTypographyOptions()` to enable using the theme's breakpoints for media queries
    -   Add new default styles for variants `subtitle1`, `subtitle2`, `caption` and `overline`
    -   Remove custom `fontWeights`
    -   Switch the font from `Roboto` to `Roboto Flex`

    The font switch requires you to make the following two changes in your admin application:

    **Note: The `@comet/upgrade` script handles these changes automatically.**

    ```diff
    // package.json
    - "@fontsource/roboto": "^4.5.5",
    + "@fontsource-variable/roboto-flex": "^5.0.0",
    ```

    ```diff
    // App.tsx
    - import "@fontsource/roboto/100.css";
    - import "@fontsource/roboto/300.css";
    - import "@fontsource/roboto/400.css";
    - import "@fontsource/roboto/500.css";
    + import "@fontsource-variable/roboto-flex/full.css";
    ```

-   33ba50719: Rework colors

    -   Rename `bluePalette` to `primaryPalette`
    -   Rename `neutrals` to `greyPalette`
    -   Remove `greenPalette`
    -   Change colors in all palettes
    -   Change `text` colors
    -   Add `highlight` colors `purple`, `green`, `orange`, `yellow` and `red` to palette

    Hint: To use the `highlight` colors without getting a type error, you must adjust the `vendors.d.ts` in your project:

    ```diff
    + /// <reference types="@comet/admin-theme" />

    // ...
    ```

-   33ba50719: Change `Link` text styling
-   cce88d448: Adapt `Typography` headlines for mobile devices (<900px)
-   92eae2ba9: Change the method of overriding the styling of Admin components

    -   Remove dependency on the legacy `@mui/styles` package in favor of `@mui/material/styles`.
    -   Add the ability to style components using [MUI's `sx` prop](https://mui.com/system/getting-started/the-sx-prop/).
    -   Add the ability to style individual elements (slots) of a component using the `slotProps` and `sx` props.
    -   The `# @comet/admin-theme syntax in the theme's `styleOverrides` is no longer supported, see: https://mui.com/material-ui/migration/v5-style-changes/#migrate-theme-styleoverrides-to-emotion

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

-   33ba50719: Rework shadows

    -   Change shadows 1 - 4

### Minor Changes

-   c702cc5b2: Override the default theme of `Badge`

    If no children are passed, the Badge renders as is without position relative and absolute.

-   535444623: Slightly increase the default size of dialogs
-   f9615fbf4: Adapt styling of filter panel in `DataGrid` for mobile devices (<900px)
-   33ba50719: Add `breakpointsOptions` to theme
-   865f253d8: Add custom `Typography` variants for displaying inline lists

    ```tsx
    <Typography variant="list">
        <Typography variant="listItem">Lorem ipsum</Typography>
        <Typography variant="listItem">Lorem ipsum</Typography>
        <Typography variant="listItem">Lorem ipsum</Typography>
    </Typography>
    ```

    Hint: To use the custom variants without getting a type error, you must adjust the `vendors.d.ts` in your project:

    ```diff
    + /// <reference types="@comet/admin-theme" />

    // ...
    ```

### Patch Changes

-   @comet/admin-icons@7.0.0-beta.0

## 6.17.1

### Patch Changes

-   @comet/admin-icons@6.17.1

## 6.17.0

### Patch Changes

-   @comet/admin-icons@6.17.0

## 6.16.0

### Patch Changes

-   @comet/admin-icons@6.16.0

## 6.15.1

### Patch Changes

-   @comet/admin-icons@6.15.1

## 6.15.0

### Patch Changes

-   Updated dependencies [406027806]
    -   @comet/admin-icons@6.15.0

## 6.14.1

### Patch Changes

-   @comet/admin-icons@6.14.1

## 6.14.0

### Patch Changes

-   2de81e40b: Fix top position of end-adornment in MuiAutocomplete
-   Updated dependencies [efccc42a3]
    -   @comet/admin-icons@6.14.0

## 6.13.0

### Patch Changes

-   @comet/admin-icons@6.13.0

## 6.12.0

### Minor Changes

-   c06c6f1e9: Allow to pass args to createCometTheme to support localization via theme

    See https://mui.com/material-ui/guides/localization/

    ```tsx
    import { deDE } from "@mui/x-data-grid-pro";

    const theme = createCometTheme({}, deDE);

    <MuiThemeProvider theme={theme} />;
    ```

### Patch Changes

-   @comet/admin-icons@6.12.0

## 6.11.0

### Patch Changes

-   @comet/admin-icons@6.11.0

## 6.10.0

### Patch Changes

-   @comet/admin-icons@6.10.0

## 6.9.0

### Patch Changes

-   @comet/admin-icons@6.9.0

## 6.8.0

### Patch Changes

-   @comet/admin-icons@6.8.0

## 6.7.0

### Patch Changes

-   @comet/admin-icons@6.7.0

## 6.6.2

### Patch Changes

-   @comet/admin-icons@6.6.2

## 6.6.1

### Patch Changes

-   @comet/admin-icons@6.6.1

## 6.6.0

### Patch Changes

-   @comet/admin-icons@6.6.0

## 6.5.0

### Patch Changes

-   @comet/admin-icons@6.5.0

## 6.4.0

### Patch Changes

-   @comet/admin-icons@6.4.0

## 6.3.0

### Patch Changes

-   @comet/admin-icons@6.3.0

## 6.2.1

### Patch Changes

-   @comet/admin-icons@6.2.1

## 6.2.0

### Patch Changes

-   @comet/admin-icons@6.2.0

## 6.1.0

### Minor Changes

-   a4fac913: Rework `Alert` component

    -   Use theme wherever possible
    -   Move styles where they're more fitting
    -   Fix some paddings

### Patch Changes

-   Updated dependencies [08e0da09]
    -   @comet/admin-icons@6.1.0

## 6.0.0

### Patch Changes

-   Updated dependencies [76e50aa8]
-   Updated dependencies [a525766c]
    -   @comet/admin-icons@6.0.0

## 5.6.0

### Minor Changes

-   fb6c8063: Change `DataGrid`'s `noRowsLabel` from "No rows" to "No results found."

### Patch Changes

-   @comet/admin-icons@5.6.0

## 5.5.0

### Patch Changes

-   @comet/admin-icons@5.5.0

## 5.4.0

### Patch Changes

-   @comet/admin-icons@5.4.0

## 5.3.0

### Patch Changes

-   Updated dependencies [0ff9b9ba]
-   Updated dependencies [0ff9b9ba]
    -   @comet/admin-icons@5.3.0

## 5.2.0

### Patch Changes

-   Updated dependencies [9fc7d474]
    -   @comet/admin-icons@5.2.0

## 5.1.0

### Patch Changes

-   @comet/admin-icons@5.1.0

## 5.0.0

### Patch Changes

-   Updated dependencies [ed692f50]
    -   @comet/admin-icons@5.0.0

## 4.7.0

### Minor Changes

-   d1c7a1c5: Add custom default styling for LinearProgress

    The LinearProgress is intended to be used as a LoadingOverlay in the DataGrid. This styling change adjusts it for this purpose.

### Patch Changes

-   fe310df8: Prevent the clear-button and the select-arrow from overlapping when using `FinalFormSelect` with the `clearable` prop.
-   Updated dependencies [dbdc0f55]
    -   @comet/admin-icons@4.7.0

## 4.6.0

### Patch Changes

-   Updated dependencies [c3b7f992]
-   Updated dependencies [c3b7f992]
    -   @comet/admin-icons@4.6.0

## 4.5.0

### Minor Changes

-   01677075: Fix some DataGrid styling issues and style the DataGrid components to match the Comet CI more closely.

### Patch Changes

-   @comet/admin-icons@4.5.0

## 4.4.3

### Patch Changes

-   @comet/admin-icons@4.4.3

## 4.4.2

### Patch Changes

-   @comet/admin-icons@4.4.2

## 4.4.1

### Patch Changes

-   @comet/admin-icons@4.4.1

## 4.4.0

### Patch Changes

-   @comet/admin-icons@4.4.0

## 4.3.0

### Patch Changes

-   @comet/admin-icons@4.3.0

## 4.2.0

### Patch Changes

-   67e54a82: Add styling variants to Tooltip
    -   @comet/admin-icons@4.2.0

## 4.1.0

### Patch Changes

-   Updated dependencies [51466b1a]
    -   @comet/admin-icons@4.1.0
