**Starting with 4.1.0, changes will be documented per package**

## 4.0.0

_Mar 8, 2023_

### Highlights

- New strategy for authorization: Comet is now less opinionated on how a user should be authorized. Opinionated parts regarding authorization are removed from the packages. Various helpers to configure authorization in the application are provided.
- New strategy for project configuration: Configurations that do not change between environments should be stored in a new `comet-config.json` file that is used in all microservices.
- New strategy for module configuration: Configuration is only injected into the `AppModule` instead of injecting it into the separate modules. Doing so removes a significant overhead caused by asynchronous module initialization.
- Performance improvements for requests accessing the page tree and documents: Page tree nodes may now be preloaded on a request basis. Page tree node documents are only loaded if requested by the query.
- Add `AnchorBlock` to support linking to anchors.

### @comet/blocks-admin

#### Changes

- Add `anchors` method to `BlockInterface` for a block to specify its anchors

### @comet/cms-admin

#### Breaking changes

- Changes related to the new authorization strategy
    - Remove dependency on [@comet/react-app-auth](https://www.npmjs.com/package/@comet/react-app-auth) package
    - Remove `AuthorizationErrorPage` component
    - Remove `access-token-service-worker.js` file. You should remove it from your build setup
    - Remove `AccessToken` message from `IFrameBridge`
    - Remove `authorizationManager` option from `createHttpClient`

- Change `CmsBlockContext.damConfig.maxFileSize` from `string` to `number`
- Change `CmsBlockContext.damConfig.maxSrcResolution` from `string` to `number`
- Rename `Publisher` component to `PublisherPage`
- Remove the wrapping `Chip` from `infoTag` method in `DocumentInterface`. Applications should add the `Chip` themselves:

    ```tsx
    export const Page: DocumentInterface<Pick<GQLPage, "content" | "seo">, GQLPageInput> = {
        ...
        InfoTag: ({ page }: { page: PageTreePage & GQLPageTreeNodeAdditionalFieldsFragment }) => {
            return <Chip size="small" label={page.userGroup} />;
        },
    };
    ```

- Add `anchors` method to `DocumentInterface` for a document to specify its anchors

#### Changes

- Add `AnchorBlock`
- Add support for anchors to `InternalLinkBlock`
- Add support for a custom block name to `createTextLinkBlock`

### @comet/blocks-api

#### Changes

- Add support for a custom block name and migrations to `createTextLinkBlock`

### @comet/cms-api

- Changes related to the new authorization strategy
    - Remove `AuthModule`. The auth module should be created in the application using the factories provided by the package. See [AuthModule](demo/api/src/auth/auth.module.ts) for an example
    - Remove `BasicAuthStrategy`. Use `createStaticCredentialsBasicStrategy` instead
    - Remove `BearerTokenStrategy`. Use `createAuthProxyJwtStrategy` instead
    - Remove `GlobalAuthGuard`. Use `createCometAuthGuard` instead

- Changes related to the new module configuration strategy
    - `BlocksModule`, `BlobStorageModule`, `DamModule` and `PublicUploadModule` are not initialized asynchronously anymore. See [AppModule](demo/api/src/app.module.ts) for an example

- `BlocksTransformerMiddlewareFactory` now requires `BLOCKS_MODULE_TRANSFORMER_DEPENDENCIES` to be injected. See [AppModule](demo/api/src/app.module.ts) for an example
- Restrict access to builds based on `ContentScopeModule`. Cron jobs and jobs need to be annotated with `comet-dxp.com/content-scope`
- Move Kubernetes-specific parts of `BuildsModule` into a new `KubernetesModule`
- Remove the option to configure `BuildsModule`. Configuration of the Helm release is now done in `KubernetesModule`
- Make [@kubernetes/client-node](https://www.npmjs.com/package/@kubernetes/client-node) a peer dependency
- Remove `BuildObject`
- Change `DamModule.damConfig.allowedImageSizes` from `string[]` to `number[]`
- Change `DamModule.damConfig.allowedAspectRatios` from `string[]` to `number[]`
- Remove `damPath` from `PixelImageBlock`, `SvgImageBlock` and `DamVideoBlock`

#### Changes

- Changes related to the new authorization strategy
    - Add `createCometAuthGuard` to create the global application guard
    - Add `createAuthResolver` for `currentUser` query and `currentUserSignOut` mutation
    - Add `createAuthProxyJwtStrategy` for a JWT-based auth strategy
    - Add `createStaticCredentialsBasicStrategy` for a basic auth strategy
    - Add `createStaticAuthedUserStrategy` for a static user-based strategy. It should be primarily used for local development
- Add request-scoped `PageTreeReadApiService` with `preloadNodes` method to preload pages when reading large parts of the page tree
- Add request-scoped `BlocksTransformerService` that can be used in block field resolvers for improved performance (instead of relying on BlocksTransformerMiddlewareFactory). If all block transforms are done using field resolvers, `BlocksTransformerMiddlewareFactory` and `fieldResolverEnhancers` can be removed for additional performance improvements
- Add `AnchorBlock`
- Add support for anchors to `InternalLinkBlock`

### @comet/cms-site

#### Breaking changes

- Changes related to the new authorization strategy
    - Remove dependency on [next-auth](https://www.npmjs.com/package/next-auth) package
    - Remove `access-token-service-worker.js` file. You should remove it from your build setup
    - Remove `AccessToken` message from `IFrameBridge`

- Remove the ceiling of `width` and `height` props in `Image` component

#### Changes

- Add `AnchorBlock`
- Add support for anchors to `InternalLinkBlock`
- Add `getAuthedUser` and `hasAuthedUser` to parse the current user from the request

### @comet/eslint-config

#### Breaking changes

- Enable [no-return-await](https://eslint.org/docs/latest/rules/no-return-await) rule

## 3.2.3

_Feb 7, 2023_

### @comet/cms-api

#### Changes

- Fix `createRedirect` mutation when no scoping is used

### @comet/blocks-admin

#### Changes

- Fix `createCompositeSetting` not working when using an array value

## 3.2.2

_Jan 25, 2023_

### @comet/admin

#### Changes

- Fix `readClipboardText()` not working in Firefox by using local storage as a fallback

## 3.2.1

_Dec 6, 2022_

### @comet/admin

#### Changes

- Fix a bug where the slider thumbs are not visible when using `FinalFormRangeInput`
- Fix a bug where `SaveButton` would not clear `error` and `success` display states after timeout

## 3.2.0

_Nov 29, 2022_

### Highlights

- Add support to type root blocks in the GraphQL schema using `RootBlockDataScalar` and `RootBlockInputScalar`. See [page.entity.ts](/demo/api/src/pages/entities/page.entity.ts), [schema.gql](/demo/api/schema.gql), and [codegen.ts](demo/admin/codegen.ts) for an example on how to use

### @comet/admin-rte

#### Changes

- Fix a bug where control buttons in the toolbar would trigger submission when used in a form

### @comet/cms-admin

#### Changes

- Fix a bug where the pages query would query for a field `undefined` when no `additionalPageTreeNodeFragment` is set

### @comet/cms-api

#### Changes

- Add default value `{}` for `RedirectScopeInput` when no explicit scope is set to make redirects scope support backwards compatible
- Add `RootBlockDataScalar` and `RootBlockInputScalar` scalars to type root blocks in the GraphQL schema

## 3.1.0

_Nov 15, 2022_

### Highlights

- Add scope support for redirects (`@comet/cms-api` and `@comet/cms-admin`)

### @comet/admin

#### Changes

- Add `useFocusAwarePolling` hook that can be used in combination with `useQuery` to only fetch when the current browser tab is focused

### @comet/cms-admin

#### Changes

- `useSaveConflict` now only checks for conflicts when the current browser tab is focused
- Add `additionalPageTreeNodeFragment` prop to `CmsBlockContextProvider` that can be used to load additional page tree node fields in the page tree

## 3.0.0

_Oct 17, 2022_

This release marks the first public release of the CMS packages used for [Comet DXP](https://comet-dxp.com) applications. See the [documentation](https://docs.comet-dxp.com) for more information.

### Highlights

- Add new CMS packages `@comet/blocks-api`, `@comet/cms-api`, `@comet/blocks-admin`, `@comet/cms-admin`, and `@comet/cms-site`. Review [package overview](https://docs.comet-dxp.com/docs/overview/packages-tools) for usage
- Add new `@comet/cli` package to provide commonly used scripts (e.g., `generate-block-types`) to all applications
- Add new `@comet/eslint-config` package to provide ESLint configs used by all packages
- Add new [MUI X DataGrid](https://mui.com/x/react-data-grid/) helper functions
- Migrate all `@comet/admin` packages to MUI 5

### Migration Guide

1.  Migrate to MUI 5, following the official [MUI Migration Guide](https://mui.com/guides/migration-v4/)

2.  Install jscodeshift in your project

    ```bash
    npm install --save-dev jscodeshift
    ```

3.  Clone this repository into your project repository. If you have a monorepo, clone it into the correct subfolder

4.  Migrate from styled-components to MUI's style engine

    ```bash
    npx jscodeshift --extensions=ts,tsx --parser=tsx -t comet/codemods/3.0.0/mui-style-engine.ts src/
    ```

### @comet/cli

This release is the first stable version.

### @comet/eslint-config

This release is the first stable version.

### @comet/blocks-api

This release is the first stable version.

### @comet/cms-api

This release is the first stable version.

### @comet/blocks-admin

This release is the first stable version.

### @comet/cms-admin

This release is the first stable version.

### @comet/admin

#### Breaking changes

- Change the minimum supported React version to 17
- Remove `Select` component in favor of MUI's [Select](https://mui.com/material-ui/react-select/#main-content) component
- `StackBreadcrumbs` do not support MUI's [Breadcrumbs props](https://mui.com/material-ui/react-breadcrumbs/#main-content) anymore
- Remove `ErrorDialog` dependency from `createErrorDialogApolloLink()`. Doing so eliminates the need to create the Apollo client in the React component tree, which is preferable:

    **Before**

    ```tsx
    const Providers: React.FunctionComponent = ({ children }) => {
        const errorDialog = useErrorDialog();

        const apolloClient = new ApolloClient({
            link: ApolloLink.from([
                createErrorDialogApolloLink({ errorDialog }),
                createHttpLink({
                    uri: `https://anyapi.com/graphql`,
                }),
            ]),
            cache: new InMemoryCache(),
        });

        return (
            <OtherProviders>
                <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
            </OtherProviders>
        );
    };
    ```

    **After**

    ```tsx
    const apolloClient = new ApolloClient({
        link: ApolloLink.from([
            createErrorDialogApolloLink(),
            createHttpLink({
                uri: `https://anyapi.com/graphql`,
            }),
        ]),
        cache: new InMemoryCache(),
    });

    const Providers: React.FunctionComponent = ({ children }) => {
        return (
            <OtherProviders>
                <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
            </OtherProviders>
        );
    };
    ```

- Rename `ErrorDialogProvider` to `ErrorDialogHandler`. `ErrorDialogHandler` does not need to wrap the application anymore
- The default color of MUI's `Button` and `IconButton` [has been changed](https://mui.com/material-ui/migration/v5-component-changes/#button) from `"default"` to `"primary"`. Restore the previous "default" appearance by setting the `color` prop to `"info"`
- Rename `StackBreadcrumbProps` to `StackBreadcrumbsProps`
- Rename `FormSectionKey` to `FormSectionClassKey`
- Remove the default clear button from `FinalFormSearchTextField`. Re-enable by using the `clearable` prop

#### Changes

- Expose `comet.generic.*` messages as public API through `messages.ts`. Doing so prevents the need to translate them for every application:

    **Before**

    ```tsx
    <FormattedMessage id="comet.generic.globalContentScope" defaultMessage="Global Content" />;

    intl.formatMessage({
        id: "comet.generic.doYouWantToSaveYourChanges",
        defaultMessage: "Do you want to save your changes?",
    });
    ```

    **After**

    ```tsx
    import { messages } from "@comet/admin";

    <FormattedMessage {...messages.globalContentScope} />;

    intl.formatMessage(messages.saveUnsavedChanges);
    ```

- `StackBreadcrumbs` now shows an overflow menu when its items do not fit into a single row

### @comet/admin-color-picker

#### Breaking changes

- Change the majority of classes used for style overrides. This may break custom styles
- Remove `showPicker` prop from `ColorPicker` and show the picker by default. Hide by using the `hidePicker` prop
- Rename the `showClearButton` prop to `clearable` in `ColorPicker`

#### Changes

- Add a slider for the alpha channel, which is used when the `colorFormat` prop is set to `"rgba"`
- Add a standalone `ColorPicker` component for usage outside Final Form
- Disable the input when the setting the `disabled` prop
- Add missing focus styling to the input
- Open/close the picker when focusing/blurring the input using tab navigation

### @comet/admin-date-time (previously @comet/admin-date-picker)

#### Breaking changes

- Rename `@comet/admin-date-picker` to `@comet/admin-date-time`
- Change the internally used data picker library from [react-dates](https://github.com/react-dates/react-dates) to [react-date-range](https://github.com/hypeserver/react-date-range). Props specific to react-dates will no longer have any effect

- The date-picker & date-range-picker components require a [date-fns locale](https://date-fns.org/v2.28.0/docs/Locale) that can be provided by wrapping the application with the `DateFnsLocaleProvider` and passing in the desired locale as the value.

    ```tsx
    import { DateFnsLocaleProvider } from "@comet/admin-date-time";
    import { enUS } from "date-fns/locale";

    <DateFnsLocaleProvider value={enUS}>
        <App />
    </DateFnsLocaleProvider>;
    ```

#### Changes

- Add standalone `DatePicker` and `DateRangePicker` components for usage outside Final Form
- Add new `TimePicker`, `DateTimePicker`, and `TimeRangePicker` components. Each component comes as a standalone version with a separate Final Form wrapper (`FinalFormTimePicker` etc.)

### @comet/admin-theme

#### Breaking changes

- Update the theme to reflect the latest adaptations made in our applications
- Add new default styling for MUI's [Chip](https://mui.com/material-ui/react-chip/#main-content) component

### @comet/cms-site

This release is the first stable version.

## 2.2.1

_Oct 3, 2022_

### @comet/admin-rte

- Fix a bug where `setEditorState` was incorrectly assumed to be a React state setter function

## 2.2.0

_Jun 30, 2022_

### @comet/admin

- Display loading and error states of a contained form in `EditDialog` via its `SaveButton`
- Close `EditDialog` when a contained form is submitted via `Enter` key press
- Fix `FinalFormSelect` value generic to allow simple select values such as `string`

## 2.1.0

_Jun 20, 2022_

### Highlights

- Add `FinalFormAutocomplete` component (see [story](https://comet-admin.netlify.app/?path=/story/comet-admin-form--autocomplete-async-select))

### @comet/admin

- Add `useAsyncOptionsProps` hook to allow async loading of options in `FinalFormAutocomplete` and `FinalFormSelect`
- Add support to pass options directly via props in `FinalFormSelect (they are rendered automatically)

### @comet/admin-rte

- Add support for custom inline styles (see [story](https://comet-admin.netlify.app/?path=/story/comet-admin-rte--custom-inline-styles))
- Show OS-specific shortcut tooltips on MacOS

## 2.0.0

_Nov 3, 2021_

### Highlights

- Add package @comet/admin-icons
- Add a standard `Toolbar` that can be used as an application-wide element with consistent styling containing navigation, action buttons, and filters
- Add the ability to customize components, similar to Material UI components. Customization can be done either globally through theme [overrides](https://v4.mui.com/customization/globals/#css) and [props](https://v4.mui.com/customization/globals/#default-props) or individually with [classes](https://v4.mui.com/customization/components/#overriding-styles-with-class-names)
- Start docs of components and general information about the development of Comet Admin
- Implement [Error Boundaries](https://reactjs.org/docs/error-boundaries.html) that catch errors in the component tree without crashing the application

### Migration Guide

1. Install jscodeshift in your project

    ```bash
    npm install --save-dev jscodeshift
    ```

2. Clone this repository into your project repository. If you have a monorepo, clone it into the correct subfolder
3. Run codemods depending on usage

    **Remove `renderButtons` and `components` from `FinalForm`**

    ```bash
    npx jscodeshift --extensions=ts,tsx --parser=tsx -t comet-admin/codemods/2.0.0/final-form-dissolve-final-form-save-cancel-buttons.ts src/
    ```

    **Remove `showBreadcrumbs` from `Stack`**

    ```bash
    npx jscodeshift --extensions=ts,tsx --parser=tsx -t comet-admin/codemods/2.0.0/stack-dissolve-breadcrumbs.ts src/
    ```

    **Remove `showBackButton` from `Stack`**

    ```bash
    npx jscodeshift --extensions=ts,tsx --parser=tsx -t comet-admin/codemods/2.0.0/stack-dissolve-backbutton.ts  src/
    ```

    **Update theme**

    ```bash
    npx jscodeshift --extensions=ts,tsx --parser=tsx -t comet-admin/codemods/2.0.0/update-theme.ts src/
    ```

See an example migration [here](https://github.com/vivid-planet/comet-admin-starter/pull/36).

### @comet/admin

#### Breaking changes

- Remove `createMuiTheme` in favor of `createTheme` from `@material-ui/core`
- Remove `VPAdminInputBase` and `getDefaultVPAdminInputStyles`, in favor of [InputBase](https://v4.mui.com/api/input-base/) from Material UI
- Remove `renderButtons` and `components` props from `FinalForm` (handled by codemods)
- Remove `FinalFormTextField` in favor of `FinalFormInput`. Material UI's [TextField](https://v4.mui.com/components/text-fields/#textfield) component should not be used in Comet Admin projects as its design is incompatible with the Comet CI
- Remove `fieldContainer` prop from `Field` in favor of a new `variant` prop
- Remove `FieldContainerLabelAbove` component in favor of the default `vertical` variant. Restore the previous default layout of `Field` by adding the following to the theme:
    ```js
    {
        props: {
            CometAdminFormFieldContainer: {
                variant: 'horizontal'
            }
        },
        overrides: {
            CometAdminFormFieldContainer: {
                horizontal: {
                    "& $label": {
                        width: `${100 / 3}%`
                    },
                    "& $inputContainer": {
                        width: `${200 / 3}%`
                    }
                }
            }
        }
    }
    ```
- Remove default styling from `Menu` component in favor of styling the component via the theme
- Remove `permanentMenuMinWidth` prop from `Menu` in favor of a new `variant` prop, which allows for more control. For instance, variant `temporary` can be used to give some pages more space
- Remove `components.breadcrumbsContainer` prop form `Stack` in favor of a div that can be customized via the theme
- Remove `FixedLeftRightLayout` component
- Remove `FormPaper` component in favor of Material UI's [Card](https://v4.mui.com/components/cards/#card) component
- Change default content spacing and header height of `MasterLayout`
- Custom `headerComponent` of `MasterLayout` expects a component built using the `AppHeader` system (see [docs](https://comet-admin.netlify.app/?path=/story/docs-components-appheader--page))
- Remove `hideToolbarMenuIcon` prop from `MasterLayout` as it is no longer necessary when building a custom header using the `AppHeader` system
- Remove `<main>` HTML tag from `MasterLayout` in favor of new `MainContent` component
    ```js
    <MasterLayout headerComponent={AppHeader} menuComponent={AppMenu}>
        <Toolbar />
        <MainContent>/* Main content goes here */</MainContent>
    </MasterLayout>
    ```
- Remove `AppBar` inside `Tabs`. Restore the previous appearance by overriding the `CometAdminTabs-root` class
- Remove `tabLabel` prop from `Tabs`. Use `label` instead
- `RouterTabs` do not inherit Material UI's [Tabs props](https://v4.mui.com/api/tabs/#props) anymore. Use `tabsProps` prop to set `Tabs` props
- Remove `showBreadcrumbs` prop from `Stack`. `StackBreadcrumbs` has been added for compatibility. However, it is recommended to use the new `Toolbar` system (handled by codemods)

    ```js
    <Stack topLevelTitle="Stack Nested">
        <StackBreadcrumbs />
        <StackSwitch>
            <StackPage name="page1">
                <Page1 />
            </StackPage>
            <StackPage name="page2">page2-2</StackPage>
        </StackSwitch>
    </Stack>
    ```

- Remove `showBackButton` prop from `Stack` (handled by codemods)
- Remove alternating background color from body rows in `Table`. Restore the previous appearance by adding the following styles to `CometAdminTableBodyRow`:

    ```js
    odd: {
        backgroundColor: neutrals[50],
    }
    ```

- Remove background color from table head in `Table`. Restore the previous appearance by adding the following styles to `MuiTableHead`:

    ```js
    root: {
        backgroundColor: neutrals[100],
    }
    ```

- `TableDndOrder` requires new peer dependencies and a `DndProvider` setup in the application

    Install peer dependencies in your application

    ```bash
    npm install react-dnd@"~14" react-dnd-html5-backend@"~14"
    ```

    Wrap your application in a `DnDProvider`

    ```js
    import { DndProvider } from "react-dnd";
    import { HTML5Backend } from "react-dnd-html5-backend";

    export function App() {
        return <DndProvider backend={HTML5Backend}>...</DndProvider>;
    }
    ```

#### Changes

- Add `ClearInputButton` component, which can be used as an `endAdornment` to clear inputs
- Add `variant` prop to `Field` to control the positioning of label and input
- Add `headerHeight` prop to `MasterLayout` which child components can use to position themselves
- Add `onAfterSubmit` callback to `FinalForm`
- Add `useStoredState` hook to store state in local storage or session storage
- Add `FinalFormRangeInput` component
- Add `SplitButton` component to combine buttons in a button group
- Add `SaveButton` component, which handles and displays save state (idle, saving, success and error)
- Add `SnackbarProvider`, `useSnackbarApi` hook and `UndoSnackbar`
- Add `FinalFormSaveCancelButtonsLegacy` as drop-in replacement for removed cancel and save buttons in `FinalForm`
- Add `PrettyBytes`  component for formatting byte values, for instance, file sizes
- Add `validateWarning` validator to `Field` and `FinalForm`
- Add `open` and `onOpenChange` props to `AppHeaderDropdown` to control the open state
- Add `getTargetUrl()` to `StackSwitchApi`
- Add `StackLink` component for navigating within a `Stack` via hyperlinks
- Allow `boolean | undefined | null` as children of `RouterTabs`
- Expose `selectionApi` through `useEditDialog`

### @comet/admin-color-picker

#### Breaking changes

- Rename `VPAdminColorPicker` to `CometAdminColorPicker`
- Remove `clearButton` and `clearIcon` theme classes from the color picker in favor of a new `ClearInputButton` component
- The clear button is hidden by default

#### Changes

- Allow custom icons/adornments for color input
- The clear button is now optional (using the `showClearButton` prop)

### @comet/admin-react-select

#### Breaking changes

- Rename theme key from `VPAdminSelect` to `CometAdminSelect`

### @comet/admin-rte

#### Breaking changes

- Removed `rte` key from theme. RTE colors should be defined using by overriding `CometAdminRte` instead
    ```js
    {
        props: {
            CometAdminRte: {
                colors: {
                    // Colors go here
                }
            }
        }
    }
    ```

**Note: prior to 2.x, packages have been released independently, therefore having separate version numbers and changelogs**

## @comet/admin

### 1.3.0

_Mar 4, 2021_

This is a bugfix/maintenance release.

#### Bugfixes

- Handle submit error in EditDialog (#209)
- Pass `innerRef` from `TableBodyRow` to `sc.TableBodyRow`

#### Changes

- The `styled-components` peer dependency has been changed to `^4.0.0 || ^5.0.0` to include v5.
- The `graphql` peer dependency has been changed to `^14.0.0 || ^15.0.0` to include v14.

### 1.2.0

_Feb 23, 2021_

#### Highlights

- RouterPrompt: comet-admin's [react-router Prompt Component](https://reactrouter.com/core/api/Prompt) Wrapper (that adds support for multiple Prompt instances) adds missing message callback parameters for full react-router compatibility

#### Changes

- TotalCount of the tables Pagination is now formatted with FormattedNumber from react-intl.
- Switch from Yarn to NPM v7 (updated all dependencies)

### 1.1.0 (re-release under new name)

_Jan 12, 2021_

This package has been renamed to @comet/admin

### 1.1.0

_Jan 11, 2021_

This is a bugfix/maintenance release.

#### Highlights

- Added migration guide for 1.0 update https://github.com/vivid-planet/comet-admin/blob/master/CHANGELOG.md#migration-guide

#### Bugfixes

- Render MenuItem in children of Route (#277)
- Fix ability to open temporary menu (#279)
- dependency-cleanup (#278)

### 1.0.0

_Dec 18, 2020_

This version is the first stable version.

#### Highlights

- Renamed from react-admin to comet-admin (!!!)
- Made comet-admin translatable with react-intl
- Updated apollo

#### Incompatible Changes

- Restructured packages:
    - Consolidated react-admin-core, fetch-provider, file-icons, react-admin-final-form-material-ui, react-admin-form, react-admin-layout and react-admin-mui into comet-admin
    - Moved react-select to own package comet-admin-react-select
- Removed date-fns for date formatting in favor of react-intl
- Removed exports for styled and css, use styled-components directly
- FinalForm wrappers (e.g. Checkbox, Input, ...) are now prefixed with FinalForm

#### Changes

- Switched form TSLint to ESLint

#### Migration Guide

Clone this repository into your project repository. If you have a monorepo, you have to clone it into the right subfolder.

An example can be found [here](https://github.com/vivid-planet/comet-admin-starter/pull/36).

**Package Renaming**

Automatic migrations using codeshift are available (use -d for dry-run):

```
npx jscodeshift --extensions=ts --parser=ts -t comet-admin/codemods/1.0.0/package-renames.ts src/
npx jscodeshift --extensions=tsx --parser=tsx -t comet-admin/codemods/1.0.0/package-renames.ts src/
```

**Styled Components**

Automatic migrations using codeshift are available (use -d for dry-run):

```
npx jscodeshift --extensions=ts --parser=ts -t comet-admin/codemods/1.0.0/styled-components.ts src/
npx jscodeshift --extensions=tsx --parser=tsx -t comet-admin/codemods/1.0.0/styled-components.ts src/
```

**Apollo-Client**

Detailed instructions can be found [here](https://www.apollographql.com/docs/react/migrating/apollo-client-3-migration). Automatic migrations using codeshift are available (use -d for dry-run):

```
git clone https://github.com/apollographql/apollo-client.git
npx jscodeshift -t apollo-client/scripts/codemods/ac2-to-ac3/imports.js --extensions ts --parser ts src/
npx jscodeshift -t apollo-client/scripts/codemods/ac2-to-ac3/imports.js --extensions tsx --parser tsx src/
```

**Component-Renames**

FinalForm fields are now prefixed with FinalForm. Automatic migrations using codeshift are available (use -d for dry-run):

```
npx jscodeshift --extensions=ts --parser=ts -t comet-admin/codemods/1.0.0/component-renames.ts src/
npx jscodeshift --extensions=tsx --parser=tsx -t comet-admin/codemods/1.0.0/component-renames.ts src/
```

**FormatLocalized**

`FormatLocalized` has been removed in favor of `FormattedDate` and `FormattedTime` of react-intl. An example migration can look like this:

Before:

```
<FormatLocalized date={parseISO(publishDate)} format="dd.MM.yyyy - HH:mm" />
```

After:

```
<FormattedDate value={date} day="2-digit" month="2-digit" year="numeric" />
{" - "}
<FormattedTime value={date} />
```

As an alternative, FormatLocalized can be created inside the project by using:

```
import { format } from "date-fns";
import * as React from "react";
import { useIntl } from "react-intl";

interface IProps {
    format: string;
    date: Date | number;
}
export const FormatLocalized: React.FunctionComponent<IProps> = ({ date, format: formatString }) => {
    const intl = useIntl();
    const locale = intl.locale;
    return <>{format(date, formatString, { locale })}</>;
};
```

However, imports need to be adjusted manually.

**Internationalization**

Strings are now prepared for internationalization. The default language is switched from German to English. A sample setup can be found [here](https://github.com/vivid-planet/comet-admin-starter/pull/36).

**Fix Eslint Errors**

```
npx eslint --ext .ts,.tsx,.js,.jsx,.json,.md --fix src/
```

## @comet/admin-color-picker

### 1.0.2

_Feb 23, 2021_

use fixed version of react-color
Switch from Yarn to NPM v7 (updated all dependencies)

### 1.0.1 (re-release under new name)

_Jan 12, 2021_

This package has been renamed to @comet/admin-color-picker

### 1.0.1

_Jan 11, 2021_

This is a bugfix/maintenance release

### 1.0.0

_Dec 18, 2020_

This version is the first stable version.

## @comet/admin-date-picker

### 1.0.2

_Feb 23, 2021_

Switch from Yarn to NPM v7 (updated all dependencies)

### 1.0.1 (re-release under new name)

_Jan 12, 2021_

This package has been renamed to @comet/admin-date-picker

### 1.0.1

_Jan 11, 2021_

This is a bugfix/maintenance release

### 1.0.0

_Dec 18, 2020_

This version is the first stable version.

## @comet/admin-react-select

### 1.0.2

_Feb 23, 2021_

Switch from Yarn to NPM v7 (updated all dependencies)

### 1.0.1 (re-release under new name)

_Jan 12, 2021_

This package has been renamed to @comet/admin-react-select

### 1.0.1

_Jan 11, 2021_

This is a bugfix/maintenance release

### 1.0.0

_Dec 18, 2020_

This version is the first stable version.

## @comet/admin-rte

### 1.2.1

_Feb 23, 2021_

#### Bugfixes

- Make controls for RTE sticky
- Use mui-grey-palette for default colors
- Remove min-width of link buttons (MuiButtonGroup)

#### Changes

- Switch from Yarn to NPM v7 (updated all dependencies)

### 1.2.0

_Jan 22, 2021_

#### Highlights

- Add default styles (MUI) to built-in blocktypes
- Make built-in blocktypes styleable
- Supports disabled-attribute

#### Changes

- Rename prop-name "customBlockMap" to "blocktypeMap", deprecate prop-name "customBlockMap"
- Rename prop-name "Icon" to "icon", deprecate prop-name "Icon"

### 1.1.1 (re-release under new name)

_Jan 12, 2021_

This package has been renamed to @comet/admin-rte

### 1.1.1

_Jan 11, 2021_

This is a bugfix/maintenance release

### 1.1.0

_Dec 22, 2020_

#### Changes

- Add `blockquote` support

### 1.0.0

_Dec 18, 2020_

This version is the first stable version.
