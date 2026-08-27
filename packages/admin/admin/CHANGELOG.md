# @comet/admin

## 10.1.0

### Patch Changes

- @dextinity/admin-icons@10.1.0

## 10.0.1

### Patch Changes

- 48748b0: Show the GraphQL error messages in the error dialog again

    `createErrorDialogApolloLink` only passed the message of network errors to the `ErrorDialog`.
    For GraphQL errors, the dialog showed "Unknown error" instead of the actual messages (e.g., the message of a `BadRequestException` thrown by the API).
    - @dextinity/admin-icons@10.0.1

## 10.0.0

### Major Changes

- f843a5e: Rename `@comet/admin` to `@dextinity/admin`

    Update the dependency in `package.json` and all imports:

    ```diff
    - import { MainContent } from "@comet/admin";
    + import { MainContent } from "@dextinity/admin";
    ```

    **Breaking changes**
    - Rename `createCometTheme` to `createDextinityTheme`
    - Rename the theme component prefix from `CometAdmin` to `DextinityAdmin`. This affects `components` overrides passed to `createDextinityTheme`, the `name` passed to `useThemeProps` in custom components and the generated CSS class names (`.CometAdminClearInputAdornment-root` -> `.DextinityAdminClearInputAdornment-root`)
    - Rename the CSS variables from `--comet-admin-*` to `--dextinity-admin-*`, for instance, `--comet-admin-master-layout-content-top-spacing` -> `--dextinity-admin-master-layout-content-top-spacing`
    - Remove the `CometLogo` component. Use `DextinityLogo` from `@dextinity/admin-icons` instead

### Patch Changes

- Updated dependencies [f843a5e]
    - @dextinity/admin-icons@10.0.0

## 10.0.0-beta.0

### Major Changes

- f843a5e: Rename `@comet/admin` to `@dextinity/admin`

    Update the dependency in `package.json` and all imports:

    ```diff
    - import { MainContent } from "@comet/admin";
    + import { MainContent } from "@dextinity/admin";
    ```

    **Breaking changes**
    - Rename `createCometTheme` to `createDextinityTheme`
    - Rename the theme component prefix from `CometAdmin` to `DextinityAdmin`. This affects `components` overrides passed to `createDextinityTheme`, the `name` passed to `useThemeProps` in custom components and the generated CSS class names (`.CometAdminClearInputAdornment-root` -> `.DextinityAdminClearInputAdornment-root`)
    - Rename the CSS variables from `--comet-admin-*` to `--dextinity-admin-*`, for instance, `--comet-admin-master-layout-content-top-spacing` -> `--dextinity-admin-master-layout-content-top-spacing`
    - Remove the `CometLogo` component. Use `DextinityLogo` from `@dextinity/admin-icons` instead

## 9.5.0

### Patch Changes

- @comet/admin-icons@9.5.0

## 9.4.0

### Minor Changes

- 085b9ac: Add `disabled` support to `ToggleButtonGroupField`

    Setting `disabled` on the field was accepted but had no effect — every button stayed clickable. It now disables all buttons, and individual options can be disabled by setting `disabled` on the option. When both are set, the field wins — an option cannot re-enable itself.

    **Example**

    ```tsx
    <ToggleButtonGroupField
        name="type"
        options={[
            { label: "Address", value: "address" },
            { label: "Coordinates", value: "coordinates", disabled: true },
        ]}
    />
    ```

    `FinalFormToggleButtonGroup` now also supports `sx`, `className`, `slotProps` and theme customization through `CometAdminFinalFormToggleButtonGroup`, with the new `FinalFormToggleButtonGroupClassKey` type describing its slots.

### Patch Changes

- bf1ff64: Apply theme customizations for `DateRangePicker`

    `defaultProps` and `styleOverrides` defined for `CometAdminDateRangePicker` had no effect, as the component read its theme props from `CometAdminFutureDateRangePicker`.
    - @comet/admin-icons@9.4.0

## 9.3.0

### Patch Changes

- 7b2d8db: Fix end adornment layout in multi-select `AutocompleteField`

    Previously, the clear button could wrap below the chips and fall outside the visible field area in narrow containers.
    Now the end adornment (loading indicator, clear button, error icon, popup icon) is pinned to the top right corner of the field and the input reserves exactly the required space for the currently visible adornments, so chips can never overlap it.
    Additionally, the clear button is no longer shown for an empty multi-select, and clearing a multi-select now resets the value to an empty array instead of an empty string.
    The dropdown now opens when the input receives focus (`openOnFocus`), so clicking anywhere into the field – including next to the icons – opens it.
    - @comet/admin-icons@9.3.0

## 9.2.2

### Patch Changes

- @comet/admin-icons@9.2.2

## 9.2.1

### Patch Changes

- @comet/admin-icons@9.2.1

## 9.2.0

### Patch Changes

- 5a05d97: Fix separation of multiple selected values in `FinalFormSelect`

    When using `multiple`, the selected values were rendered concatenated without any separator (e.g. `value-2value-1value-3value-4`). They are now separated by a comma, matching the display of `SelectField`.

    This affects all fields that render their selected values through the options/`getOptionLabel` path (i.e. without JSX `children`), namely `AsyncSelectField` and any `FinalFormSelect` used with an array value. Within Comet, this also corrects the display of the `targetGroups` and test email address selects in `@comet/brevo-admin` (`SendManagerFields`, `TestEmailCampaignForm`), which consume `FinalFormSelect` and had the same issue.
    - @comet/admin-icons@9.2.0

## 9.1.1

### Patch Changes

- @comet/admin-icons@9.1.1

## 9.1.0

### Patch Changes

- @comet/admin-icons@9.1.0

## 9.0.1

### Patch Changes

- @comet/admin-icons@9.0.1

## 9.0.0

### Major Changes

- 5f1566a: Make packages ESM-only
- 99140f8: Bump MUI X Data Grid peer dependency to v8

    See the migration guide for information on how to upgrade.

- 3fda20b: Remove the "Future" prefix from date/time components as they are now considered stable

    **If already in use, update the imports of these components and their types:**

    DatePicker:
    - `Future_DatePicker` -> `DatePicker`
    - `Future_DatePickerProps` -> `DatePickerProps`
    - `Future_DatePickerClassKey` -> `DatePickerClassKey`
    - `Future_DatePickerField` -> `DatePickerField`
    - `Future_DatePickerFieldProps` -> `DatePickerFieldProps`

    DateRangePicker:
    - `Future_DateRangePicker` -> `DateRangePicker`
    - `Future_DateRangePickerProps` -> `DateRangePickerProps`
    - `Future_DateRangePickerClassKey` -> `DateRangePickerClassKey`
    - `Future_DateRangePickerField` -> `DateRangePickerField`
    - `Future_DateRangePickerFieldProps` -> `DateRangePickerFieldProps`

    TimePicker:
    - `Future_TimePicker` -> `TimePicker`
    - `Future_TimePickerProps` -> `TimePickerProps`
    - `Future_TimePickerClassKey` -> `TimePickerClassKey`
    - `Future_TimePickerField` -> `TimePickerField`
    - `Future_TimePickerFieldProps` -> `TimePickerFieldProps`

    DateTimePicker:
    - `Future_DateTimePicker` -> `DateTimePicker`
    - `Future_DateTimePickerProps` -> `DateTimePickerProps`
    - `Future_DateTimePickerClassKey` -> `DateTimePickerClassKey`
    - `Future_DateTimePickerField` -> `DateTimePickerField`
    - `Future_DateTimePickerFieldProps` -> `DateTimePickerFieldProps`

    **If your theme is using `defaultProps` or `styleOverrides` for any of these components, update their component-keys:**
    - `CometAdminFutureDatePicker` -> `CometAdminDatePicker`
    - `CometAdminFutureDateRangePicker` -> `CometAdminDateRangePicker`
    - `CometAdminFutureTimePicker` -> `CometAdminTimePicker`
    - `CometAdminFutureDateTimePicker` -> `CometAdminDateTimePicker`

    **If you are using class-names to access these components' slots, update them:**
    - `CometAdminFuture_DatePicker-*` -> `CometAdminDatePicker-*`
    - `CometAdminFuture_DateRangePicker-*` -> `CometAdminDateRangePicker-*`
    - `CometAdminFuture_TimePicker-*` -> `CometAdminTimePicker-*`
    - `CometAdminFuture_DateTimePicker-*` -> `CometAdminDateTimePicker-*`

- fd5c36f: Remove `clearable` prop from `Autocomplete`, `FinalFormInput`, `FinalFormNumberInput` and `FinalFormSearchTextField`

    Those fields are now clearable automatically when not set to `required`, `disabled` or `readOnly`.

- 3c81ff0: Remove `hasClearableContent` prop from `ClearInputAdornment`

    The component now always renders when included in the component tree. Callers should conditionally render the component instead of passing the `hasClearableContent` prop.

    **Migration:**

    Before:

    ```tsx
    <ClearInputAdornment position="end" hasClearableContent={Boolean(value)} onClick={() => onChange("")} />
    ```

    After:

    ```tsx
    {
        value && <ClearInputAdornment position="end" onClick={() => onChange("")} />;
    }
    ```

- 631540c: Rename `variant` prop of `Tooltip` to `color` and remove the `neutral` and `primary` options

    ```diff
     <Tooltip
         title="Title"
    -    variant="light"
    +    color="light"
     >
         <Info />
     </Tooltip>
    ```

    ```diff
     <Tooltip
         title="Title"
    -    variant="neutral"
     >
         <Info />
     </Tooltip>
    ```

- 9cb3f95: Bump MUI X Date Pickers peer dependency to v8

    See the migration guide for information on how to upgrade.

### Minor Changes

- 15e771b: Add `TimeRangePicker` and `TimeRangePickerField` components

    These MUI X-based components complete the set of date/time components in `@comet/admin` and replace the deprecated `TimeRangePicker`, `TimeRangeField` and `FinalFormTimeRangePicker` from `@comet/admin-date-time`.

    The `value` and the value passed to `onChange` are a `TimeRange` object with `start` and `end` as 24-hour time strings (`HH:mm`):

    ```ts
    type TimeRange = {
        start: string | null;
        end: string | null;
    };
    ```

- d7b77af: Add `ErrorHandlerProvider` and `useErrorHandler` for centralized error reporting from `ErrorBoundary`

    `ErrorBoundary` now invokes an optional `onError(error, errorInfo)` callback provided through `ErrorHandlerProvider`'s context whenever it catches an error. The visible Alert UI of `ErrorBoundary` is unchanged — the callback is purely additive and intended for forwarding errors to a reporting service (e.g., Sentry).

    **Example**

    ```tsx
    import { ErrorHandlerProvider } from "@comet/admin";

    <ErrorHandlerProvider
        onError={(error, errorInfo) => {
            // Report the error to your error tracking service
            console.error(error, errorInfo.componentStack);
        }}
    >
        {children}
    </ErrorHandlerProvider>;
    ```

- 8c2fdde: Add filtering and sorting to `DependenciesList` and `DependentsList`

    Users can now filter dependencies/dependents by name, type, secondary information, and visibility, and sort by all columns. A default filter shows only visible items. The `GqlFilter` type is now exported from `@comet/admin`.

    **Breaking changes:**

    **`@comet/cms-api`:** `DependencyFilter.targetGraphqlObjectType` and `DependentFilter.rootGraphqlObjectType` changed from `string` to `StringFilter`. Update any code passing a plain string to use `{ equal: "..." }` instead.

    **`@comet/cms-api`:** `DependenciesService.getDependents()` and `getDependencies()` consolidated the `filter`, `paginationArgs`, and `options` parameters into a single `options` object. If you call these methods directly, merge the arguments:

    ```ts
    // Before
    service.getDependents(target, filter, { offset, limit }, { forceRefresh, sort });

    // After
    service.getDependents(target, { filter, offset, limit, forceRefresh, sort });
    ```

    **`@comet/cms-admin`:** The GQL queries passed to `DependenciesList` and `DependentsList` must now accept `$filter` and `$sort` variables and forward them to the `dependencies`/`dependents` field. Update your queries as follows:

    ```graphql
    # DependentsList
    query MyDependents($id: ID!, $offset: Int!, $limit: Int!, $forceRefresh: Boolean = false, $filter: DependentFilter, $sort: [DependencySort!]) {
        item: myEntity(id: $id) {
            id
            dependents(offset: $offset, limit: $limit, forceRefresh: $forceRefresh, filter: $filter, sort: $sort) {
                nodes {
                    rootGraphqlObjectType
                    rootId
                    rootColumnName
                    jsonPath
                    name
                    secondaryInformation
                    visible
                }
                totalCount
            }
        }
    }

    # DependenciesList
    query MyDependencies($id: ID!, $offset: Int!, $limit: Int!, $forceRefresh: Boolean = false, $filter: DependencyFilter, $sort: [DependencySort!]) {
        item: myEntity(id: $id) {
            id
            dependencies(offset: $offset, limit: $limit, forceRefresh: $forceRefresh, filter: $filter, sort: $sort) {
                nodes {
                    targetGraphqlObjectType
                    targetId
                    rootColumnName
                    jsonPath
                    name
                    secondaryInformation
                    visible
                }
                totalCount
            }
        }
    }
    ```

- f066335: Add support for React 19
- 8e3a074: New helper: downloadFile, to be used instead of file-saver dependency
- 2fe9d4b: Add support for translating page and document content

    Content translation can now be applied to entire documents at once, in addition to the existing field-level translation.

    **Setup**

    Wrap the application with `AzureAiTranslatorProvider` (supports `batchTranslate` automatically):

    ```tsx
    <AzureAiTranslatorProvider enabled showApplyTranslationDialog>
        {children}
    </AzureAiTranslatorProvider>
    ```

    **Making a document type translatable**

    Add `createDocumentTranslationMethods` and the `TranslatableInterface` type to the document definition:

    ```tsx
    import { createDocumentTranslationMethods, type TranslatableInterface } from "@comet/cms-admin";

    const rootBlocks = {
        content: PageContentBlock,
        seo: SeoBlock,
    };

    export const Page: DocumentInterface & TranslatableInterface & DependencyInterface = {
        // ...existing config
        ...createDocumentRootBlocksMethods(rootBlocks),
        ...createDocumentTranslationMethods(rootBlocks),
    };
    ```

    **Adding translate action to the edit page**

    `createUsePage` now returns a `translateContent` function. Use it with `TranslateContentMenuItem` inside a `CrudMoreActionsMenu`:

    ```tsx
    const { translateContent /* ...other fields */ } = usePage({ pageId: id });

    <CrudMoreActionsMenu overallActions={[<TranslateContentMenuItem translateContent={translateContent} />]} />;
    ```

    **Page tree integration**

    The page tree context menu and bulk action toolbar automatically show a "Translate" action for pages. This translates the page name, slug, and document content.

- 460cbfb: Add translation support for textarea fields in `FinalFormInput`

    Previously, only `type="text"` fields supported content translation. Now `type="textarea"` fields (used by `TextAreaField`) also show the translate button and use a multiline translation dialog.

### Patch Changes

- 92281f1: Add `"sideEffects"` to package.json for better tree-shakability
- b4ba869: Fix Data Grid Excel export for `singleSelect` columns

    When a `singleSelect` column uses `valueOptions`, Excel export now resolves the exported cell value to the matching option label unless a custom `valueFormatter` overrides it.

- 57678d0: Fix `FinalFormNumberInput` dirtying the form on mount when the initial value is `null`

    The value-sync effect inside `FinalFormNumberInput` ran on mount and called `input.onChange(undefined)` whenever `input.value` was empty. For a form whose initial value was `null`, this silently normalized the value to `undefined`, making the field `dirty` before any user interaction and breaking dirty-tracking features such as `EditDialog`, `SaveBoundary`, and the unsaved-changes router prompt.

    The mount-time sync now only updates the formatted display string. The empty-input normalization to `undefined` still happens on real user interaction in `handleBlur`.

- fdabaf1: Fix `MainContent` with `fullHeight` growing past the viewport after returning from a scrolled detail page

    `useTopOffset` used `getBoundingClientRect().top`, which is viewport-relative. When navigating back from a scrolled page, the browser could restore the previous scroll position before the offset was measured, producing a too-small offset and a `calc(100vh - topOffset)` larger than the viewport. The offset is now measured relative to the document by adding `window.scrollY`.

- 8e40458: Fix `Stack` crash when location changes before any breadcrumb is registered

    `Stack` accessed the last entry of an empty breadcrumb array on location change, causing a `TypeError: Cannot set properties of undefined`. Guarded the update to skip when no breadcrumbs are registered yet.

- b459ec7: Reduce published package size by keeping non-runtime build artifacts out of the bundle
- cabba53: Fix `DataGridPagination` page information not pluralizing "items"

    The default message for `comet.dataGridPagination.pageInformation` used a fixed plural form, forcing translations to follow the same shape. In languages with distinct singular/plural forms, this produced an incorrect result when `itemsTotal === 1`. The default message now uses ICU `plural` syntax so translators can branch on count.

    Projects that maintain their own translation of `comet.dataGridPagination.pageInformation` should update it to use `plural` with `one` and `other` branches.

- Updated dependencies [92281f1]
- Updated dependencies [f066335]
- Updated dependencies [5f1566a]
    - @comet/admin-icons@9.0.0

## 9.0.0-beta.6

### Minor Changes

- 15e771b: Add `TimeRangePicker` and `TimeRangePickerField` components

    These MUI X-based components complete the set of date/time components in `@comet/admin` and replace the deprecated `TimeRangePicker`, `TimeRangeField` and `FinalFormTimeRangePicker` from `@comet/admin-date-time`.

    The `value` and the value passed to `onChange` are a `TimeRange` object with `start` and `end` as 24-hour time strings (`HH:mm`):

    ```ts
    type TimeRange = {
        start: string | null;
        end: string | null;
    };
    ```

### Patch Changes

- b4ba869: Fix Data Grid Excel export for `singleSelect` columns

    When a `singleSelect` column uses `valueOptions`, Excel export now resolves the exported cell value to the matching option label unless a custom `valueFormatter` overrides it.

- 57678d0: Fix `FinalFormNumberInput` dirtying the form on mount when the initial value is `null`

    The value-sync effect inside `FinalFormNumberInput` ran on mount and called `input.onChange(undefined)` whenever `input.value` was empty. For a form whose initial value was `null`, this silently normalized the value to `undefined`, making the field `dirty` before any user interaction and breaking dirty-tracking features such as `EditDialog`, `SaveBoundary`, and the unsaved-changes router prompt.

    The mount-time sync now only updates the formatted display string. The empty-input normalization to `undefined` still happens on real user interaction in `handleBlur`.

- b459ec7: Reduce published package size by keeping non-runtime build artifacts out of the bundle
    - @comet/admin-icons@9.0.0-beta.6

## 9.0.0-beta.5

### Patch Changes

- fdabaf1: Fix `MainContent` with `fullHeight` growing past the viewport after returning from a scrolled detail page

    `useTopOffset` used `getBoundingClientRect().top`, which is viewport-relative. When navigating back from a scrolled page, the browser could restore the previous scroll position before the offset was measured, producing a too-small offset and a `calc(100vh - topOffset)` larger than the viewport. The offset is now measured relative to the document by adding `window.scrollY`.
    - @comet/admin-icons@9.0.0-beta.5

## 9.0.0-beta.4

### Minor Changes

- d7b77af: Add `ErrorHandlerProvider` and `useErrorHandler` for centralized error reporting from `ErrorBoundary`

    `ErrorBoundary` now invokes an optional `onError(error, errorInfo)` callback provided through `ErrorHandlerProvider`'s context whenever it catches an error. The visible Alert UI of `ErrorBoundary` is unchanged — the callback is purely additive and intended for forwarding errors to a reporting service (e.g., Sentry).

    **Example**

    ```tsx
    import { ErrorHandlerProvider } from "@comet/admin";

    <ErrorHandlerProvider
        onError={(error, errorInfo) => {
            // Report the error to your error tracking service
            console.error(error, errorInfo.componentStack);
        }}
    >
        {children}
    </ErrorHandlerProvider>;
    ```

- 2fe9d4b: Add support for translating page and document content

    Content translation can now be applied to entire documents at once, in addition to the existing field-level translation.

    **Setup**

    Wrap the application with `AzureAiTranslatorProvider` (supports `batchTranslate` automatically):

    ```tsx
    <AzureAiTranslatorProvider enabled showApplyTranslationDialog>
        {children}
    </AzureAiTranslatorProvider>
    ```

    **Making a document type translatable**

    Add `createDocumentTranslationMethods` and the `TranslatableInterface` type to the document definition:

    ```tsx
    import { createDocumentTranslationMethods, type TranslatableInterface } from "@comet/cms-admin";

    const rootBlocks = {
        content: PageContentBlock,
        seo: SeoBlock,
    };

    export const Page: DocumentInterface & TranslatableInterface & DependencyInterface = {
        // ...existing config
        ...createDocumentRootBlocksMethods(rootBlocks),
        ...createDocumentTranslationMethods(rootBlocks),
    };
    ```

    **Adding translate action to the edit page**

    `createUsePage` now returns a `translateContent` function. Use it with `TranslateContentMenuItem` inside a `CrudMoreActionsMenu`:

    ```tsx
    const { translateContent /* ...other fields */ } = usePage({ pageId: id });

    <CrudMoreActionsMenu overallActions={[<TranslateContentMenuItem translateContent={translateContent} />]} />;
    ```

    **Page tree integration**

    The page tree context menu and bulk action toolbar automatically show a "Translate" action for pages. This translates the page name, slug, and document content.

- 460cbfb: Add translation support for textarea fields in `FinalFormInput`

    Previously, only `type="text"` fields supported content translation. Now `type="textarea"` fields (used by `TextAreaField`) also show the translate button and use a multiline translation dialog.

### Patch Changes

- 8e40458: Fix `Stack` crash when location changes before any breadcrumb is registered

    `Stack` accessed the last entry of an empty breadcrumb array on location change, causing a `TypeError: Cannot set properties of undefined`. Guarded the update to skip when no breadcrumbs are registered yet.
    - @comet/admin-icons@9.0.0-beta.4

## 9.0.0-beta.3

### Major Changes

- 3c81ff0: Remove `hasClearableContent` prop from `ClearInputAdornment`

    The component now always renders when included in the component tree. Callers should conditionally render the component instead of passing the `hasClearableContent` prop.

    **Migration:**

    Before:

    ```tsx
    <ClearInputAdornment position="end" hasClearableContent={Boolean(value)} onClick={() => onChange("")} />
    ```

    After:

    ```tsx
    {
        value && <ClearInputAdornment position="end" onClick={() => onChange("")} />;
    }
    ```

### Patch Changes

- cabba53: Fix `DataGridPagination` page information not pluralizing "items"

    The default message for `comet.dataGridPagination.pageInformation` used a fixed plural form, forcing translations to follow the same shape. In languages with distinct singular/plural forms, this produced an incorrect result when `itemsTotal === 1`. The default message now uses ICU `plural` syntax so translators can branch on count.

    Projects that maintain their own translation of `comet.dataGridPagination.pageInformation` should update it to use `plural` with `one` and `other` branches.
    - @comet/admin-icons@9.0.0-beta.3

## 9.0.0-beta.2

### Major Changes

- 99140f8: Bump MUI X Data Grid peer dependency to v8

    See the migration guide for information on how to upgrade.

- 9cb3f95: Bump MUI X Date Pickers peer dependency to v8

    See the migration guide for information on how to upgrade.

### Patch Changes

- 92281f1: Add `"sideEffects"` to package.json for better tree-shakability
- Updated dependencies [92281f1]
    - @comet/admin-icons@9.0.0-beta.2

## 9.0.0-beta.1

### Minor Changes

- 8c2fdde: Add filtering and sorting to `DependenciesList` and `DependentsList`

    Users can now filter dependencies/dependents by name, type, secondary information, and visibility, and sort by all columns. A default filter shows only visible items. The `GqlFilter` type is now exported from `@comet/admin`.

    **Breaking changes:**

    **`@comet/cms-api`:** `DependencyFilter.targetGraphqlObjectType` and `DependentFilter.rootGraphqlObjectType` changed from `string` to `StringFilter`. Update any code passing a plain string to use `{ equal: "..." }` instead.

    **`@comet/cms-api`:** `DependenciesService.getDependents()` and `getDependencies()` consolidated the `filter`, `paginationArgs`, and `options` parameters into a single `options` object. If you call these methods directly, merge the arguments:

    ```ts
    // Before
    service.getDependents(target, filter, { offset, limit }, { forceRefresh, sort });

    // After
    service.getDependents(target, { filter, offset, limit, forceRefresh, sort });
    ```

    **`@comet/cms-admin`:** The GQL queries passed to `DependenciesList` and `DependentsList` must now accept `$filter` and `$sort` variables and forward them to the `dependencies`/`dependents` field. Update your queries as follows:

    ```graphql
    # DependentsList
    query MyDependents($id: ID!, $offset: Int!, $limit: Int!, $forceRefresh: Boolean = false, $filter: DependentFilter, $sort: [DependencySort!]) {
        item: myEntity(id: $id) {
            id
            dependents(offset: $offset, limit: $limit, forceRefresh: $forceRefresh, filter: $filter, sort: $sort) {
                nodes {
                    rootGraphqlObjectType
                    rootId
                    rootColumnName
                    jsonPath
                    name
                    secondaryInformation
                    visible
                }
                totalCount
            }
        }
    }

    # DependenciesList
    query MyDependencies($id: ID!, $offset: Int!, $limit: Int!, $forceRefresh: Boolean = false, $filter: DependencyFilter, $sort: [DependencySort!]) {
        item: myEntity(id: $id) {
            id
            dependencies(offset: $offset, limit: $limit, forceRefresh: $forceRefresh, filter: $filter, sort: $sort) {
                nodes {
                    targetGraphqlObjectType
                    targetId
                    rootColumnName
                    jsonPath
                    name
                    secondaryInformation
                    visible
                }
                totalCount
            }
        }
    }
    ```

- 8e3a074: New helper: downloadFile, to be used instead of file-saver dependency

### Patch Changes

- @comet/admin-icons@9.0.0-beta.1

## 9.0.0-beta.0

### Major Changes

- 5f1566a: Make packages ESM-only
- 3fda20b: Remove the "Future" prefix from date/time components as they are now considered stable

    **If already in use, update the imports of these components and their types:**

    DatePicker:
    - `Future_DatePicker` -> `DatePicker`
    - `Future_DatePickerProps` -> `DatePickerProps`
    - `Future_DatePickerClassKey` -> `DatePickerClassKey`
    - `Future_DatePickerField` -> `DatePickerField`
    - `Future_DatePickerFieldProps` -> `DatePickerFieldProps`

    DateRangePicker:
    - `Future_DateRangePicker` -> `DateRangePicker`
    - `Future_DateRangePickerProps` -> `DateRangePickerProps`
    - `Future_DateRangePickerClassKey` -> `DateRangePickerClassKey`
    - `Future_DateRangePickerField` -> `DateRangePickerField`
    - `Future_DateRangePickerFieldProps` -> `DateRangePickerFieldProps`

    TimePicker:
    - `Future_TimePicker` -> `TimePicker`
    - `Future_TimePickerProps` -> `TimePickerProps`
    - `Future_TimePickerClassKey` -> `TimePickerClassKey`
    - `Future_TimePickerField` -> `TimePickerField`
    - `Future_TimePickerFieldProps` -> `TimePickerFieldProps`

    DateTimePicker:
    - `Future_DateTimePicker` -> `DateTimePicker`
    - `Future_DateTimePickerProps` -> `DateTimePickerProps`
    - `Future_DateTimePickerClassKey` -> `DateTimePickerClassKey`
    - `Future_DateTimePickerField` -> `DateTimePickerField`
    - `Future_DateTimePickerFieldProps` -> `DateTimePickerFieldProps`

    **If your theme is using `defaultProps` or `styleOverrides` for any of these components, update their component-keys:**
    - `CometAdminFutureDatePicker` -> `CometAdminDatePicker`
    - `CometAdminFutureDateRangePicker` -> `CometAdminDateRangePicker`
    - `CometAdminFutureTimePicker` -> `CometAdminTimePicker`
    - `CometAdminFutureDateTimePicker` -> `CometAdminDateTimePicker`

    **If you are using class-names to access these components' slots, update them:**
    - `CometAdminFuture_DatePicker-*` -> `CometAdminDatePicker-*`
    - `CometAdminFuture_DateRangePicker-*` -> `CometAdminDateRangePicker-*`
    - `CometAdminFuture_TimePicker-*` -> `CometAdminTimePicker-*`
    - `CometAdminFuture_DateTimePicker-*` -> `CometAdminDateTimePicker-*`

- fd5c36f: Remove `clearable` prop from `Autocomplete`, `FinalFormInput`, `FinalFormNumberInput` and `FinalFormSearchTextField`

    Those fields are now clearable automatically when not set to `required`, `disabled` or `readOnly`.

- 631540c: Rename `variant` prop of `Tooltip` to `color` and remove the `neutral` and `primary` options

    ```diff
     <Tooltip
         title="Title"
    -    variant="light"
    +    color="light"
     >
         <Info />
     </Tooltip>
    ```

    ```diff
     <Tooltip
         title="Title"
    -    variant="neutral"
     >
         <Info />
     </Tooltip>
    ```

### Minor Changes

- f066335: Add support for React 19

### Patch Changes

- Updated dependencies [f066335]
- Updated dependencies [5f1566a]
    - @comet/admin-icons@9.0.0-beta.0

## 8.20.0

### Patch Changes

- 412ed19: Prevent form components used within `Field`/`FieldContainer` from overflowing their parent
- Updated dependencies [caceff8]
    - @comet/admin-icons@8.20.0

## 8.19.0

### Minor Changes

- fff2cc2: Add support for `onBlur` and `onFocus` props to `DatePicker`, `DateRangePicker`, `DateTimePicker`, `DateTimeRangePicker` and `TimePicker`

    Errors and warnings are now correctly shown after validation in `DatePickerField`, `DateRangePickerField`, `DateTimePickerField`, `DateTimeRangePickerField` and `TimePickerField`.

- fff2cc2: Add aria-labels to the open picker buttons of date/time picker components

### Patch Changes

- @comet/admin-icons@8.19.0

## 8.18.0

### Patch Changes

- 0ce431c: Toggle filter panel when clicking on `GridFilterButton`
- d344f53: Remove Data Grid Pro usages to allow usage without the Pro version
    - @comet/admin-icons@8.18.0

## 8.17.1

### Patch Changes

- Updated dependencies [91e9a8f]
    - @comet/admin-icons@8.17.1

## 8.17.0

### Minor Changes

- 45163f1: Add DataGrid helper `useDataGridUrlState` that can be used like `useDataGridRemote` to store state as location params but for client side (non paginated) filter/sort

### Patch Changes

- @comet/admin-icons@8.17.0

## 8.16.0

### Minor Changes

- 472b496: useDataGridRemote: store sort/filter/paging state additionally to query-param in local state and fall back to it if the query-param is lost

    Avoids losing grid state, for instance, when opening an EditDialog that creates its own sub-route.

### Patch Changes

- @comet/admin-icons@8.16.0

## 8.15.0

### Minor Changes

- 39a9bb0: Add support for non-paginated apis in useDataGridExcelExport
- 5b52998: Add tooltip for childless items in closed `MainNavigation`

### Patch Changes

- cc96333: Fix FinalForm to forward submissionErrors (return from submit handler) correctly
- 180d1e3: Fix required validation for `AsyncAutocompleteField` with multiple select
- f7b9de9: Fix DataGrid singleSelect filter height to prevent autocomplete values from being truncated
- 0c2435a: Hide `filesInfoText` from FileSelect
    - @comet/admin-icons@8.15.0

## 8.14.0

### Minor Changes

- f31b52e: Add FinalFormDebug component to display React Final Form state for debugging purposes
- d0a7c96: Automatically hide the `MasterMenu` and `AppHeaderMenuButton` if only one menu item is available

### Patch Changes

- 5075f7a: Render `ToolbarBackButton` as a link for improved accessibility
    - @comet/admin-icons@8.14.0

## 8.13.0

### Patch Changes

- 60ecc0a: Store open state of `MainNavigation` in local storage and restore it on page load
- dbf8774: Don't open the mobile `MainNavigation` when resizing the window to a smaller width
    - @comet/admin-icons@8.13.0

## 8.12.0

### Minor Changes

- 12466e4: CrudContextMenu: add deleteType ("delete"|"remove") that changes menu item and dialog from delete to remove for non-destructive data (relations)

### Patch Changes

- @comet/admin-icons@8.12.0

## 8.11.1

### Patch Changes

- a498b80: Fix uppercase styling of tabs
    - @comet/admin-icons@8.11.1

## 8.11.0

### Minor Changes

- 2580c61: Set cursor of DataGrid rows to "pointer" if `onRowClick` is set
- f0b1eb1: Allow passing `data-testid` to FieldContainer/Field-based fields

    This enables easier element selection in end-to-end tests (e.g., with Playwright).

    **Example usage:**

    ```ts
    <SelectField
        data-testid="test-select"
        ...
    />
    ```

- f293762: Grid: Add support for column visible=false (not just breakpoints)
- 9d5e331: Enable `@typescript-eslint/consistent-type-exports` in `@comet/eslint-config/future/react.js`
- 5337c20: Style the `button` typography variant
- ed03e8d: **Toolbar:** add `topBarActions` prop to render custom actions in the top bar, and introduce `<HelpDialogButton />` for a built-in help dialog trigger

    **What’s new**
    - `Toolbar` now supports a new prop: `topBarActions` (class key & slot name: `"topBarActions"`). Use it to place action controls on the right side of the top bar.
    - New component: `HelpDialogButton`. It renders an icon button that toggles a modal dialog with a title and rich help content.

    **Usage**

    ```tsx
    import { Toolbar, HelpDialogButton } from "@comet/admin";
    import { FormattedMessage } from "react-intl";

    <Toolbar
        topBarActions={
            <HelpDialogButton
                dialogTitle={<FormattedMessage id="toolbar.help.title" defaultMessage="Help" />}
                dialogDescription={<Typography>Put any explanatory text, images, or markup here.</Typography>}
            />
        }
    >
        {/* your toolbar items */}
    </Toolbar>;
    ```

### Patch Changes

- 198da7b: Fix pagination labels for empty DataGrids
- 9c091ec: Fix DatePicker from possibly crashing when starting to type a date
- Updated dependencies [7e34c0b]
    - @comet/admin-icons@8.11.0

## 8.10.0

### Patch Changes

- 1918d88: muiGridSortToGql: Prevent overwriting the default value defined in the GraphQL schema
    - @comet/admin-icons@8.10.0

## 8.9.0

### Patch Changes

- @comet/admin-icons@8.9.0

## 8.8.0

### Patch Changes

- @comet/admin-icons@8.8.0

## 8.7.1

### Patch Changes

- @comet/admin-icons@8.7.1

## 8.7.0

### Patch Changes

- a8e8132: Prevent `StackPageTitle` rerender loop when passing a React element as `title`
    - @comet/admin-icons@8.7.0

## 8.6.0

### Patch Changes

- 6c5578a: Remove the delay before closing the EditDialog after successful save
    - @comet/admin-icons@8.6.0

## 8.5.2

### Patch Changes

- @comet/admin-icons@8.5.2

## 8.5.1

### Patch Changes

- @comet/admin-icons@8.5.1

## 8.5.0

### Minor Changes

- c8359f6: Add Filter Count Chip to DataGrid Filter Button

### Patch Changes

- a2af2c6: `Tooltip` children are now focusable by default for improved accessibility
    - @comet/admin-icons@8.5.0

## 8.4.2

### Patch Changes

- a57d092: Prevent crash in `FinalFormSelect` when using `multiple` without initial values
    - @comet/admin-icons@8.4.2

## 8.4.1

### Patch Changes

- 9374018: Prevent crash in `FinalFormAutocomplete` when using `multiple` without initial values
    - @comet/admin-icons@8.4.1

## 8.4.0

### Minor Changes

- ff6d79a: Simplify adding an info-icon with a tooltip in `FormSection` using the new `infoTooltip` prop

    Either set the props value to a string or `FormattedMessage` directly:

    ```tsx
    <FormSection title="Title of the FormSection" infoTooltip="Title of the info tooltip">
        {/* ... */}
    </FormSection>
    ```

    Or use an object for a more detailed definition:

    ```tsx
    <FormSection
        title="FormSection"
        infoTooltip={{
            title: "Title of the info tooltip",
            description: "Description of the info tooltip",
            variant: "light",
        }}
    >
        {/* ... */}
    </FormSection>
    ```

### Patch Changes

- a85e7cb: Prevent empty `Tooltip` from rendering when `title` is `null`, `undefined`, or empty string
- ff6d79a: Allow overriding the `divider` value of the `title` slot of `FormSection` using `slotProps`

    ```tsx
    <FormSection
        title="Title of the FormSection"
        slotProps={{
            title: { divider: false },
        }}
    >
        {/* ... */}
    </FormSection>
    ```

    - @comet/admin-icons@8.4.0

## 8.3.0

### Minor Changes

- 422328b: Add backgroundImage to FullPageAlert
- 1bd73a0: Implement NoContentScopeFallback component according to design specifications
- ae1dbab: Add `description` and `customContent` props to `Tooltip`

    `description` is intended to be used together with `title` to simplify creating detailed tooltips that match the Comet design:

    ```diff
     <Tooltip
    -    title={
    -        <>
    -            <Typography variant="subtitle2">Tooltip Title</Typography>
    -            <Typography variant="body2">This is a detailed description of what's going on.</Typography>
    -        </>
    -    }
    -    sx={{ width: 180 }}
    +    title="Tooltip Title"
    +    description="This is a detailed description of what's going on."
     >
         <Info />
     </Tooltip>
    ```

    `customContent` is an alternative to `title` and `description` for use-cases that require custom elements or styling:

    ```tsx
    <Tooltip customContent={<SomethingCustom />}>
        <Info />
    </Tooltip>
    ```

### Patch Changes

- ae1dbab: Adjust styling of `Tooltip` to match the Comet design
- becc06c: The title of `FormSection` now matches the Comet design

    The prop `disableTypography` has been deprecated, use `slotProps.title` for custom styling or for setting a custom `variant` on the underlying `Typography` component.

- 12e9230: Prevent labels from overlaying and inconsistent spacings of fields

    This affects `CheckboxField`, `CheckboxListField`, `RadioGroupField`, and `SwitchField`.

- 6f30126: SelectField / FinalFormSelect: hide the clear button when the field is disabled
- d682135: AsyncAutocompleteField: fix inferred option type, commonly used in getOptionLabel
- becc06c: Deprecate `SectionHeadline`

    The component is only meant to be used internally, inside `FormSection`.
    Use the `FormSection` component with it's `title` prop to create sections in forms.
    - @comet/admin-icons@8.3.0

## 8.2.0

### Minor Changes

- ea545c4: Add `FullPageAlert` component
- dfafdb3: Add a `warning` variant to `Tooltip`

    ```tsx
    <Tooltip title="This is a warning" variant="warning">
        <WarningSolid color="warning" />
    </Tooltip>
    ```

- 08ad5fe: Add new admin component `SectionHeadline`
- 85141bf: Add new `DateTimeRangePicker` and `DateTimeRangePickerField` components

    The new components are based on the `@mui/x-date-pickers-pro` package, so you can refer to the [MUI documentation](https://v7.mui.com/x/api/date-pickers/date-time-range-picker/) for more details.
    Unlike the MUI components, these components use an object with `start` and `end` properties, both of which use a `Date` object as the value, instead of an array of two `Date` objects.

    Note: Using these components requires a [MUI X Pro license](https://v7.mui.com/x/introduction/licensing/).

    **Using the new `DateTimeRangePicker`**

    ```tsx
    import { type DateTimeRange, FieldContainer, DateTimeRangePicker } from "@comet/admin";
    import { useState } from "react";

    export const Example = () => {
        const [dateTimeRangeValue, setDateTimeRangeValue] = useState<DateTimeRange | undefined>();

        return (
            <FieldContainer label="Date-Time Range Picker">
                <DateTimeRangePicker value={dateTimeRangeValue} onChange={setDateTimeRangeValue} />
            </FieldContainer>
        );
    };
    ```

    **Using the new `DateTimeRangePickerField` in Final Form**

    ```tsx
    import { type DateTimeRange, FieldContainer, DateTimeRangePicker } from "@comet/admin";
    import { useState } from "react";

    type Values = {
        dateTimeRange: DateTimeRange;
    };

    export const Example = () => {
        return (
            <Form<Values>
                initialValues={{ dateTimeRange: { start: new Date("2025-07-23 11:30:00"), end: new Date("2025-07-25 14:30:00") } }}
                onSubmit={() => {}}
            >
                {() => <DateTimeRangePickerField name="dateTimeRange" label="Date-Time Range Picker" />}
            </Form>
        );
    };
    ```

- 0cfcf90: Allow exporting columns with value type boolean

### Patch Changes

- d7ab390: The clear-button, inside `ClearInputAdornment` can now be focused
- 01ef80b: Fix props of `Tooltip`'s `slotProps.popper` when setting custom values

    When setting custom values to `slotProps.popper`, some default props would unintentionally be reset.

- 0b08988: Prevent the `OpenPickerButton` from appearing focused while not actually being focused

    This was achieved by preventing the `OpenPickerButton` from being focused at all.
    The input value can still be changed in an accessible way, without using the picker.

    This affects the following components:
    - `DatePicker`
    - `DatePickerField`
    - `DateRangePicker`
    - `DateRangePickerField`
    - `DateTimePicker`
    - `DateTimePickerField`
    - `TimePicker`
    - `TimePickerField`
    - @comet/admin-icons@8.2.0

## 8.1.1

### Patch Changes

- @comet/admin-icons@8.1.1

## 8.1.0

### Minor Changes

- 00e6a12: Add new `Future_DateRangePicker` and `Future_DateRangePickerField` components

    These will replace the existing `DateRangePicker`, `FinalFormDateRangePicker`, and `DateRangeField` components from `@comet/admin-date-time` as a mostly drop-in replacement, the existing components have been deprecated.

    The new components are based on the `@mui/x-date-pickers-pro` package, so you can refer to the [MUI documentation](https://v7.mui.com/x/api/date-pickers/date-range-picker/) for more details.
    Unlike the MUI components, these components use an object with `start` and `end` properties, both of which use a `string` (`YYYY-MM-DD`) as the value, instead of an array of two `Date` objects, just like the existing components from `@comet/admin-date-time`.

    Note: Using these components requires a [MUI X Pro license](https://v7.mui.com/x/introduction/licensing/).

    **Using the new `DateRangePicker`**

    ```diff
    -import { FieldContainer } from "@comet/admin";
    -import { type DateRange, DateRangePicker } from "@comet/admin-date-time";
    +import { type DateRange, FieldContainer, Future_DateRangePicker as DateRangePicker } from "@comet/admin";
     import { useState } from "react";

     export const Example = () => {
         const [dateRangeValue, setDateRangeValue] = useState<DateRange | undefined>();

         return (
             <FieldContainer label="Date-Range Picker">
                 <DateRangePicker value={dateRangeValue} onChange={setDateRangeValue} />
             </FieldContainer>
         );
     };
    ```

    **Using the new `DateRangePickerField` in Final Form**

    ```diff
    -import { type DateRange, DateRangeField } from "@comet/admin-date-time";
    +import { type DateRange, Future_DateRangePickerField as DateRangePickerField } from "@comet/admin";
     import { Form } from "react-final-form";

     type Values = {
         dateRange: DateRange;
     };

     export const Example = () => {
         return (
             <Form<Values> initialValues={{ dateRange: { start: "2025-07-23", end: "2025-07-25" } }} onSubmit={() => {}}>
                 {() => (
    -                <DateRangeField name="dateRange" label="Date-Range Picker" />
    +                <DateRangePickerField name="dateRange" label="Date-Range Picker" />
                 )}
             </Form>
         );
     };
    ```

- 2f33286: Add new `Future_DateTimePicker` and `Future_DateTimePickerField` components

    These will replace the existing `DateTimePicker`, `FinalFormDateTimePicker` and `DateTimeField` components from `@comet/admin-date-time` as a mostly drop-in replacement, the existing components have been deprecated.

    The new components are based on the `@mui/x-date-pickers` package, so you can refer to the [MUI documentation](https://v7.mui.com/x/react-date-pickers/date-time-picker/) for more details.

    **Using the new `DateTimePicker`**

    ```diff
    -import { FieldContainer } from "@comet/admin";
    -import { DateTimePicker } from "@comet/admin-date-time";
    +import { Future_DateTimePicker as DateTimePicker, FieldContainer } from "@comet/admin";
     import { useState } from "react";

     export const Example = () => {
         const [dateTime, setDateTime] = useState<Date | undefined>();

         return (
             <FieldContainer label="Date-Time Picker">
                 <DateTimePicker value={dateTime} onChange={setDateTime} />
             </FieldContainer>
         );
     };
    ```

    **Using the new `DateTimePickerField` in Final Form**

    ```diff
    -import { DateTimeField } from "@comet/admin-date-time";
    +import { Future_DateTimePickerField as DateTimePickerField } from "@comet/admin";
     import { Form } from "react-final-form";

     type Values = {
         dateTime: Date;
     };

     export const Example = () => {
         return (
             <Form<Values> initialValues={{ dateTime: new Date("2025-07-23 14:30") }} onSubmit={() => {}}>
                 {() => (
    -                <DateTimeField name="dateTime" label="Date-Time Picker" />
    +                <DateTimePickerField name="dateTime" label="Date-Time Picker" />
                 )}
             </Form>
         );
     };
    ```

- ec9bce5: Add new `Future_TimePicker` and `Future_TimePickerField` components

    These will replace the existing `TimePicker`, `FinalFormTimePicker` and `TimeField` components from `@comet/admin-date-time` as a mostly drop-in replacement, the existing components have been deprecated.

    The new components are based on the `@mui/x-date-pickers` package, so you can refer to the [MUI documentation](https://v7.mui.com/x/react-date-pickers/time-picker/) for more details.
    Unlike the MUI components, these components use a 24h `string` (`HH:mm`) as the value, instead of `Date`, just like the existing components from `@comet/admin-date-time`.

    **Using the new `TimePicker`**

    ```diff
    -import { FieldContainer } from "@comet/admin";
    -import { TimePicker } from "@comet/admin-date-time";
    +import { Future_TimePicker as TimePicker, FieldContainer } from "@comet/admin";
     import { useState } from "react";

     export const Example = () => {
         const [timeValue, setTimeValue] = useState<string | undefined>();

         return (
             <FieldContainer label="Time Picker">
                 <TimePicker value={timeValue} onChange={setTimeValue} />
             </FieldContainer>
         );
     };
    ```

    **Using the new `TimePickerField` in Final Form**

    ```diff
    -import { TimeField } from "@comet/admin-date-time";
    +import { Future_TimePickerField as TimePickerField } from "@comet/admin";
     import { Form } from "react-final-form";

     type Values = {
         time: string;
     };

     export const Example = () => {
         return (
             <Form<Values> initialValues={{ time: "11:30" }} onSubmit={() => {}}>
                 {() => (
    -                <TimeField name="time" label="Time Picker" />
    +                <TimePickerField name="time" label="Time Picker" />
                 )}
             </Form>
         );
     };
    ```

- 3323fa9: Add search parameter to `loadOptions` in `AsyncAutocompleteField`, representing the current user input

    Deprecate `useAsyncOptionsProps` in favor of `AsyncSelectField` component which

- 911a6da: Renamed two props of `FinalFormSelect` to align with `FinalFormAutocomplete`
    - `noOptionsLabel` → `noOptionsText`
    - `errorLabel` → `errorText`

### Patch Changes

- e70eb31: Fix renderStaticSelectCell support for null values
    - @comet/admin-icons@8.1.0

## 8.0.0

### Major Changes

- 46edfd6: Require `intl` in `MuiThemeProvider`

    This is necessary to support translating the labels for custom Data Grid filter operators, namely "search".

    **How to upgrade**

    Make sure that `MuiThemeProvider` is wrapped by `IntlProvider` in your application:

    ```tsx
    // IntlProvider needs to be rendered before MuiThemeProvider.
    <IntlProvider locale="en" messages={getMessages()}>
        <MuiThemeProvider theme={theme}>{/* ... */}</MuiThemeProvider>
    </IntlProvider>
    ```

- 72d1a5e: New usage of `DataGridToolbar` component

    `DataGridToolbar` has been simplified to a basic wrapper component. Props and features from the standard `Toolbar` component have been removed, along with the `density` prop since density is now controlled by the `DataGrid`.

    The new usage simplifies the component structure - children can now be passed directly without needing to wrap them in `ToolbarItem` and `ToolbarActions` components:

    ```diff
    - <DataGridToolbar density="compact">
    + <DataGridToolbar>
    -     <ToolbarItem>
              <GridToolbarQuickFilter />
    -     </ToolbarItem>
    -     <ToolbarItem>
              <GridFilterButton />
    -     </ToolbarItem>
    -     <ToolbarItem>
              <GridColumnsButton />
    -     </ToolbarItem>
          <FillSpace />
    -     <ToolbarActions>
              <Button responsive variant="outlined">
                  Secondary action
              </Button>
              <Button responsive startIcon={<AddIcon />}>
                  Add item
              </Button>
    -     </ToolbarActions>
      </DataGridToolbar>
    ```

- 5b8fe2e: Update props and usage of `FeedbackButton` to be consistent with the new Comet `Button`
    - The `variant` prop now replaces its old values and the now removed `color` prop.
    - The `responsive` prop is now supported to move the button's text to a tooltip on smaller devices.
    - The previous values of `slotProps` have been removed, they can now be set through the `slotProps` of the `root` slot.

    ```diff
    - <FeedbackButton variant="contained" color="primary">
    + <FeedbackButton>
          Okay
      </FeedbackButton>
    - <FeedbackButton variant="contained" color="error">
    + <FeedbackButton variant="destructive">
          Delete
      </FeedbackButton>
    ```

- 7ce585d: Prevent the selection of DataGrid rows by clicking on them

    According to the Comet design guidelines, rows should be selected using checkboxes, with the `checkboxSelection` prop, where required.

    ```tsx
    <DataGrid
        checkboxSelection
        onRowSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
        }}
        rowSelectionModel={rowSelectionModel}
        // ...
    />
    ```

    To restore the previous behavior, set the `disableRowSelectionOnClick` prop to `false` in the individual `DataGrid` component or globally, using the theme's `defaultProps`.

    ```tsx
    <DataGrid
        disableRowSelectionOnClick
        // ...
    />
    ```

    ```tsx
    const theme = createCometTheme({
        components: {
            MuiDataGrid: {
                defaultProps: {
                    disableRowSelectionOnClick: false,
                },
            },
        },
    });
    ```

- f7429bd: Rename menu components

    To better differentiate between imports from `@comet/admin` and `@mui/material`, the following components and related types have been renamed:
    - `Menu` → `MainNavigation`
    - `MenuProps` → `MainNavigationProps`
    - `MenuClassKey` → `MainNavigationClassKey`
    - `MenuItem` → `MainNavigationItem`
    - `MenuItemProps` → `MainNavigationItemProps`
    - `MenuItemClassKey` → `MainNavigationItemClassKey`
    - `MenuCollapsibleItem` → `MainNavigationCollapsibleItem`
    - `MenuCollapsibleItemProps` → `MainNavigationCollapsibleItemProps`
    - `MenuCollapsibleItemClassKey` → `MainNavigationCollapsibleItemClassKey`
    - `IWithMenu` → `WithMainNavigation`
    - `withMenu` → `withMainNavigation`
    - `MenuItemAnchorLink` → `MainNavigationItemAnchorLink`
    - `MenuItemAnchorLinkProps` → `MainNavigationItemAnchorLinkProps`
    - `MenuItemGroup` → `MainNavigationItemGroup`
    - `MenuItemGroupClassKey` → `MainNavigationItemGroupClassKey`
    - `MenuItemGroupProps` → `MainNavigationItemGroupProps`
    - `MenuItemRouterLink` → `MainNavigationItemRouterLink`
    - `MenuItemRouterLinkProps` → `MainNavigationItemRouterLinkProps`

    Remove `MenuContext`, use the `useMainNavigation()` hook instead.

- b374300: Adapt the styling of `Alert` to match the updated Comet design

    Remove styling for the `text` variant of buttons used in `Alert`.
    Use buttons with the `outlined` variant instead to adhere to the Comet design guidelines.

    ```diff
     <Alert
         // ...
         action={
    -        <Button variant="text" startIcon={<ArrowRight />}>
    +        <Button variant="outlined" startIcon={<ArrowRight />}>
                 Action Text
             </Button>
         }
         // ...
     >
    ```

- 1d28c90: Update props and styling of `StackBackButton`, `OkayButton`, `CancelButton`, and `DeleteButton` to match the Comet `Button` component and the Comet DXP design
    - Adds support for the `responsive` prop
    - Removes the `color` prop and updates the values of the `variant` prop

- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

- 6cfc60d: SaveBoundary: rename useSavable to useSaveBoundaryState
- 717ede6: Merge `@comet/admin-theme` into `@comet/admin`

    This affects the following exports: `breakpointsOptions`, `breakpointValues`, `createCometTheme`, `createTypographyOptions`, `errorPalette`, `greyPalette`, `infoPalette`, `paletteOptions`, `primaryPalette`, `shadows`, `successPalette`, `warningPalette`.

    **Migrating your project**
    1. Remove the `@comet/admin-theme` dependency from your project
    2. Change all imports from `@comet/admin-theme` to `@comet/admin`

    ```diff
    -import { createCometTheme } from "@comet/admin-theme";
    +import { createCometTheme } from "@comet/admin";

     const theme = createCometTheme();
    ```

    3. Remove the no longer required type overrides that were previously required for the custom `Typography` variants, typically located in `admin/src/vendors.d.ts`

    ```diff
    -/// <reference types="@comet/admin-theme" />
    ```

- de6d677: Bump @mui/x-data-grid peer dependency to v7

    This has breaking changes in DataGrid.
    Follow the official [migration guide](<(https://mui.com/x/migration/migration-data-grid-v6/)>) to upgrade.

    As well, be aware if you have a date in the data grid, you will need to add a `valueGetter`

    ```diff
        <DataGrid
            //other props
            columns=[
            {
                field: "updatedAt",
                type: "dateTime",
    +            valueGetter: (params, row) => row.updatedAt && new Date(row.updatedAt)
            }]
        />
    ```

    Also, be aware if you have a `valueGetter` or `valueFormatter` in the data grid, you will need to change the arguments passing to the functions. Previously, arguments were passed as an object. Now, they are passed directly as individual parameters

    ```diff
        <DataGrid
            //other props
            columns=[
            {
                field: "updatedAt",
                type: "dateTime",
    -           valueGetter: ({params, row}) => row.updatedAt && new Date(row.updatedAt)
    +           valueGetter: (params, row) => row.updatedAt && new Date(row.updatedAt)
    -           valueFormatter: ({value}) => (value ? intl.formatDate(value, { dateStyle: "medium", timeStyle: "short" }) : ""),
    +           valueFormatter: (value) => (value ? intl.formatDate(value, { dateStyle: "medium", timeStyle: "short" }) : ""),
            }]
        />
    ```

- 15c6fa0: Remove `DialogContent` from `EditDialog` as spacing inside a dialog is not always needed in the Comet DXP design

    To maintain the existing styling of `EditDialog`, such as for forms and text, manually wrap the content with `DialogContent`. This ensures proper spacing.
    For grids or other elements that already handle their own spacing (e.g., `DataGrid`), adding `DialogContent` is not necessary.

    ```diff
        <EditDialog>
        //...
    +       <DialogContent>
    +           //...
    +       </DialogContent>
        // ...
        </EditDialog>
    ```

- 04e308a: Upgrade from MUI v5 to v7

    This only causes minimal breaking changes, see the official migration guides from MUI for details:
    - [Upgrade to MUI v6](https://mui.com/material-ui/migration/upgrade-to-v6/)
    - [Upgrade to MUI v7](https://mui.com/material-ui/migration/upgrade-to-v7/)

    To update the MUI dependencies, run the following command:

    ```sh
    npx @comet/upgrade v8/update-mui-dependencies.ts
    ```

    To run all of the recommended MUI codemods, run:

    ```sh
    npx @comet/upgrade v8/mui-codemods.ts
    ```

- a8c737b: Redesign the `ToolbarBreadcrumbs` component

    Due to internal changes, including the props and class keys, custom usages and styling may need to be adjusted.

- cfa2f85: Bump @mui/x-data-grid peer dependency to v6

    This has breaking changes in DataGrid.
    Follow the official [migration guide](<(https://mui.com/x/migration/migration-data-grid-v5)>) to upgrade.

    The `useDataGridRemote` hook has been changed to match the updated DataGrid props:

    ```diff
    - const { pageSize, page, onPageSizeChange } = useDataGridRemote();
    + const { paginationModel, onPaginationModelChange } = useDataGridRemote();
    ```

    The `muiGridSortToGql` helper now expects the columns instead of the `apiRef`:

    ```diff
    const columns : GridColDef[] = [/* column definitions */];
    const dataGridRemote = useDataGridRemote();
    const persistentColumnState = usePersistentColumnState("persistent_column_state");

    -  muiGridSortToGql(dataGridRemote.sortModel, persistentColumnState.apiRef);
    +  muiGridSortToGql(dataGridRemote.sortModel, columns);
    ```

- 15b7dd3: `DatePicker` from `@mui/x-date-pickers` is now used inside `DataGrid` filters

    This change replaces the previous `TextField` (which uses `<input type="date" />`) with `DatePicker` for an improved user experience.

    `@mui/x-date-pickers` has been added as a peer dependency and must be installed in your project's admin application.
    `LocalizationProvider` must be added to your app's root and configured with `date-fns` as the date adapter.

    `admin/package.json`

    ```diff
        "dependencies": {
    +       "@mui/x-date-pickers": "^7.29.4",
    +       "date-fns": "^4.1.0",
        }
    ```

    `admin/src/App.tsx`

    ```diff
    +import { LocalizationProvider } from "@mui/x-date-pickers";
    +import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
    +import { enUS } from "date-fns/locale";

     // ...

     <IntlProvider locale="en" messages={getMessages()}>
    +    <LocalizationProvider adapterLocale={enUS} dateAdapter={AdapterDateFns}>
             <MuiThemeProvider theme={theme}>
                 {/* ... */}
             </MuiThemeProvider>
    +    </LocalizationProvider>
     </IntlProvider>
    ```

- c5d9a47: Remove custom `secondary` color styling from `Checkbox` and `Radio`
- 4828880: Remove `trigger` prop from `Tooltip`
- 5b8fe2e: Adapt `SaveButton` and `SaveBoundarySaveButton` to look like the standard `FeedbackButton` in order to match the Comet DXP design

    Their props have been updated to match those of `FeedbackButton`:
    - `saving` has been renamed to `loading`.
    - `saveIcon` has been renamed to `startIcon`.
    - `hasConflict` has been removed. Use `hasErrors` instead and optionally provide a `tooltipErrorMessage` to show a more precise error message in the tooltip.
    - The following icon-props have been removed, as the `startIcon` is now shown in all states: `savingIcon`, `successIcon`, `errorIcon`, `conflictIcon`.
    - The following props used for the text-content have been removed as now the default text is shown in all states: `savingItem`, `successItem`, `errorItem`, `conflictItem`.

### Minor Changes

- e74ef46: `DateTimePicker` from `@mui/x-date-pickers` is now used inside `DataGrid` filters
- 9e3e943: Add error handling for asynchronous option loading in `FinalFormSelect`. When loading fails, an error message is shown in the dropdown.
- afc306b: Add the prop `noOptionsLabel ` to the `FinalFormSelect` to customize it.
- a93455f: Adapt styling of MUI's List and Menu components according to the Comet DXP design

    This affects the following components: `List`, `Menu`, `ListItem`, `MenuItem`, `ListItemButton`, `ListItemIcon`, `ListItemText`.

- d99602a: Adapt styling of MUI's `Link` according to the Comet DXP design

    Use `Link` only for links in continuous text or as standalone text links. Replace all other usages with better fitting components (e.g., `RouterLink`, `StackLink`, or `Button`).

- 5b8fe2e: Adapt multiple usages of save buttons to look like the standard `FeedbackButton` and match the Comet DXP design

    This applies to:
    - `FinalFormSaveButton`
    - `FinalFormSaveCancelButtonsLegacy`
    - `FinalFormSaveSplitButton`
    - The save button inside `TableLocalChangesToolbar`
    - The save button inside the `useSaveState` hook
    - The save button inside `MoveDamItemDialog`
    - The save button inside `createUsePage`

- afc306b: Add a default message "No options." when the FinalFormSelect has no options
- e15895a: Add new `dataGridIdColumn` column definition

    The column definition sets `filterOperators` to match the `IdFilter` GraphQL input type.

- ad9b2a3: Remove `SelectionFooter` from `FolderDataGrid` to align with the Comet DXP design

    Crud actions are performed in the `CrudMoreActionsMenu` in the toolbar instead.

- c48ca03: Add new `dataGridOneToManyColumn` column definition

    The column definition sets `filterOperators` to match the `OneToManyFilter` GraphQL input type.

- 1c62e87: Add `InlineAlert` component
- 9e3e943: Add the possibility to customize the `FinalFormSelect` error message with `errorLabel` prop.
- 06d5600: Savable: add optional checkForChanges that can return hasChanges (aka dirty) before Savable re-renders and updates the hasChanges prop

    Fixes issue in Form where a "Save changes?"-Dialog appears right after adding a new entry

- 535476e: Format numbers in `DataGrid` pagination depending on the current locale
- 34124c7: Add new `Future_DatePicker` and `Future_DatePickerField` components

    These will replace the existing `DatePicker`, `FinalFormDatePicker` and `DateField` components from `@comet/admin-date-time` as a mostly drop-in replacement, the existing components have been deprecated.

    The new components are based on the `@mui/x-date-pickers` package, so you can refer to the [MUI documentation](https://v7.mui.com/x/react-date-pickers/date-picker/) for more details.
    Unlike the MUI components, these components use a `string` (`YYYY-MM-DD`) as the value, instead of `Date`, just like the existing components from `@comet/admin-date-time`.

    **Using the new `DatePicker`**

    ```diff
    -import { FieldContainer } from "@comet/admin";
    -import { DatePicker } from "@comet/admin-date-time";
    +import { Future_DatePicker as DatePicker, FieldContainer } from "@comet/admin";
     import { useState } from "react";

     export const Example = () => {
         const [dateValue, setDateValue] = useState<string | undefined>();

         return (
             <FieldContainer label="Date Picker">
                 <DatePicker value={dateValue} onChange={setDateValue} />
             </FieldContainer>
         );
     };
    ```

    **Using the new `DatePickerField` in Final Form**

    ```diff
    -import { DateField } from "@comet/admin-date-time";
    +import { Future_DatePickerField as DatePickerField } from "@comet/admin";
     import { Form } from "react-final-form";

     type Values = {
         date: string;
     };

     export const Example = () => {
         return (
             <Form<Values> initialValues={{ date: "2025-07-23" }} onSubmit={() => {}}>
                 {() => (
    -                <DateField name="date" label="Date Picker" />
    +                <DatePickerField name="date" label="Date Picker" />
                 )}
             </Form>
         );
     };
    ```

- 09c4830: Respect SubRoute prefix in SelectionRoute and EditDialog

    This allows using multiple `EditDialog`s on the same level by wrapping them into `<RouteRoute>`.

- 66abe0a: Add new `dataGridManyToManyColumn` column definition

    The column definition sets `filterOperators` to match the `ManyToManyFilter` GraphQL input type.

- 682a674: Add support for React 18
- 77b52a8: Add `ToggleButtonGroupField` component
- 1450882: Add support for `notContains` to `StringFilter`
- 43eb598: Set the custom `DataGridPanel` as default in the theme of the `DataGrid` component

    If set, the `DataGridPanel` can now be removed from the project's theme, e.g., in `admin/src/theme.ts`:

    ```diff
    - import { DataGridPanel } from "@comet/admin";
      import { createCometTheme } from "@comet/admin-theme";
    - import type {} from "@mui/x-data-grid/themeAugmentation";

    - export const theme = createCometTheme({
    -     components: {
    -         MuiDataGrid: {
    -             defaultProps: {
    -                 components: {
    -                     Panel: DataGridPanel,
    -                 },
    -             },
    -         },
    -     },
    - });
    + export const theme = createCometTheme();
    ```

### Patch Changes

- 4182a94: Fix loading state of FinalFormSelect when loading asynchronous options
- d148091: Display FinalForm field-level validation errors after form submit
- bb3e809: Fix layout spacing in `TableComponent` footer: add missing gap between item count and pagination (“Page X of Y”)
- 400dd1e: Adapt `height` of elements in `DataGrid` depending on the `density`-prop to match the Comet DXP design
- b8817b8: Add `AppHeaderFillSpaceProps`, `ClearInputAdornmentClassKey`, `ToolbarActionButtonClassKey`, `ToolbarActionButton`, `CrudMoreActionsMenuClassKey`, `GridActionsColDef`, `GridBaseColDef`, `GridSingleSelectColDef`, and `TableDndOrderClassKey` to the public API
- eeb21ce: Allow non-full-width fields in `FieldSet`
- bf9b1bb: Fix styling of `Chip` in `CrudMoreActionsMenu` to display the full value of its label
- 12a605e: Fix closing behavior of `CollapsibleItem` if its child or sub-child is selected
- d6a004a: Fix styling of `DialogTitle`
    - The title text and the close button are now aligned correctly on mobile
    - Long titles are no longer overlapped by the close button

- Updated dependencies [13d35af]
- Updated dependencies [f904b71]
- Updated dependencies [04e308a]
- Updated dependencies [5a6efc1]
- Updated dependencies [f9c32d2]
- Updated dependencies [682a674]
    - @comet/admin-icons@8.0.0

## 8.0.0-beta.6

### Major Changes

- 15b7dd3: `DatePicker` from `@mui/x-date-pickers` is now used inside `DataGrid` filters

    This change replaces the previous `TextField` (which uses `<input type="date" />`) with `DatePicker` for an improved user experience.

    `@mui/x-date-pickers` has been added as a peer dependency and must be installed in your project's admin application.
    `LocalizationProvider` must be added to your app's root and configured with `date-fns` as the date adapter.

    `admin/package.json`

    ```diff
        "dependencies": {
    +       "@mui/x-date-pickers": "^7.29.4",
    +       "date-fns": "^4.1.0",
        }
    ```

    `admin/src/App.tsx`

    ```diff
    +import { LocalizationProvider } from "@mui/x-date-pickers";
    +import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
    +import { enUS } from "date-fns/locale";

     // ...

     <IntlProvider locale="en" messages={getMessages()}>
    +    <LocalizationProvider adapterLocale={enUS} dateAdapter={AdapterDateFns}>
             <MuiThemeProvider theme={theme}>
                 {/* ... */}
             </MuiThemeProvider>
    +    </LocalizationProvider>
     </IntlProvider>
    ```

### Minor Changes

- 9e3e943: Add error handling for asynchronous option loading in `FinalFormSelect`. When loading fails, an error message is shown in the dropdown.
- afc306b: Add the prop `noOptionsLabel ` to the `FinalFormSelect` to customize it.
- afc306b: Add a default message "No options." when the FinalFormSelect has no options
- 9e3e943: Add the possibility to customize the `FinalFormSelect` error message with `errorLabel` prop.
- 06d5600: Savable: add optional checkForChanges that can return hasChanges (aka dirty) before Savable re-renders and updates the hasChanges prop

    Fixes issue in Form where a "Save changes?"-Dialog appears right after adding a new entry

- 77b52a8: Add `ToggleButtonGroupField` component

### Patch Changes

- d6a004a: Fix styling of `DialogTitle`
    - The title text and the close button are now aligned correctly on mobile
    - Long titles are no longer overlapped by the close button
    - @comet/admin-icons@8.0.0-beta.6

## 8.0.0-beta.5

### Major Changes

- 1d28c90: Update props and styling of `StackBackButton`, `OkayButton`, `CancelButton`, and `DeleteButton` to match the Comet `Button` component and the Comet DXP design
    - Adds support for the `responsive` prop
    - Removes the `color` prop and updates the values of the `variant` prop

- 6cfc60d: SaveBoundary: rename useSavable to useSaveBoundaryState

### Minor Changes

- ad9b2a3: Remove `SelectionFooter` from `FolderDataGrid` to align with the Comet DXP design

    Crud actions are performed in the `CrudMoreActionsMenu` in the toolbar instead.

- 09c4830: Respect SubRoute prefix in SelectionRoute and EditDialog

    This allows using multiple `EditDialog`s on the same level by wrapping them into `<RouteRoute>`.

### Patch Changes

- 2cf573b: Optimize responsive behavior of `CrudMoreActionsMenu`
- 4182a94: Fix loading state of FinalFormSelect when loading asynchronous options
- bf9b1bb: Fix styling of `Chip` in `CrudMoreActionsMenu` to display the full value of its label
- Updated dependencies [5a6efc1]
    - @comet/admin-icons@8.0.0-beta.5

## 8.0.0-beta.4

### Major Changes

- 72d1a5e: New usage of `DataGridToolbar` component

    `DataGridToolbar` has been simplified to a basic wrapper component. Props and features from the standard `Toolbar` component have been removed, along with the `density` prop since density is now controlled by the `DataGrid`.

    The new usage simplifies the component structure - children can now be passed directly without needing to wrap them in `ToolbarItem` and `ToolbarActions` components:

    ```diff
    - <DataGridToolbar density="compact">
    + <DataGridToolbar>
    -     <ToolbarItem>
              <GridToolbarQuickFilter />
    -     </ToolbarItem>
    -     <ToolbarItem>
              <GridFilterButton />
    -     </ToolbarItem>
    -     <ToolbarItem>
              <GridColumnsButton />
    -     </ToolbarItem>
          <FillSpace />
    -     <ToolbarActions>
              <Button responsive variant="outlined">
                  Secondary action
              </Button>
              <Button responsive startIcon={<AddIcon />}>
                  Add item
              </Button>
    -     </ToolbarActions>
      </DataGridToolbar>
    ```

### Minor Changes

- a93455f: Adapt styling of MUI's List and Menu components according to the Comet DXP design

    This affects the following components: `List`, `Menu`, `ListItem`, `MenuItem`, `ListItemButton`, `ListItemIcon`, `ListItemText`.

- 1c62e87: Add `InlineAlert` component

### Patch Changes

- @comet/admin-icons@8.0.0-beta.4

## 8.0.0-beta.3

### Patch Changes

- @comet/admin-icons@8.0.0-beta.3

## 8.0.0-beta.2

### Major Changes

- 5b8fe2e: Update props and usage of `FeedbackButton` to be consistent with the new Comet `Button`
    - The `variant` prop now replaces its old values and the now removed `color` prop.
    - The `responsive` prop is now supported to move the button's text to a tooltip on smaller devices.
    - The previous values of `slotProps` have been removed, they can now be set through the `slotProps` of the `root` slot.

    ```diff
    - <FeedbackButton variant="contained" color="primary">
    + <FeedbackButton>
          Okay
      </FeedbackButton>
    - <FeedbackButton variant="contained" color="error">
    + <FeedbackButton variant="destructive">
          Delete
      </FeedbackButton>
    ```

- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

- 15c6fa0: Remove `DialogContent` from `EditDialog` as spacing inside a dialog is not always needed in the Comet DXP design

    To maintain the existing styling of `EditDialog`, such as for forms and text, manually wrap the content with `DialogContent`. This ensures proper spacing.
    For grids or other elements that already handle their own spacing (e.g., `DataGrid`), adding `DialogContent` is not necessary.

    ```diff
        <EditDialog>
        //...
    +       <DialogContent>
    +           //...
    +       </DialogContent>
        // ...
        </EditDialog>
    ```

- 5b8fe2e: Adapt `SaveButton` and `SaveBoundarySaveButton` to look like the standard `FeedbackButton` in order to match the Comet DXP design

    Their props have been updated to match those of `FeedbackButton`:
    - `saving` has been renamed to `loading`.
    - `saveIcon` has been renamed to `startIcon`.
    - `hasConflict` has been removed. Use `hasErrors` instead and optionally provide a `tooltipErrorMessage` to show a more precise error message in the tooltip.
    - The following icon-props have been removed, as the `startIcon` is now shown in all states: `savingIcon`, `successIcon`, `errorIcon`, `conflictIcon`.
    - The following props used for the text-content have been removed as now the default text is shown in all states: `savingItem`, `successItem`, `errorItem`, `conflictItem`.

### Minor Changes

- d99602a: Adapt styling of MUI's `Link` according to the Comet DXP design

    Use `Link` only for links in continuous text or as standalone text links. Replace all other usages with better fitting components (e.g., `RouterLink`, `StackLink`, or `Button`).

- 5b8fe2e: Adapt multiple usages of save buttons to look like the standard `FeedbackButton` and match the Comet DXP design

    This applies to:
    - `FinalFormSaveButton`
    - `FinalFormSaveCancelButtonsLegacy`
    - `FinalFormSaveSplitButton`
    - The save button inside `TableLocalChangesToolbar`
    - The save button inside the `useSaveState` hook
    - The save button inside `MoveDamItemDialog`
    - The save button inside `createUsePage`

- 535476e: Format numbers in `DataGrid` pagination depending on the current locale
- 43eb598: Set the custom `DataGridPanel` as default in the theme of the `DataGrid` component

    If set, the `DataGridPanel` can now be removed from the project's theme, e.g., in `admin/src/theme.ts`:

    ```diff
    - import { DataGridPanel } from "@comet/admin";
      import { createCometTheme } from "@comet/admin-theme";
    - import type {} from "@mui/x-data-grid/themeAugmentation";

    - export const theme = createCometTheme({
    -     components: {
    -         MuiDataGrid: {
    -             defaultProps: {
    -                 components: {
    -                     Panel: DataGridPanel,
    -                 },
    -             },
    -         },
    -     },
    - });
    + export const theme = createCometTheme();
    ```

### Patch Changes

- Updated dependencies [f904b71]
    - @comet/admin-icons@8.0.0-beta.2

## 8.0.0-beta.1

### Patch Changes

- @comet/admin-icons@8.0.0-beta.1

## 8.0.0-beta.0

### Major Changes

- 7ce585d: Prevent the selection of DataGrid rows by clicking on them

    According to the Comet design guidelines, rows should be selected using checkboxes, with the `checkboxSelection` prop, where required.

    ```tsx
    <DataGrid
        checkboxSelection
        onRowSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
        }}
        rowSelectionModel={rowSelectionModel}
        // ...
    />
    ```

    To restore the previous behavior, set the `disableRowSelectionOnClick` prop to `false` in the individual `DataGrid` component or globally, using the theme's `defaultProps`.

    ```tsx
    <DataGrid
        disableRowSelectionOnClick
        // ...
    />
    ```

    ```tsx
    const theme = createCometTheme({
        components: {
            MuiDataGrid: {
                defaultProps: {
                    disableRowSelectionOnClick: false,
                },
            },
        },
    });
    ```

- f7429bd: Rename menu components

    To better differentiate between imports from `@comet/admin` and `@mui/material`, the following components and related types have been renamed:
    - `Menu` → `MainNavigation`
    - `MenuProps` → `MainNavigationProps`
    - `MenuClassKey` → `MainNavigationClassKey`
    - `MenuItem` → `MainNavigationItem`
    - `MenuItemProps` → `MainNavigationItemProps`
    - `MenuItemClassKey` → `MainNavigationItemClassKey`
    - `MenuCollapsibleItem` → `MainNavigationCollapsibleItem`
    - `MenuCollapsibleItemProps` → `MainNavigationCollapsibleItemProps`
    - `MenuCollapsibleItemClassKey` → `MainNavigationCollapsibleItemClassKey`
    - `IWithMenu` → `WithMainNavigation`
    - `withMenu` → `withMainNavigation`
    - `MenuItemAnchorLink` → `MainNavigationItemAnchorLink`
    - `MenuItemAnchorLinkProps` → `MainNavigationItemAnchorLinkProps`
    - `MenuItemGroup` → `MainNavigationItemGroup`
    - `MenuItemGroupClassKey` → `MainNavigationItemGroupClassKey`
    - `MenuItemGroupProps` → `MainNavigationItemGroupProps`
    - `MenuItemRouterLink` → `MainNavigationItemRouterLink`
    - `MenuItemRouterLinkProps` → `MainNavigationItemRouterLinkProps`

    Remove `MenuContext`, use the `useMainNavigation()` hook instead.

- b374300: Adapt the styling of `Alert` to match the updated Comet design

    Remove styling for the `text` variant of buttons used in `Alert`.
    Use buttons with the `outlined` variant instead to adhere to the Comet design guidelines.

    ```diff
     <Alert
         // ...
         action={
    -        <Button variant="text" startIcon={<ArrowRight />}>
    +        <Button variant="outlined" startIcon={<ArrowRight />}>
                 Action Text
             </Button>
         }
         // ...
     >
    ```

- 717ede6: Merge `@comet/admin-theme` into `@comet/admin`

    This affects the following exports: `breakpointsOptions`, `breakpointValues`, `createCometTheme`, `createTypographyOptions`, `errorPalette`, `greyPalette`, `infoPalette`, `paletteOptions`, `primaryPalette`, `shadows`, `successPalette`, `warningPalette`.

    **Migrating your project**
    1. Remove the `@comet/admin-theme` dependency from your project
    2. Change all imports from `@comet/admin-theme` to `@comet/admin`

    ```diff
    -import { createCometTheme } from "@comet/admin-theme";
    +import { createCometTheme } from "@comet/admin";

     const theme = createCometTheme();
    ```

    3. Remove the no longer required type overrides that were previously required for the custom `Typography` variants, typically located in `admin/src/vendors.d.ts`

    ```diff
    -/// <reference types="@comet/admin-theme" />
    ```

- de6d677: Bump @mui/x-data-grid peer dependency to v7

    This has breaking changes in DataGrid.
    Follow the official [migration guide](<(https://mui.com/x/migration/migration-data-grid-v6/)>) to upgrade.

    As well, be aware if you have a date in the data grid, you will need to add a `valueGetter`

    ```diff
        <DataGrid
            //other props
            columns=[
            {
                field: "updatedAt",
                type: "dateTime",
    +            valueGetter: (params, row) => row.updatedAt && new Date(row.updatedAt)
            }]
        />
    ```

    Also, be aware if you have a `valueGetter` or `valueFormatter` in the data grid, you will need to change the arguments passing to the functions. Previously, arguments were passed as an object. Now, they are passed directly as individual parameters

    ```diff
        <DataGrid
            //other props
            columns=[
            {
                field: "updatedAt",
                type: "dateTime",
    -           valueGetter: ({params, row}) => row.updatedAt && new Date(row.updatedAt)
    +           valueGetter: (params, row) => row.updatedAt && new Date(row.updatedAt)
    -           valueFormatter: ({value}) => (value ? intl.formatDate(value, { dateStyle: "medium", timeStyle: "short" }) : ""),
    +           valueFormatter: (value) => (value ? intl.formatDate(value, { dateStyle: "medium", timeStyle: "short" }) : ""),
            }]
        />
    ```

- 04e308a: Upgrade to MUI v6

    This only causes minimal breaking changes, see the official [migration guide](https://mui.com/material-ui/migration/upgrade-to-v6/) for details.

    It is recommended to run the following codemods in your application:

    ```sh
    npx @mui/codemod@latest v6.0.0/list-item-button-prop admin/src
    npx @mui/codemod@latest v6.0.0/styled admin/src
    npx @mui/codemod@latest v6.0.0/sx-prop admin/src
    npx @mui/codemod@latest v6.0.0/theme-v6 admin/src/theme.ts
    ```

- a8c737b: Redesign the `ToolbarBreadcrumbs` component

    Due to internal changes, including the props and class keys, custom usages and styling may need to be adjusted.

- cfa2f85: Bump @mui/x-data-grid peer dependency to v6

    This has breaking changes in DataGrid.
    Follow the official [migration guide](<(https://mui.com/x/migration/migration-data-grid-v5)>) to upgrade.

    The `useDataGridRemote` hook has been changed to match the updated DataGrid props:

    ```diff
    - const { pageSize, page, onPageSizeChange } = useDataGridRemote();
    + const { paginationModel, onPaginationModelChange } = useDataGridRemote();
    ```

    The `muiGridSortToGql` helper now expects the columns instead of the `apiRef`:

    ```diff
    const columns : GridColDef[] = [/* column definitions */];
    const dataGridRemote = useDataGridRemote();
    const persistentColumnState = usePersistentColumnState("persistent_column_state");

    -  muiGridSortToGql(dataGridRemote.sortModel, persistentColumnState.apiRef);
    +  muiGridSortToGql(dataGridRemote.sortModel, columns);
    ```

- c5d9a47: Remove custom `secondary` color styling from `Checkbox` and `Radio`
- 4828880: Remove `trigger` prop from `Tooltip`

### Minor Changes

- 682a674: Add support for React 18

### Patch Changes

- 400dd1e: Adapt `height` of elements in `DataGrid` depending on the `density`-prop to match the Comet DXP design
- b8817b8: Add `AppHeaderFillSpaceProps`, `ClearInputAdornmentClassKey`, `ToolbarActionButtonClassKey`, `ToolbarActionButton`, `CrudMoreActionsMenuClassKey`, `GridActionsColDef`, `GridBaseColDef`, `GridSingleSelectColDef`, and `TableDndOrderClassKey` to the public API
- eeb21ce: Allow non-full-width fields in `FieldSet`
- Updated dependencies [04e308a]
- Updated dependencies [682a674]
    - @comet/admin-icons@8.0.0-beta.0

## 7.25.3

### Patch Changes

- @comet/admin-icons@7.25.3
- @comet/admin-theme@7.25.3

## 7.25.2

### Patch Changes

- @comet/admin-icons@7.25.2
- @comet/admin-theme@7.25.2

## 7.25.1

### Patch Changes

- @comet/admin-icons@7.25.1
- @comet/admin-theme@7.25.1

## 7.25.0

### Patch Changes

- @comet/admin-icons@7.25.0
- @comet/admin-theme@7.25.0

## 7.24.0

### Patch Changes

- fc900f217: Support the `disabled` prop in the `FinalFormRangeInput`
- Updated dependencies [24e046fb3]
    - @comet/admin-theme@7.24.0
    - @comet/admin-icons@7.24.0

## 7.23.0

### Patch Changes

- @comet/admin-icons@7.23.0
- @comet/admin-theme@7.23.0

## 7.22.0

### Patch Changes

- 2cf573b72: Optimize responsive behavior of `CrudMoreActionsMenu`
- 086774f01: Revert "Prevent form components used within `Field`/`FieldContainer` from overflowing their parent" introduced in v7.20.0

    This change caused the BlocksBlock to break when rendering it inside a `Field`.
    - @comet/admin-icons@7.22.0
    - @comet/admin-theme@7.22.0

## 7.21.1

### Patch Changes

- b771bd6d8: Don't delete an item when closing the delete dialog in `CrudContextMenu`
    - @comet/admin-icons@7.21.1
    - @comet/admin-theme@7.21.1

## 7.21.0

### Patch Changes

- 1a30eb858: Prevent overlapping placeholders by a non-visible clear-button
- 3e9ea613e: Fix color of button in `UndoSnackbar`
    - @comet/admin-icons@7.21.0
    - @comet/admin-theme@7.21.0

## 7.20.0

### Patch Changes

- 415a83165: Prevent form components used within `Field`/`FieldContainer` from overflowing their parent

    Select components now truncate their value with ellipsis when used within these components, consistent with their behavior in other usages.

- 99f904f81: Close `Dialog` with ESC key or backdrop click
- 2d1726543: `title` prop of the Dialog got merged with `title` Prop of `MuiDialogProps`. This lead to errors when forwarding ReactNodes to title.
    - @comet/admin-icons@7.20.0
    - @comet/admin-theme@7.20.0

## 7.19.0

### Patch Changes

- 3544127ad: Remove unintended white background on `Button` with `textDark` variant when disabled
    - @comet/admin-icons@7.19.0
    - @comet/admin-theme@7.19.0

## 7.18.0

### Patch Changes

- @comet/admin-icons@7.18.0
- @comet/admin-theme@7.18.0

## 7.17.0

### Patch Changes

- @comet/admin-icons@7.17.0
- @comet/admin-theme@7.17.0

## 7.16.0

### Patch Changes

- ec1cf3cf8: Adapt styling of `Button` variants to align with Comet DXP design
- bf7b89ffc: Adapt styling of `FieldSet` to align with Comet DXP design
- Updated dependencies [ec1cf3cf8]
    - @comet/admin-theme@7.16.0
    - @comet/admin-icons@7.16.0

## 7.15.0

### Minor Changes

- a189d4ed9: Support dynamic values for the `label` prop of `SwitchField` depending on its `checked` state

    ```tsx
    <SwitchField name="switch" label={(checked) => (checked ? "On" : "Off")} />
    ```

- 7d8c36e6c: Add the `DataGridPanel` component to replace MUIs default `Panel` used by `DataGrid` to match the Comet DXP design

    It is recommended to add this component to your theme's `defaultProps` of `MuiDataGrid`.

    Example theme configuration for `admin/src/theme.ts`:

    ```ts
    import { DataGridPanel } from "@comet/admin";
    import { createCometTheme } from "@comet/admin-theme";
    import type {} from "@mui/x-data-grid/themeAugmentation";

    export const theme = createCometTheme({
        components: {
            MuiDataGrid: {
                defaultProps: {
                    components: {
                        Panel: DataGridPanel,
                    },
                },
            },
        },
    });
    ```

- a189d4ed9: Allow passing a `ReactNode` to `fieldLabel` of `CheckboxField` and `SwitchField`

    This enables using `FormattedMessage` for the label.

    ```tsx
    <CheckboxField name="visible" fieldLabel={<FormattedMessage id="exampleForm.visible" defaultMessage="Visible" />} />
    <SwitchField name="visible" fieldLabel={<FormattedMessage id="exampleForm.visible" defaultMessage="Visible" />} />
    ```

### Patch Changes

- faa54eb8e: Fix display of warnings for forms that use both form-level and field-level validation
- 6827982fe: Preserve the default `Button` color when using the `sx` prop with the `textLight` or `textDark` variant
- Updated dependencies [7d8c36e6c]
    - @comet/admin-theme@7.15.0
    - @comet/admin-icons@7.15.0

## 7.14.0

### Minor Changes

- 6b75f20e4: Deprecate `density` prop of `DataGridToolbar`

    The density setting of the surrounding Data Grid now controls the styling of the toolbar.

### Patch Changes

- Updated dependencies [9b190db59]
- Updated dependencies [84e063642]
    - @comet/admin-theme@7.14.0
    - @comet/admin-icons@7.14.0

## 7.13.0

### Minor Changes

- bd562d325: Add `disableForcePromptRoute` option to `StackSwitch`

    This can be useful when a navigation in a switch shouldn't trigger a prompt, e.g., when navigating inside a block.

- 5c06e4bee: Reduce `MainContent` padding on mobile
- b918c810b: Add support for custom components to `CrudMoreActionsMenu`

    **Example**

    ```tsx
    const CustomAction = () => (
        <CrudMoreActionsMenuItem
            onClick={() => {
                // Perform action
            }}
        >
            <ListItemIcon>
                <Favorite />
            </ListItemIcon>
            Custom Action
        </CrudMoreActionsMenuItem>
    );

    <CrudMoreActionsMenu overallActions={[<CustomAction key="custom-action" />]} />;
    ```

    **Note:** Use the `CrudMoreActionsMenuItem` component or `CrudMoreActionsMenuContext` to close the menu after clicking an item.

### Patch Changes

- @comet/admin-icons@7.13.0
- @comet/admin-theme@7.13.0

## 7.12.0

### Minor Changes

- af51bb408: Make the width of `GridToolbarQuickFilter` responsive when used inside `DataGridToolbar`
- 92b3255d2: Hide group title in `CrudMoreActionsMenu` when only one group is present
- e8003f9c7: Add a new `FillSpace` component to replace `ToolbarFillSpace` and `AppHeaderFillSpace`

    `ToolbarFillSpace` and `AppHeaderFillSpace` are now deprecated.

- 4f6e6b011: Deprecate `FinalFormRadio` and `FinalFormCheckbox`
- 5583c9cff: Export `renderFinalFormChildren` helper
- 7da81fa2e: Add a new `Button` component to replace `ToolbarActionButton` and MUI's `Button`

    Compared to MUI's `Button` component, the `color` prop has been removed, and the `variant` prop now defines those variants, defined by the Comet design guidelines, `primary` is the default variant.

    ```diff
    -import { Button } from "@mui/material";
    +import { Button } from "@comet/admin";

     export const AllButtonVariants = () => (
         <>
    -        <Button variant="contained" color="primary">Primary</Button>
    +        <Button>Primary</Button>
    -        <Button variant="contained" color="secondary">Secondary</Button>
    +        <Button variant="secondary">Secondary</Button>
    -        <Button variant="outlined">Outlined</Button>
    +        <Button variant="outlined">Outlined</Button>
    -        <Button variant="outlined" color="error">Destructive</Button>
    +        <Button variant="destructive">Destructive</Button>
    -        <Button variant="contained" color="success">Success</Button>
    +        <Button variant="success">Success</Button>
    -        <Button variant="text" sx={{ color: "white" }}>Text Light</Button>
    +        <Button variant="textLight">Text Light</Button>
    -        <Button variant="text" sx={{ color: "black" }}>Text Dark</Button>
    +        <Button variant="textDark">Text Dark</Button>
         </>
     );
    ```

    **Responsive behavior**

    `ToolbarActionButton` is now deprecated.
    Previously, `ToolbarActionButton` would hide its text content on mobile and add it with a tooltip instead.
    This behavior can now be achieved by setting the `responsive` prop on the `Button` component.

    ```diff
    -import { ToolbarActionButton } from "@comet/admin/lib/common/toolbar/actions/ToolbarActionButton";
    +import { Button } from "@comet/admin";
     import { Favorite } from "@comet/admin-icons";

     const Example = () => {
    -    return <ToolbarActionButton startIcon={<Favorite />}>Hello</ToolbarActionButton>;
    +    return <Button responsive startIcon={<Favorite />}>Hello</Button>;
     };
    ```

### Patch Changes

- 954635630: Fix mobile styling of `AppHeaderMenuButton`
- 3ddc2278b: Adjust the spacings inside `Toolbar` and `DataGridToolbar` to match the Comet design
- 0bb181a52: `usePersistentColumnState`: Prevent Data Grids with the same name to overwrite each others pinned and column-visibility states
- Updated dependencies [47be4ebd3]
- Updated dependencies [ee597535a]
- Updated dependencies [af51bb408]
    - @comet/admin-theme@7.12.0
    - @comet/admin-icons@7.12.0

## 7.11.0

### Minor Changes

- b8b8e2747: Make `GridFilterButton` and `GridColumnsButton` responsive by moving their text to a tooltip on mobile
    - This also makes the button's styles consistent with the standard `Button` component
    - `GridFilterButton` now supports props to override the default button props

- e9f547d95: Adjust how tooltips are triggered

    This is to achieve a more consistent and user-friendly experience by ensuring tooltips are always shown when the user interacts with the underlying element.
    - When using the default `hover` trigger, tooltips will now be shown on both `hover` and `focus`. Previously, you had to choose between `hover` and `focus`.
    - The `trigger` prop is deprecated and will be removed in a future major version. The combined `hover`/`focus` trigger will be the only supported behavior.
    - Tooltips on touch devices will be shown immediately when the user starts interacting with the underlying element.

### Patch Changes

- 1e01cca21: Prevent scrolling of `DialogTitle` and `DialogActions` in `EditDialog`
- a30f0ee4d: Fix `border-color` of `InputBase` on default and hover state
- 20f63417e: Prevent the page content from overflowing the window, causing a horizontal scrollbar

    This happened when using elements like `Tabs` that are intended to be horizontally scrollable and could, therefore, be wider than the window.

- 8114a6ae7: Fix `onClick` and other props not being passed to the icon version of some button components
- Updated dependencies [9f2a1272b]
- Updated dependencies [a30f0ee4d]
- Updated dependencies [a4fcdeb51]
- Updated dependencies [5ba64aab6]
    - @comet/admin-theme@7.11.0
    - @comet/admin-icons@7.11.0

## 7.10.0

### Minor Changes

- 8f924d591: Add new custom `Dialog`

    The component extends the MUI `Dialog` component to enable common use cases:
    - The `title` prop can be used to set the dialog title
    - A close button is shown when the `onClose` is used

    **Example**

    ```tsx
    <Dialog
        title="Dialog Title"
        onClose={() => {
            // Handle dialog closing here
        }}
    />
    ```

- 6eba5abea: Add a `forceVerticalContainerSize` prop to `FieldContainer`

    Use it to define below which container size the `vertical` styling is applied when using the `horizontal` variant.

- 589b0b9ee: Enhance `FieldContainer` with `secondaryHelperText` prop and `helperTextIcon` prop
    - `helperTextIcon` displays an icon alongside the text for `helperText`, `error` or `warning`.
    - `secondaryHelperText` provides an additional helper text positioned beneath the input field, aligned to the bottom-right corner.

    **Example:**

    ```tsx
    <FieldContainer label="Helper Text Icon" helperTextIcon={<Info />} helperText="Helper Text with icon" secondaryHelperText="0/100">
        <InputBase onChange={handleChange} value={value} placeholder="Placeholder" />
    </FieldContainer>
    ```

### Patch Changes

- aa02ca13f: Fix a bug in `useDataGridExcelExport` that would cause an Excel export to fail when a cell's value was `undefined`
- 6eba5abea: Prevent unintended layout shift after the initial render of `FieldContainer` when using the `horizontal` variant
- bf6b03fe0: Fix alignment of `Alert` icon with the title
- Updated dependencies [7e94c55f6]
- Updated dependencies [22f3d402e]
- Updated dependencies [b51bf6d85]
- Updated dependencies [71876ea69]
- Updated dependencies [589b0b9ee]
    - @comet/admin-theme@7.10.0
    - @comet/admin-icons@7.10.0

## 7.9.0

### Minor Changes

- 6d6131b16: Add the `dataGridDateColumn` and `dataGridDateTimeColumn` helpers for using the "date" and "dateTime" types in Data Grid

    ```diff
    -import { GridColDef } from "@comet/admin";
    +import { GridColDef, dataGridDateColumn, dataGridDateTimeColumn } from "@comet/admin";

     // ...

     const columns: GridColDef[] = [
         {
    -       type: "date",
    -       valueGetter: ({ value }) => value && new Date(value),
    -       renderCell: ({ value }) => value && <FormattedDate value={value} dateStyle="medium" />,
    +       ...dataGridDateColumn,
            field: "createdAt",
            headerName: "Created At",
         },
         {
    -      type: "dateTime",
    -      valueGetter: ({ value }) => value && new Date(value),
    -      renderCell: ({ value }) => value && <FormattedDate value={value} dateStyle="medium" timeStyle="short" />,
    +      ...dataGridDateTimeColumn,
           field: "updatedAt",
           headerName: "Updated At",
         },
     ];
    ```

- 7cea765fe: Add UI for Impersonation Feature
    - Add indicator to display when impersonation mode is active in `UserHeaderItem`
    - Add button to allow users to switch on impersonation in the `UserGrid`
    - Integrate `CrudMoreActionsMenu` in `UserPageToolbar` with an impersonation entry for easy access to this feature.
    - Add `ImpersonateUser` icon

### Patch Changes

- 48cac4dac: Fix styling issues of inputs like `FinalFormInput`, `FinalFormNumberInput`, `FinalFormSelect`, `TextAreaField`
    - Change background-color, border-color and color of the label for different states (`default`, `disabled` and `focused`).
    - For required inputs, fix spacing between the label and asterisk.
    - Fix font-weight and margin of `helperText`.

- 0919e3ba6: Remove right padding from form fields without an end adornment
- Updated dependencies [7cea765fe]
- Updated dependencies [48cac4dac]
- Updated dependencies [55d40ef08]
- Updated dependencies [9aa6947b7]
    - @comet/admin-icons@7.9.0
    - @comet/admin-theme@7.9.0

## 7.8.0

### Minor Changes

- 139616be6: Add `FullHeightContent` component

    Used to help components take advantage of all the available content height, e.g., when using a `DataGrid` inside `Tabs` already contained in a `MainContent` component.

    Usage example for `FullHeightContent`:

    ```tsx
    <MainContent>
        <RouterTabs>
            <RouterTab label="DataGrid Example" path="">
                <FullHeightContent>
                    <DataGrid />
                </FullHeightContent>
            </RouterTab>
            <RouterTab label="Another tab" path="/another-tab">
                Content of another tab
            </RouterTab>
        </RouterTabs>
    </MainContent>
    ```

    Example where `MainContent` with `fullHeight` should be used, instead of `FullHeightContent`:

    ```tsx
    <MainContent fullHeight>
        <DataGrid />
    </MainContent>
    ```

- d8fca0522: Add second `InitialFormValues` generic to `FinalForm`

    This allows differentiating between a form's values and initial values.

- d8298d59a: Add the `StackMainContent` component

    This version of `MainContent` only adds content spacing and height when it's the last visible `StackSwitch`.
    Using `StackMainContent` instead of `MainContent` prevents unintended or duplicate spacings in cases where multiple `MainContent` components are used inside nested `StackSwitch` components.

### Patch Changes

- a168e5514: Open collapsible menu item on refresh if its child or sub-child is selected
- e16ad1a02: Fix a bug that prevented dynamically rendered tabs in `Tabs`
- 139616be6: Fix the `fullHeight` behavior of `MainContent`

    When used inside certain elements, e.g. with `position: relative`, the height would be calculated incorrectly.

- eefb0546f: Render empty values correctly when using `renderStaticSelectCell` as a `DataGrid` column's `renderCell` function
- 795ec73d9: Fix the spacing between the text and chip in `CrudMoreActionsMenu`
- 8617c3bcd: Fix URL prefix in `SubRouteIndexRoute`
- daacf1ea6: Fix a bug in `ToolbarBreadcrumbs` where it was possible to open the mobile breadcrumbs menu when there were no items to be shown in the menu
- 9cc75c141: Prevent the width of the mobile breadcrumbs menu of `ToolbarBreadcrumbs` from being far too small
- Updated dependencies [e78315c9c]
- Updated dependencies [c6d3ac36b]
    - @comet/admin-icons@7.8.0
    - @comet/admin-theme@7.8.0

## 7.7.0

### Patch Changes

- @comet/admin-icons@7.7.0
- @comet/admin-theme@7.7.0

## 7.6.0

### Minor Changes

- bc19fb18c: `useDataGridExcelExport`: Add support for `number` and `null` values in the Data Grid Excel export without the need for a `valueFormatter`
- 00d7ddae1: Allow hiding the header (summary) of `FieldSet` by making the `title` prop optional

### Patch Changes

- 37d71a89a: Fix hover styling of `ToolbarBackButton`
- cf2ee898f: Fix missing key error in `CrudMoreActionsMenu`
- 03afcd073: Allow customizing `CrudContextMenu`

    Customize existing parts of `CrudContextMenu` using the `slotProps`, `iconMapping` and `messagesMapping` props.
    Add custom actions by adding instances of `RowActionsItem` to the `children`:

    ```tsx
    <CrudContextMenu
    // ...
    >
        <RowActionsItem
            icon={<Favorite />}
            onClick={() => {
                // Do something
            }}
        >
            Custom action
        </RowActionsItem>
        <Divider />
    </CrudContextMenu>
    ```

- fe8909404: Slightly adjust the color of the clear button of inputs to match the Comet CI
    - @comet/admin-icons@7.6.0
    - @comet/admin-theme@7.6.0

## 7.5.0

### Minor Changes

- bb7c2de72: Adapt the `DeleteDialog` in `CrudContextMenu` to match the updated Comet CI
- c59a60023: Add a `CrudMoreActionsMenu` component

    The component can be used to create a "More actions" menu for a list of items.
    It is typically used in a toolbar above a Data Grid.

    **Example**

    ```tsx
    <CrudMoreActionsMenu
        selectionSize={selectionSize}
        overallActions={[
            {
                label: "Export to excel",
                onClick: handleExportToExcelClick,
            },
        ]}
        selectiveActions={[
            {
                label: "move",
                onClick: handleMoveClick,
                icon: <Move />,
                divider: true,
            },
            {
                label: "download",
                onClick: handleDownloadClick,
                icon: <Download />,
            },
        ]}
    />
    ```

- 4cea3e31b: Make it easier to render DataGrid cell content based on the cell's `valueOptions`

    Objects inside a cell's `valueOptions` now support an optional `cellContent` property to allow defining a React node in addition to the `label`, which can only be a string.

    When using the new `renderStaticSelectCell` helper as the `renderCell` function in the column definition, the helper will render the `cellContent` node of the selected option if defined.
    The `label` or the string value of the option will be used as the cell's content if no `cellContent` node is provided.

    The following example would behave as follows:
    - If the cell's value is "Shirt", it will render the `cellContent` node (the H2 Typography)
    - If the cell's value is "Cap", it will render the `label` (the string "This Cap")
    - If the cell's value is anything else, it will render the value as a string, e.g. "Tie"

    ```tsx
    {
        headerName: "Category",
        field: "category",
        valueOptions: [
            {
                value: "Shirt",
                label: "Shirt"
                cellContent: (
                    <Typography variant="h2">
                        A Shirt
                    </Typography>
                ),
            },
            {
                value: "Cap",
                label: "This Cap",
            },
            "Tie",
        ],
        renderCell: renderStaticSelectCell,
    }
    ```

- 216d93a10: File Uploads: Add image endpoint

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

- 9a6a64ef3: Fix a bug where the initial values of `RadioGroupField` and `CheckboxListField` would not be shown in the input
- b5838209b: Fix an issue where the clear button of `SelectField` would be shown, even if the value is `undefined`
- c8f37fbd1: Allow setting all props of `FinalFormSelect` via `componentsProps` in `SelectField`
    - @comet/admin-icons@7.5.0
    - @comet/admin-theme@7.5.0

## 7.4.2

### Patch Changes

- @comet/admin-icons@7.4.2
- @comet/admin-theme@7.4.2

## 7.4.1

### Patch Changes

- @comet/admin-icons@7.4.1
- @comet/admin-theme@7.4.1

## 7.4.0

### Minor Changes

- 22863c202: Add an `options` prop to `SelectField` as an alternative to `children`

    Note: the behavior of the `options` prop differs from `FinalFormSelect` and is only intended to work with static options.
    Use the existing `AsyncSelectField` for dynamic options.
    - Each option must have the `value` and `label` properties. A custom structure is not supported.
    - There are no `getOptionLabel` and `getOptionValue` props. The `label` and `value` properties are used directly.
    - The value stored in the form state is the `value` property, not the whole option object.

    ```tsx
    const options: SelectFieldOption[] = [
        { value: "chocolate", label: "Chocolate" },
        { value: "strawberry", label: "Strawberry" },
        { value: "raspberry", label: "Raspberry", disabled: true },
    ];

    // ...

    <SelectField name="flavor" label="Select a flavor" options={options} fullWidth />;
    ```

- cab7c427a: Add support for downloading previously uploaded files to `FileUploadField`
- 1ca46e8da: Add support for `badgeContent` prop in `MenuItemRouterLink`

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

- 1ca46e8da: Extend `MenuItemAnchorLink` to define a correctly styled `LinkExternal` icon if no `secondaryAction` is passed
- bef162a60: Add possibility for uncontrolled (promise-based) behavior to `FeedbackButton`

    Previously the `FeedbackButton` was controlled by the props `loading` and `hasErrors`. To enable more use cases and easier usage, a promise-based way was added. If neither of the mentioned props are passed, the component uses the promise returned by `onClick` to evaluate the idle, loading and error state.

- 3e013b05d: Add the ability to disable individual `CheckboxListField` and `RadioGroupField` options

    ```tsx
    const options = [
        {
            label: "Selectable",
            value: "selectable",
        },
        {
            label: "Disabled",
            value: "disabled",
            disabled: true,
        },
    ];

    const FormFields = () => (
        <>
            <CheckboxListField label="Checkbox List" name="checkboxList" options={options} />
            <RadioGroupField label="Radio Group" name="radioGroup" fullWdth options={options} />
        </>
    );
    ```

### Patch Changes

- 48d1403d7: Fix `FieldContainer` layout on first render

    Previously, `FieldContainer` displayed vertically on desktop instead of horizontally due to the container width not being available during the first render (because `ref.current` was null).
    The layout corrected itself after interacting with the field, triggering a rerender.

    Now, the rerender is triggered automatically when `ref.current` is set resulting in the correct layout from the start.

- bc1ed880a: FinalFormSelect: Fix value `0` and `false` not being clearable
    - @comet/admin-icons@7.4.0
    - @comet/admin-theme@7.4.0

## 7.3.2

### Patch Changes

- 2286234e5: Update required validator in `Field` to correctly handle falsey values

    Previously, the validator incorrectly returned errors for all falsey values, e.g. the number `0`.
    Now, it only returns an error for `undefined`, `null`, `false` and empty strings.
    - @comet/admin-icons@7.3.2
    - @comet/admin-theme@7.3.2

## 7.3.1

### Patch Changes

- 91bfda996: Fix validation for `NumberField` and `FinalFormNumberInput` by calling the `onBlur` event, passed in by the `Field`
    - @comet/admin-icons@7.3.1
    - @comet/admin-theme@7.3.1

## 7.3.0

### Patch Changes

- 6a1310cf6: Deprecate FinalForm components where a Field component exists as a simpler alternative
    - Use `<AutocompleteField />` instead of `<Field component={FinalFormAutocomplete} />`
    - Use `<CheckboxField />` instead of `<Field />` with `<FormControlLabel />` and `<FinalFormCheckbox />`
    - Use `<AsyncAutocompleteField />` instead of `<Field component={FinalFormAsyncAutocomplete} />`
    - Use `<AsyncSelectField />` instead of `<Field component={FinalFormAsyncSelect} />`
    - Use `<NumberField />` instead of `<Field component={FinalFormNumberInput} />`
    - Use `<SearchField />` instead of `<Field component={FinalFormSearchTextField} />`
    - Use `<SelectField />` instead of `<Field />` with `<FinalFormSelect />`
    - Use `<SwitchField />` instead of `<Field />` with `<FormControlLabel />` and `<FinalFormSwitch />`
    - Use `<DateField />` instead of `<Field component={FinalFormDatePicker} />`
    - Use `<DateRangeField />` instead of `<Field component={FinalFormDateRangePicker} />`
    - Use `<DateTimeField />` instead of `<Field component={FinalFormDateTimePicker} />`
    - Use `<TimeField />` instead of `<Field component={FinalFormTimePicker} />`
    - Use `<TimeRangeField />` instead of `<Field component={FinalFormTimeRangePicker} />`
    - Use `<ColorField />` instead of `<Field component={FinalFormColorPicker} />`

- Updated dependencies [5364ecb37]
- Updated dependencies [a1f4c0dec]
- Updated dependencies [2ab7b688e]
    - @comet/admin-icons@7.3.0
    - @comet/admin-theme@7.3.0

## 7.2.1

### Patch Changes

- @comet/admin-icons@7.2.1
- @comet/admin-theme@7.2.1

## 7.2.0

### Minor Changes

- 0fb8d9a26: Allow pinning DataGrid columns using the column config when using `DataGridPro` or `DataGridPremium` with the `usePersistentColumnState` hook

    ```tsx
    const columns: GridColDef[] = [
        {
            field: "title",
            pinned: "left",
        },
        // ... other columns
        {
            field: "actions",
            pinned: "right",
        },
    ];
    ```

### Patch Changes

- 4b267f90d: Fix broken export/import of `commonErrorMessages` from the file form field
- Updated dependencies [9b800c9f6]
    - @comet/admin-theme@7.2.0
    - @comet/admin-icons@7.2.0

## 7.1.0

### Minor Changes

- 04844d39e: Adjust the alignment and spacing of the label, the input, and child fields inside `FieldContainer` and `Field`
- c0488eb84: Use `FeedbackButton` in `DeleteDialog` of `CrudContextMenu`

    This provides the user with feedback about the current status of the delete action.

- c1ab2b340: Add `CheckboxListField` component to make it easier to create checkbox lists in forms

    You can now do:

    ```tsx
    <CheckboxListField
        label="Checkbox List"
        name="checkboxList"
        fullWidth
        options={[
            {
                label: "Option One",
                value: "option-one",
            },
            {
                label: "Option Two",
                value: "option-two",
            },
        ]}
    />
    ```

    instead of:

    ```tsx
    <FieldContainer label="Checkbox List" fullWidth>
        <CheckboxField name="checkboxList" label="Checkbox one" value="checkbox-one" />
        <CheckboxField name="checkboxList" label="Checkbox two" value="checkbox-two" />
    </FieldContainer>
    ```

- 99a1f0ae6: Add `RadioGroupField` component to make it easier to create radio group fields in forms

    You can now do:

    ```tsx
    <RadioGroupField
        label="Radio"
        name="radio"
        fullWidth
        options={[
            {
                label: "Option One",
                value: "option-one",
            },
            {
                label: "Option Two",
                value: "option-two",
            },
        ]}
    />
    ```

    instead of:

    ```tsx
    <FieldContainer label="Radio" fullWidth>
        <Field name="radio" type="radio" value="option-one">
            {(props) => <FormControlLabel label="Option One" control={<FinalFormRadio {...props} />} />}
        </Field>
        <Field name="radio" type="radio" value="option-two">
            {(props) => <FormControlLabel label="Option Two" control={<FinalFormRadio {...props} />} />}
        </Field>
    </FieldContainer>
    ```

- edf14d066: Add the `disableSlider` prop to `FinalFormRangeInput` to disable the slider and only show the input fields

    ```tsx
    <Field name="numberRange" label="Range Input" component={FinalFormRangeInput} min={0} max={100} disableSlider />
    ```

- c050f2242: Make the separator of `FinalFormRangeInput` overridable using the `separator` prop and change the default to the string "to"

    Example to restore the previous separator:

    ```tsx
    <Field name="numberRange" label="Range Input" component={FinalFormRangeInput} min={0} max={100} separator="-" />
    ```

### Patch Changes

- dfc4a7fff: Adjust the spacing of `FinalFormRangeInput` to align with other inputs
- 39ab15616: Fix the behavior of `FinalFormRangeInput` when the `min` and `max` values are inverted

    Previously, e.g., when the `min` value was changed to something greater than the `max` value, the `min` value would be set to the same as the max value.
    Now, the `min` and `max` values are swapped.

- 2b68513be: Fix the alignment of the input inside `FieldContainer` and `Field` when there is no label with `variant="horizontal"`
- 374f383ba: Increase `Toolbar` padding left and right from 10px to 20px
- Updated dependencies [3adf5fecd]
- Updated dependencies [04844d39e]
- Updated dependencies [c90ae39d4]
- Updated dependencies [b1bbd6a0c]
    - @comet/admin-theme@7.1.0
    - @comet/admin-icons@7.1.0

## 7.0.0

### Major Changes

- 949356e84: Remove `clearable` prop from `FinalFormSelect` and `FinalFormAsyncSelect`

    `FinalFormSelect` and `FinalFormAsyncSelect` are now clearable when `required` is not set.

- 51a0861d8: Create a subroute by default in `SaveBoundary`

    The default path is `./save`, you can change it using the `subRoutePath` prop.

- 73140014f: Change theming method of `Menu`
    - Rename `permanent` class-key to `permanentDrawer` and `temporary` class-key to `temporaryDrawer`
    - Replace the `permanentDrawerProps` and `temporaryDrawerProps` props with `slotProps`

- 9a4530b06: Remove the `listItem` class key from `MenuCollapsibleItemClassKey` due to a larger overhaul of the menu components
- dc8bb6a99: Remove the `openedIcon` and `closedIcon` props from `MenuCollapsibleItem` and add `iconMapping` instead

    The icon shown as the collapse indicator will be chosen from `iconMapping`, depending on the collapsed states of the Menu and the Item.

- 8cc51b368: Remove `popoverProps` from `AppHeaderDropdown`

    Use `slotProps.popover` instead.

- 6054fdcab: Remove the `requiredSymbol` prop from `FieldContainer` and use MUIs native implementation

    This prop was used to display a custom required symbol next to the label of the field. We now use the native implementation of the required attribute of MUI to ensure better accessibility and compatibility with screen readers.

- d0869ac82: Rework `Toolbar`
    - The `Toolbar` is now split into a top and a bottom bar.

        The top bar displays a scope indicator and breadcrumbs. The bottom bar behaves like the old `Toolbar`.

    - The styling of `Toolbar`, `ToolbarItem`, `ToolbarActions`, `ToolbarAutomaticTitleItem` and `ToolbarBackButton` was adjusted

    - The new `ToolbarActionButton` should be used for buttons inside the `ToolbarActions`

        It automatically switches from a normal `Button` to an `IconButton` for smaller screen sizes.

    - To show a scope indicator, you must pass a `<ContentScopeIndicator />` to the `Toolbar` via the `scopeIndicator` prop

- 9a4530b06: Remove `temporaryDrawerProps`, `permanentDrawerProps`, `temporaryDrawerPaperProps` and `permanentDrawerPaperProps` props from `Menu` component.

    Use `slotProps` instead.

- 47ec528a4: Remove the `FieldContainerComponent` component

    `FieldContainerComponent` was never intended to be exported, use `FieldContainer` instead.

- 956111ab2: Rename the `FilterBarMoveFilersClassKey` type to `FilterBarMoreFiltersClassKey`
- 19eaee4ca: Remove the `disabled` class-key in `TabScrollButton`

    Use the `:disabled` selector instead when styling the disabled state.

- 9a4530b06: Remove the `MenuLevel` type

    The type can be used from `MenuItemProps['level']` instead, if necessary.

- 04ed68cc9: Remove the `components` and `componentProps` props from `CopyToClipboardButton`

    Instead, for the icons, use the `copyIcon` and `successIcon` props to pass a `ReactNode` instead of separately passing in values to the `components` and `componentProps` objects.
    Use `slotPops` to pass props to the remaining elements.

- 61b2acfb2: Add `FeedbackButton` component
- 2a7bc765c: Replace the `componentsProps` prop with `slotProps` in `FieldSet`
- 27efe7bd8: `FinalFormFileSelect` is now a simple final form wrapper around `FileSelect`

    Props now mirror those of `FileSelect` and are passed through to the `FileSelect` component.
    Setting `defaultProps` in the theme must now be done with `CometAdminFileSelect` instead of `CometAdminFinalFormFileSelect`.

    Class keys have been removed. Apply custom styling to `CometAdminFileSelect` instead of `FinalFormFileSelect`.

    The default value for `maxSize` has been removed.
    You may want to set the previous default value of 50 MB explicitly.

    ```diff
     <Field
         name="files"
         label="Files"
         component={FinalFormFileSelect}
    +    maxSize={50 * 1024 * 1024} // 50 MB
     />
    ```

    The `disableDropzone` prop has been removed.
    Use `slotProps.dropzone.hideDroppableArea` instead.

    ```diff
     <Field
         name="files"
         label="Files"
         component={FinalFormFileSelect}
    -    disableDropzone
    +    slotProps={{
    +        dropzone: {
    +            hideDroppableArea: true,
    +        },
    +    }}
     />
    ```

    The `disableSelectFileButton` prop has been removed.
    Use `slotProps.dropzone.hideButton` instead.

    ```diff
     <Field
         name="files"
         label="Files"
         component={FinalFormFileSelect}
    -    disableSelectFileButton
    +    slotProps={{
    +        dropzone: {
    +            hideButton: true,
    +        },
    +    }}
     />
    ```

- b87c3c292: Replace the `componentsProps` prop with `slotProps` in `InputWithPopper` and remove the `InputWithPopperComponentsProps` type
- 2a7bc765c: Remove the `message` class-key from `Alert`

    Use the `.MuiAlert-message` selector instead to style the message of the underlying MUI `Alert` component.

- d2e64d1ec: Remove the `paper` class-key from `FilterBarPopoverFilter`

    Instead of using `styleOverrides` for `paper` in the theme, use the `slotProps` and `sx` props.

- 241249bd4: Remove the `disabled` and `focusVisible` class-keys and rename the `inner` class-key to `content` in `AppHeaderButton`

    Use the `:disabled` selector instead when styling the disabled state.
    Use the `:focus` selector instead when styling the focus state.

- be4e6392d: Remove `endAdornment` prop from `FinalFormSelect` component

    The reason were conflicts with the clearable prop. This decision was based on the fact that MUI doesn't support endAdornment on selects (see: [mui/material-ui#17799](https://github.com/mui/material-ui/issues/17799)), and that there are no common use cases where both `endAdornment` and `clearable` are needed simultaneously.

- a53545438: Remove the `disabled` class-key in `ClearInputButton`

    Use the `:disabled` selector instead when styling the disabled state.

- 1a1d83156: `MenuItem` no longer supports props from MUI's `ListItem` but those from `ListItemButton` instead
- a2f278bbd: Remove the `popoverPaper` class-key and rename the `popoverRoot` class-key to `popover` in `AppHeaderDropdown`

    Instead of using `styleOverrides` for `popoverPaper` in the theme, use the `slotProps` and `sx` props.
    Use the `popover` prop instead of `popoverRoot` to override styles.

- 92eae2ba9: Change the method of overriding the styling of Admin components
    - Remove dependency on the legacy `@mui/styles` package in favor of `@mui/material/styles`.
    - Add the ability to style components using [MUI's `sx` prop](https://mui.com/system/getting-started/the-sx-prop/).
    - Add the ability to style individual elements (slots) of a component using the `slotProps` and `sx` props.
    - The `# @comet/admin syntax in the theme's `styleOverrides` is no longer supported, see: https://mui.com/material-ui/migration/v5-style-changes/#migrate-theme-styleoverrides-to-emotion

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

    - Overriding a component's styles using `withStyles` is no longer supported. Use the `sx` and `slotProps` props instead:

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

    - The module augmentation for the `DefaultTheme` type from `@mui/styles/defaultTheme` is no longer needed and needs to be removed from the admins theme file, usually located in `admin/src/theme.ts`:

    ```diff
    -declare module "@mui/styles/defaultTheme" {
    -    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    -    export interface DefaultTheme extends Theme {}
    -}
    ```

    - Class-keys originating from MUI components have been removed from Comet Admin components, causing certain class-names and `styleOverrides` to no longer be applied.
      The components `root` class-key is not affected. Other class-keys will retain the class-names and `styleOverrides` from the underlying MUI component.
      For example, in `ClearInputAdornment` (when used with `position="end"`) the class-name `CometAdminClearInputAdornment-positionEnd` and the `styleOverrides` for `CometAdminClearInputAdornment.positionEnd` will no longer be applied.
      The component will retain the class-names `MuiInputAdornment-positionEnd`, `MuiInputAdornment-root`, and `CometAdminClearInputAdornment-root`.
      Also, the `styleOverrides` for `MuiInputAdornment.positionEnd`, `MuiInputAdornment.root`, and `CometAdminClearInputAdornment.root` will continue to be applied.

        This affects the following components:
        - `AppHeader`
        - `AppHeaderMenuButton`
        - `ClearInputAdornment`
        - `Tooltip`
        - `CancelButton`
        - `DeleteButton`
        - `OkayButton`
        - `SaveButton`
        - `StackBackButton`
        - `DatePicker`
        - `DateRangePicker`
        - `TimePicker`

    - For more details, see MUI's migration guide: https://mui.com/material-ui/migration/v5-style-changes/#mui-styles

### Minor Changes

- 05ce68ec0: Add `StackToolbar`, a variant of `Toolbar` component that hides itself in a nested stack
- dc8bb6a99: Add hover effect for collapsed menu icons. This ensures that navigation is also possible in collapsed state.
- 54f775497: Add new `DataGridToolbar` component

    The "normal" `Toolbar` is meant to be used on page-level to show the current scope, breadcrumbs and page-wide action buttons (like save).
    The `DataGridToolbar`, however, is meant to be used in DataGrids to contain a search input, filter options, bulk actions and an add button.

    You can use it like this:

    ```tsx
    <DataGrid
        // ...
        components={{
            Toolbar: () => <DataGridToolbar>{/* ... */}</DataGridToolbar>,
        }}
    />
    ```

- e3efdfcc3: Add the ability to change by which fields a DataGrid column is sorted using `sortBy` in the column definition

    This can be useful for custom columns that do not represent an actual field in the data, e.g., columns that render the data of multiple fields.

    ```tsx
    const columns: GridColDef[] = [
        {
            field: "fullName",
            sortBy: ["firstName", "lastName"],
            renderCell: ({ row }) => `${row.firstName} ${row.lastName}`,
        },
    ];
    ```

- 02d33e230: Show icons in permanent menu even in closed state.
- a0bd09afa: Add `ForcePromptRoute`, a `Route` that triggers a prompt even if it is a subroute

    Used in `StackSwitch` so that navigating to a nested stack subpage will show a prompt (if dirty)

- c46146cb3: Add new `FileSelect`, `FileDropzone` and `FileSelectListItem` components

    `FileSelect` combines `FileDropzone` and `FileSelectListItem` to handle the user's selection of files, display those files below, and handle the download and removal actions.

    `FileDropzone` is a wrapper around [react-dropzone](https://www.npmjs.com/package/react-dropzone) that manages error and disabled states.

    `FileSelectListItem` is used to display a list of files, including loading, skeleton, and error states and options to download and delete the file.

- 758c65656: Only use horizontal layout in `FieldContainer` when it exceeds `600px` in width
- 0263a45fa: Add the ability to make `DataGrid` columns responsive by setting the `visible` property of the column definition to a media query

    This can be used to hide certain columns on smaller screens and show a combined column instead.

    This will only work when using `usePersistentColumnState` with `DataGridPro`/`DataGridPremium`.
    When defining the columns, use the `GridColDef` type from `@comet/admin` instead of `@mui/x-data-grid`.

    ```ts
    const columns: GridColDef[] = [
        {
            field: "fullName",
            visible: theme.breakpoints.down("md"),
        },
        {
            field: "firstName",
            visible: theme.breakpoints.up("md"),
        },
        {
            field: "lastName",
            visible: theme.breakpoints.up("md"),
        },
    ];
    ```

- 4ca4830f3: Router Prompt: actively reset form state when choosing discard in the prompt dialog
- 3397ec1b6: Add the `GridCellContent` component

    Used to display primary and secondary texts and an icon in a `DataGrid` cell using the columns `renderCell` function.

    ```tsx
    const columns: GridColDef[] = [
        {
            field: "title",
            renderCell: ({ row }) => <GridCellContent>{row.title}</GridCellContent>,
        },
        {
            field: "overview",
            renderCell: ({ row }) => <GridCellContent primaryText={row.title} secondaryText={row.description} icon={<Favorite />} />,
        },
    ];
    ```

- 20b2bafd8: Add setting `signInUrl` to `createErrorDialogApolloLink`
- 51a0861d8: Support relative paths in `SubRoute` component using `./subroute` notation
- 9c4b7c974: Add support for third level menu items. Collapsible items can be nested in each other, which creates subsubitems.
- 774977311: Add `GridColumnsButton`

    This button opens a panel to hide or show columns of `DataGrid`, similar to MUIs `GridToolbarColumnsButton`.

- f8114cd39: Pass `required` prop to children of `Field` component
- 569ad0463: Deprecate `SplitButton`, `FinalFormSaveSplitButton` and `SplitButtonContext` and remove all uses of these components in our libraries

    The reason is that we decided to retire the SplitButton pattern.

- 170720b0c: Stack: Update parent breadcrumb URL in state to not forget filters and other states when going back
- f06f4bea6: Add `MenuItemGroup` component to group menu items

    **Example:**

    ```tsx
    <MenuItemGroup title="Some item group title">
        <MenuItemRouterLink primary="Menu item 1" icon={<Settings />} to="/menu-item-1" />
        <MenuItemRouterLink primary="Menu item 2" icon={<Settings />} to="/menu-item-2" />
        <MenuItemRouterLink primary="Menu item 3" icon={<Settings />} to="/menu-item-3" />
        {/* Some more menu items... */}
    </MenuItemGroup>
    ```

- 119714999: Automatically set `fullWidth` for `FieldContainer` with `variant="horizontal"`

    Horizontal fields are automatically responsive:
    If they are less than 600px wide, the layout automatically changes to vertical.
    For this to work correctly, the fields must be `fullWidth`.
    Therefore, `fullWidth` is now `true` by default for horizontal fields.

- b0249e3bc: Add `helperIcon` prop to MenuItemGroup. Its intended purpose is to render an icon with a `Tooltip` behind the group section title, if the menu is not collapsed.

    ### Examples:

    **Render only an icon:**

    ```tsx
    <MenuItemGroup title="Group Title" helperIcon={<QuestionMark />}>
        {/* ... */}
    </MenuItemGroup>
    ```

    **Render an icon with tooltip:**

    ```tsx
    <MenuItemGroup
        title="Group Title"
        helperIcon={
            <Tooltip title="Some help text">
                <QuestionMark />
            </Tooltip>
        }
    >
        {/* ... */}
    </MenuItemGroup>
    ```

### Patch Changes

- b5753e612: Allow partial props in the theme's `defaultProps` instead of requiring all props when setting the `defaultProps` of a component
- 66330e4e6: Fix a bug where the `disabled` prop would not be passed to the children of `Field`
- Updated dependencies [803bc607f]
- Updated dependencies [33ba50719]
- Updated dependencies [33ba50719]
- Updated dependencies [c702cc5b2]
- Updated dependencies [535444623]
- Updated dependencies [33ba50719]
- Updated dependencies [f9615fbf4]
- Updated dependencies [33ba50719]
- Updated dependencies [cce88d448]
- Updated dependencies [865f253d8]
- Updated dependencies [92eae2ba9]
- Updated dependencies [33ba50719]
    - @comet/admin-theme@7.0.0
    - @comet/admin-icons@7.0.0

## 7.0.0-beta.6

### Minor Changes

- 119714999: Automatically set `fullWidth` for `FieldContainer` with `variant="horizontal"`

    Horizontal fields are automatically responsive:
    If they are less than 600px wide, the layout automatically changes to vertical.
    For this to work correctly, the fields must be `fullWidth`.
    Therefore, `fullWidth` is now `true` by default for horizontal fields.

### Patch Changes

- @comet/admin-icons@7.0.0-beta.6
- @comet/admin-theme@7.0.0-beta.6

## 7.0.0-beta.5

### Minor Changes

- 569ad0463: Deprecate `SplitButton`, `FinalFormSaveSplitButton` and `SplitButtonContext` and remove all uses of these components in our libraries

    The reason is that we decided to retire the SplitButton pattern.

### Patch Changes

- @comet/admin-icons@7.0.0-beta.5
- @comet/admin-theme@7.0.0-beta.5

## 7.0.0-beta.4

### Minor Changes

- a0bd09afa: Add `ForcePromptRoute`, a `Route` that triggers a prompt even if it is a subroute

    Used in `StackSwitch` so that navigating to a nested stack subpage will show a prompt (if dirty)

- 170720b0c: Stack: Update parent breadcrumb URL in state to not forget filters and other states when going back

### Patch Changes

- @comet/admin-icons@7.0.0-beta.4
- @comet/admin-theme@7.0.0-beta.4

## 7.0.0-beta.3

### Major Changes

- ce5eaede2: Move the `ScopeIndicator` from the `ToolbarBreadcrumbs` to the `Toolbar`

### Patch Changes

- @comet/admin-icons@7.0.0-beta.3
- @comet/admin-theme@7.0.0-beta.3

## 7.0.0-beta.2

### Minor Changes

- 2fc764e29: Add `OnChangeField` helper to listen to field changes

    **Example**

    ```tsx
    <OnChangeField name="product">
        {(value, previousValue) => {
            // Will be called when field 'product' changes
        }}
    </OnChangeField>
    ```

### Patch Changes

- Updated dependencies [2de81e40b]
    - @comet/admin-theme@7.0.0-beta.2
    - @comet/admin-icons@7.0.0-beta.2

## 7.0.0-beta.1

### Patch Changes

- @comet/admin-icons@7.0.0-beta.1
- @comet/admin-theme@7.0.0-beta.1

## 7.0.0-beta.0

### Major Changes

- 865f253d8: Add `@comet/admin-theme` as a peer dependency

    `@comet/admin` now uses the custom `Typography` variants `list` and `listItem` defined in `@comet/admin-theme`.

- 51a0861d8: Create a subroute by default in `SaveBoundary`

    The default path is `./save`, you can change it using the `subRoutePath` prop.

- 73140014f: Change theming method of `Menu`
    - Rename `permanent` class-key to `permanentDrawer` and `temporary` class-key to `temporaryDrawer`
    - Replace the `permanentDrawerProps` and `temporaryDrawerProps` props with `slotProps`

- 9a4530b06: Remove the `listItem` class key from `MenuCollapsibleItemClassKey` due to a larger overhaul of the menu components
- dc8bb6a99: Remove the `openedIcon` and `closedIcon` props from `MenuCollapsibleItem` and add `iconMapping` instead

    The icon shown as the collapse indicator will be chosen from `iconMapping`, depending on the collapsed states of the Menu and the Item.

- 6054fdcab: Remove the `requiredSymbol` prop from `FieldContainer` and use MUIs native implementation

    This prop was used to display a custom required symbol next to the label of the field. We now use the native implementation of the required attribute of MUI to ensure better accessibility and compatibility with screen readers.

- d0869ac82: Rework `Toolbar`
    - The `Toolbar` is now split into a top and a bottom bar.

        The top bar displays a scope indicator and breadcrumbs. The bottom bar behaves like the old `Toolbar`.

    - The styling of `Toolbar`, `ToolbarItem`, `ToolbarActions`, `ToolbarAutomaticTitleItem` and `ToolbarBackButton` was adjusted

    - The new `ToolbarActionButton` should be used for buttons inside the `ToolbarActions`

        It automatically switches from a normal `Button` to an `IconButton` for smaller screen sizes.

    - To show a scope indicator, you must pass a `<ContentScopeIndicator />` to the `Toolbar` via the `scopeIndicator` prop

- 9a4530b06: Remove `temporaryDrawerProps`, `permanentDrawerProps`, `temporaryDrawerPaperProps` and `permanentDrawerPaperProps` props from `Menu` component.

    Use `slotProps` instead.

- 47ec528a4: Remove the `FieldContainerComponent` component

    `FieldContainerComponent` was never intended to be exported, use `FieldContainer` instead.

- 956111ab2: Rename the `FilterBarMoveFilersClassKey` type to `FilterBarMoreFiltersClassKey`
- 19eaee4ca: Remove the `disabled` class-key in `TabScrollButton`

    Use the `:disabled` selector instead when styling the disabled state.

- 9a4530b06: Remove the `MenuLevel` type

    The type can be used from `MenuItemProps['level']` instead, if necessary.

- 04ed68cc9: Remove the `components` and `componentProps` props from `CopyToClipboardButton`

    Instead, for the icons, use the `copyIcon` and `successIcon` props to pass a `ReactNode` instead of separately passing in values to the `components` and `componentProps` objects.
    Use `slotPops` to pass props to the remaining elements.

- 61b2acfb2: Add `FeedbackButton` component
- 2a7bc765c: Replace the `componentsProps` prop with `slotProps` in `FieldSet`
- b87c3c292: Replace the `componentsProps` prop with `slotProps` in `InputWithPopper` and remove the `InputWithPopperComponentsProps` type
- 2a7bc765c: Remove the `message` class-key from `Alert`

    Use the `.MuiAlert-message` selector instead to style the message of the underlying MUI `Alert` component.

- d2e64d1ec: Remove the `paper` class-key from `FilterBarPopoverFilter`

    Instead of using `styleOverrides` for `paper` in the theme, use the `slotProps` and `sx` props.

- 241249bd4: Remove the `disabled` and `focusVisible` class-keys and rename the `inner` class-key to `content` in `AppHeaderButton`

    Use the `:disabled` selector instead when styling the disabled state.
    Use the `:focus` selector instead when styling the focus state.

- be4e6392d: Remove `endAdornment` prop from `FinalFormSelect` component

    The reason were conflicts with the clearable prop. This decision was based on the fact that MUI doesn't support endAdornment on selects (see: [mui/material-ui#17799](https://github.com/mui/material-ui/issues/17799)), and that there are no common use cases where both `endAdornment` and `clearable` are needed simultaneously.

- a53545438: Remove the `disabled` class-key in `ClearInputButton`

    Use the `:disabled` selector instead when styling the disabled state.

- 1a1d83156: `MenuItem` no longer supports props from MUI's `ListItem` but those from `ListItemButton` instead
- a2f278bbd: Remove the `popoverPaper` class-key and rename the `popoverRoot` class-key to `popover` in `AppHeaderDropdown`

    Instead of using `styleOverrides` for `popoverPaper` in the theme, use the `slotProps` and `sx` props.
    Use the `popover` prop instead of `popoverRoot` to override styles.

- 92eae2ba9: Change the method of overriding the styling of Admin components
    - Remove dependency on the legacy `@mui/styles` package in favor of `@mui/material/styles`.
    - Add the ability to style components using [MUI's `sx` prop](https://mui.com/system/getting-started/the-sx-prop/).
    - Add the ability to style individual elements (slots) of a component using the `slotProps` and `sx` props.
    - The `# @comet/admin syntax in the theme's `styleOverrides` is no longer supported, see: https://mui.com/material-ui/migration/v5-style-changes/#migrate-theme-styleoverrides-to-emotion

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

    - Overriding a component's styles using `withStyles` is no longer supported. Use the `sx` and `slotProps` props instead:

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

    - The module augmentation for the `DefaultTheme` type from `@mui/styles/defaultTheme` is no longer needed and needs to be removed from the admins theme file, usually located in `admin/src/theme.ts`:

    ```diff
    -declare module "@mui/styles/defaultTheme" {
    -    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    -    export interface DefaultTheme extends Theme {}
    -}
    ```

    - Class-keys originating from MUI components have been removed from Comet Admin components, causing certain class-names and `styleOverrides` to no longer be applied.
      The components `root` class-key is not affected. Other class-keys will retain the class-names and `styleOverrides` from the underlying MUI component.
      For example, in `ClearInputAdornment` (when used with `position="end"`) the class-name `CometAdminClearInputAdornment-positionEnd` and the `styleOverrides` for `CometAdminClearInputAdornment.positionEnd` will no longer be applied.
      The component will retain the class-names `MuiInputAdornment-positionEnd`, `MuiInputAdornment-root`, and `CometAdminClearInputAdornment-root`.
      Also, the `styleOverrides` for `MuiInputAdornment.positionEnd`, `MuiInputAdornment.root`, and `CometAdminClearInputAdornment.root` will continue to be applied.

        This affects the following components:
        - `AppHeader`
        - `AppHeaderMenuButton`
        - `ClearInputAdornment`
        - `Tooltip`
        - `CancelButton`
        - `DeleteButton`
        - `OkayButton`
        - `SaveButton`
        - `StackBackButton`
        - `DatePicker`
        - `DateRangePicker`
        - `TimePicker`

    - For more details, see MUI's migration guide: https://mui.com/material-ui/migration/v5-style-changes/#mui-styles

### Minor Changes

- 05ce68ec0: Add `StackToolbar`, a variant of `Toolbar` component that hides itself in a nested stack
- dc8bb6a99: Add hover effect for collapsed menu icons. This ensures that navigation is also possible in collapsed state.
- 54f775497: Add new `DataGridToolbar` component

    The "normal" `Toolbar` is meant to be used on page-level to show the current scope, breadcrumbs and page-wide action buttons (like save).
    The `DataGridToolbar`, however, is meant to be used in DataGrids to contain a search input, filter options, bulk actions and an add button.

    You can use it like this:

    ```tsx
    <DataGrid
        // ...
        components={{
            Toolbar: () => <DataGridToolbar>{/* ... */}</DataGridToolbar>,
        }}
    />
    ```

- e3efdfcc3: Add the ability to change by which fields a DataGrid column is sorted using `sortBy` in the column definition

    This can be useful for custom columns that do not represent an actual field in the data, e.g., columns that render the data of multiple fields.

    ```tsx
    const columns: GridColDef[] = [
        {
            field: "fullName",
            sortBy: ["firstName", "lastName"],
            renderCell: ({ row }) => `${row.firstName} ${row.lastName}`,
        },
    ];
    ```

- 02d33e230: Show icons in permanent menu even in closed state.
- 758c65656: Only use horizontal layout in `FieldContainer` when it exceeds `600px` in width
- 0263a45fa: Add the ability to make `DataGrid` columns responsive by setting the `visible` property of the column definition to a media query

    This can be used to hide certain columns on smaller screens and show a combined column instead.

    This will only work when using `usePersistentColumnState` with `DataGridPro`/`DataGridPremium`.
    When defining the columns, use the `GridColDef` type from `@comet/admin` instead of `@mui/x-data-grid`.

    ```ts
    const columns: GridColDef[] = [
        {
            field: "fullName",
            visible: theme.breakpoints.down("md"),
        },
        {
            field: "firstName",
            visible: theme.breakpoints.up("md"),
        },
        {
            field: "lastName",
            visible: theme.breakpoints.up("md"),
        },
    ];
    ```

- 4ca4830f3: Router Prompt: actively reset form state when choosing discard in the prompt dialog
- 3397ec1b6: Add the `GridCellContent` component

    Used to display primary and secondary texts and an icon in a `DataGrid` cell using the columns `renderCell` function.

    ```tsx
    const columns: GridColDef[] = [
        {
            field: "title",
            renderCell: ({ row }) => <GridCellContent>{row.title}</GridCellContent>,
        },
        {
            field: "overview",
            renderCell: ({ row }) => <GridCellContent primaryText={row.title} secondaryText={row.description} icon={<Favorite />} />,
        },
    ];
    ```

- 20b2bafd8: Add setting `signInUrl` to `createErrorDialogApolloLink`
- 51a0861d8: Support relative paths in `SubRoute` component using `./subroute` notation
- 9c4b7c974: Add support for third level menu items. Collapsible items can be nested in each other, which creates subsubitems.
- 774977311: Add `GridColumnsButton`

    This button opens a panel to hide or show columns of `DataGrid`, similar to MUIs `GridToolbarColumnsButton`.

- f8114cd39: Pass `required` prop to children of `Field` component
- f06f4bea6: Add `MenuItemGroup` component to group menu items

    **Example:**

    ```tsx
    <MenuItemGroup title="Some item group title">
        <MenuItemRouterLink primary="Menu item 1" icon={<Settings />} to="/menu-item-1" />
        <MenuItemRouterLink primary="Menu item 2" icon={<Settings />} to="/menu-item-2" />
        <MenuItemRouterLink primary="Menu item 3" icon={<Settings />} to="/menu-item-3" />
        {/* Some more menu items... */}
    </MenuItemGroup>
    ```

- b0249e3bc: Add `helperIcon` prop to MenuItemGroup. Its intended purpose is to render an icon with a `Tooltip` behind the group section title, if the menu is not collapsed.

    ### Examples:

    **Render only an icon:**

    ```tsx
    <MenuItemGroup title="Group Title" helperIcon={<QuestionMark />}>
        {/* ... */}
    </MenuItemGroup>
    ```

    **Render an icon with tooltip:**

    ```tsx
    <MenuItemGroup
        title="Group Title"
        helperIcon={
            <Tooltip title="Some help text">
                <QuestionMark />
            </Tooltip>
        }
    >
        {/* ... */}
    </MenuItemGroup>
    ```

### Patch Changes

- b5753e612: Allow partial props in the theme's `defaultProps` instead of requiring all props when setting the `defaultProps` of a component
- 66330e4e6: Fix a bug where the `disabled` prop would not be passed to the children of `Field`
- Updated dependencies [803bc607f]
- Updated dependencies [33ba50719]
- Updated dependencies [33ba50719]
- Updated dependencies [c702cc5b2]
- Updated dependencies [535444623]
- Updated dependencies [33ba50719]
- Updated dependencies [f9615fbf4]
- Updated dependencies [33ba50719]
- Updated dependencies [cce88d448]
- Updated dependencies [865f253d8]
- Updated dependencies [92eae2ba9]
- Updated dependencies [33ba50719]
    - @comet/admin-theme@7.0.0-beta.0
    - @comet/admin-icons@7.0.0-beta.0

## 6.17.1

### Patch Changes

- @comet/admin-icons@6.17.1

## 6.17.0

### Minor Changes

- 7ecc30eba: Add `color` prop to `CometLogo`

    It now supports a colored and a white version of the logo.

### Patch Changes

- 536e95c02: Fix error dialog to show GraphQL errors again

    Previously, GraphQL errors without an http status code didn't trigger an error dialog anymore.

- ec4685bf3: Prevent unintended `width: 100%` on nested `InputBase` components inside `FieldContainer` and `Field` components

    `FieldContainer` (and therefore `Field`) needs to set the with of the `InputBase` it wraps to 100%.
    This also caused deeply nested `InputBase` components, e.g., inside a `Dialog`, to get this `width` and break the styling of these components, as they are not intended to be styled by `FieldContainer`.
    - @comet/admin-icons@6.17.0

## 6.16.0

### Minor Changes

- fb0fe2539: Add `FinalFormNumberInput` and `NumberField` as optimised fields for number inputs in FinalForms

### Patch Changes

- 747fe32cc: Fix incorrect router prompt in `TableLocalChanges` when there are no changes
    - @comet/admin-icons@6.16.0

## 6.15.1

### Patch Changes

- @comet/admin-icons@6.15.1

## 6.15.0

### Patch Changes

- 0654f7bce: Handle unauthorized and unauthenticated correctly in error dialog

    The error dialog now presents screens according to the current state. Required to work in all conditions:
    - `CurrentUserProvider` must be beneath `MuiThemeProvider` and `IntlProvider` and above `RouterBrowserRouter`
    - `ErrorDialogHandler` must be parallel to `CurrentUserProvider`

- Updated dependencies [406027806]
    - @comet/admin-icons@6.15.0

## 6.14.1

### Patch Changes

- @comet/admin-icons@6.14.1

## 6.14.0

### Minor Changes

- 2fc764e29: Add `OnChangeField` helper to listen to field changes

    **Example**

    ```tsx
    <OnChangeField name="product">
        {(value, previousValue) => {
            // Will be called when field 'product' changes
        }}
    </OnChangeField>
    ```

### Patch Changes

- 012a768ee: Fix infinite update loop in `useAsyncOptionsProps`
- Updated dependencies [efccc42a3]
    - @comet/admin-icons@6.14.0

## 6.13.0

### Minor Changes

- 5e25348bb: Add a dialog option to the translation feature

    If enabled a dialog will open when pressing the translation button showing the original text and an editable translation

    Control if the dialog should be shown for the current scope via the `showApplyTranslationDialog` prop (default: true)

    ```diff
    <ContentTranslationServiceProvider
        enabled={true}
    +   showApplyTranslationDialog={true}
        translate={...}
    >
    ```

- 796e83206: Add `AutocompleteField` and `AsyncAutocompleteField` components

    **Examples**

    ```tsx
    <AutocompleteField
        name="autocomplete"
        label="Autocomplete"
        options={[
            { value: "chocolate", label: "Chocolate" },
            { value: "strawberry", label: "Strawberry" },
            { value: "vanilla", label: "Vanilla" },
        ]}
        getOptionLabel={(option: Option) => option.label}
        isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
        fullWidth
    />
    ```

    ```tsx
    <AsyncAutocompleteField
        name="asyncAutocomplete"
        label="Async Autocomplete"
        loadOptions={async () => {
            // Load options here
        }}
        getOptionLabel={(option: Option) => option.label}
        isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
        fullWidth
    />
    ```

### Patch Changes

- @comet/admin-icons@6.13.0

## 6.12.0

### Minor Changes

- 16ffa7be9: Add `FinalFormAsyncSelect`, `AsyncSelectField`, and `FinalFormAsyncAutocomplete` components

    Thin wrappers to ease using `useAsyncOptionsProps()` with `FinalFormSelect` and `FinalFormAutocomplete`.

    **Example**

    Previously:

    ```tsx
    const asyncOptionsProps = useAsyncOptionsProps(async () => {
        // Load options here
    });

    // ...

    <Field component={FinalFormAsyncAutocomplete} {...asyncOptionsProps} />;
    ```

    Now:

    ```tsx
    <Field
        component={FinalFormAsyncAutocomplete}
        loadOptions={async () => {
            // Load options here
        }}
    />
    ```

### Patch Changes

- @comet/admin-icons@6.12.0

## 6.11.0

### Minor Changes

- 8e3dec523: Change `writeClipboardText`/`readClipboardText` clipboard fallback to in-memory

    Using the local storage as a fallback caused issues when writing clipboard contents larger than 5MB.
    Changing the fallback to in-memory resolves the issue.

### Patch Changes

- @comet/admin-icons@6.11.0

## 6.10.0

### Minor Changes

- d4a269e1e: Add `filterByFragment` to replace graphql-anywhere's `filter`

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

- 52130afba: Add `FinalFormFileSelect` component

    Allows selecting files via the file dialog or using drag-and-drop.

- e938254bf: Add the `useDataGridExcelExport` hook for exporting data from a `DataGrid` to an excel file

    The hook returns an `exportApi` encompassing:
    - `exportGrid`: a function to generate and export the excel file
    - `loading`: a boolean indicating if the export is in progress
    - `error`: an error when the export has failed

### Patch Changes

- a8a098a24: muiGridFilterToGql: change fallback operator to 'and' to match MUI default
    - @comet/admin-icons@6.10.0

## 6.9.0

### Minor Changes

- e85837a17: Loosen peer dependency on `react-intl` to allow using v6

### Patch Changes

- 9ff9d66c6: Ignore local storage quota exceeded error in `writeClipboardText`
    - @comet/admin-icons@6.9.0

## 6.8.0

### Patch Changes

- @comet/admin-icons@6.8.0

## 6.7.0

### Patch Changes

- @comet/admin-icons@6.7.0

## 6.6.2

### Patch Changes

- @comet/admin-icons@6.6.2

## 6.6.1

### Patch Changes

- @comet/admin-icons@6.6.1

## 6.6.0

### Minor Changes

- 95b97d768: useDataGridRemote: Add `initialFilter` option

    **Example usage:**

    ```tsx
    const dataGridProps = useDataGridRemote({
        initialFilter: { items: [{ columnField: "description", operatorValue: "contains", value: "text" }] },
    });
    ```

### Patch Changes

- 6b04ac9a4: Fix the key for accessing the themes `styleOverrides` and `defaultProps` of `CometAdminMenu`
    - @comet/admin-icons@6.6.0

## 6.5.0

### Minor Changes

- 6cb2f9046: Add `ContentOverflow` component

    Used to wrap content that may be too large to fit its container.
    If the content is too large, it will be truncated. When clicked, the entire content will be displayed in a dialog.

    ```tsx
    <ContentOverflow>{/* Lots of content ... */}</ContentOverflow>
    ```

### Patch Changes

- @comet/admin-icons@6.5.0

## 6.4.0

### Minor Changes

- 8ce21f34b: SaveBoundary: Submit multiple Savables sequentially instead of parallel
- 811903e60: Disable the content translation feature for disabled input fields and non-text inputs

### Patch Changes

- @comet/admin-icons@6.4.0

## 6.3.0

### Patch Changes

- @comet/admin-icons@6.3.0

## 6.2.1

### Patch Changes

- @comet/admin-icons@6.2.1

## 6.2.0

### Patch Changes

- @comet/admin-icons@6.2.0

## 6.1.0

### Minor Changes

- b35bb8d1: Add basis for content translation

    Wrap a component with a `ContentTranslationServiceProvider` to add support for content translation to all underlying `FinalFormInput` inputs.

    ```tsx
    <ContentTranslationServiceProvider
        enabled={true}
        translate={async function (text: string): Promise<string> {
            return yourTranslationFnc(text);
        }}
    >
        ...
    </ContentTranslationServiceProvider>
    ```

    You can disable translation for a specific `FinalFormInput` by using the `disableContentTranslation` prop.

    ```diff
    <Field
        required
        fullWidth
        name="myField"
        component={FinalFormInput}
        label={<FormattedMessage id="myField" defaultMessage="My Field" />}
    +   disableContentTranslation
    />
    ```

- 8eb13750: Add `SaveBoundary` and `SaveBoundarySaveButton` that helps implementing multiple forms with a centralized save button

    Render a `Savable` Component anywhere below a `SaveBoundary`. For `FinalForm` this hasn't to be done manually.

- a4fac913: Rework `Alert` component
    - Use theme wherever possible
    - Move styles where they're more fitting
    - Fix some paddings

### Patch Changes

- dcfa03ca: Fix a crash when using the `Alert` component inside a MUI `Snackbar`
- Updated dependencies [08e0da09]
    - @comet/admin-icons@6.1.0

## 6.0.0

### Major Changes

- 298b63b7: FinalForm: remove default `onAfterSubmit` implementation

    In most cases the default implementation is not needed anymore. When upgrading, an empty
    function override of `onAfterSubmit` can be removed as it is not necessary any longer.

    To get back the old behavior use the following in application code:

    ```
    const stackApi = React.useContext(StackApiContext);
    const editDialog = React.useContext(EditDialogApiContext);
    ....
        <FinalForm
            onAfterSubmit={() => {
                stackApi?.goBack();
                editDialog?.closeDialog({ delay: true });
            }}
        >
    ```

- 0d768540: FinalForm: Don't handle sync submit differently than async submit
- 62779124: Change the signatures of `shouldScrollToField`, `shouldShowFieldError` and `shouldShowFieldWarning` in `FinalFormContext` to match the corresponding methods in `Field`

    The API in `FinalFormContext` was changed from

    ```tsx
    // ❌
    export interface FinalFormContext {
        shouldScrollToField: ({ fieldMeta }: { fieldMeta: FieldMetaState<any> }) => boolean;
        shouldShowFieldError: ({ fieldMeta }: { fieldMeta: FieldMetaState<any> }) => boolean;
        shouldShowFieldWarning: ({ fieldMeta }: { fieldMeta: FieldMetaState<any> }) => boolean;
    }
    ```

    to

    ```tsx
    // ✅
    export interface FinalFormContext {
        shouldScrollToField: (fieldMeta: FieldMetaState<any>) => boolean;
        shouldShowFieldError: (fieldMeta: FieldMetaState<any>) => boolean;
        shouldShowFieldWarning: (fieldMeta: FieldMetaState<any>) => boolean;
    }
    ```

    Now the corresponding methods in `Field` and `FinalFormContext` have the same signature.

### Minor Changes

- 921f6378: Add `helperText` prop to `Field` and `FieldContainer` to provide additional information

### Patch Changes

- Updated dependencies [76e50aa8]
- Updated dependencies [a525766c]
    - @comet/admin-icons@6.0.0

## 5.6.0

### Patch Changes

- @comet/admin-icons@5.6.0

## 5.5.0

### Patch Changes

- @comet/admin-icons@5.5.0

## 5.4.0

### Minor Changes

- 60a18392: Add `Alert` component

    **Example:**

    ```tsx
    import { Alert, OkayButton, SaveButton } from "@comet/admin";

    <Alert
        severity="warning"
        title="Title"
        action={
            <Button variant="text" startIcon={<ArrowRight />}>
                Action Text
            </Button>
        }
    >
        Notification Text
    </Alert>;
    ```

### Patch Changes

- ba800163: Allow passing a mix of elements and arrays to `Tabs` and `RouterTabs` as children

    For example:

    ```tsx
    <RouterTabs>
        <RouterTab label="One" path="">
            One
        </RouterTab>
        {content.map((value) => (
            <RouterTab key={value} label={value} path={`/${value}`}>
                {value}
            </RouterTab>
        ))}
        {showFourthTab && (
            <RouterTab label="Four" path="/four">
                Four
            </RouterTab>
        )}
    </RouterTabs>
    ```

    - @comet/admin-icons@5.4.0

## 5.3.0

### Minor Changes

- 60cc1b2a: Add `FieldSet` component with accordion behavior for better structuring of big forms.

### Patch Changes

- a677a162: Fix `RouterPromptHandler` to not show a prompt when navigating to a path with params that is not a sub route
- 5435b278: Fix `shouldScrollTo()`, `shouldShowError()` and `shouldShowWarning()` in `Field`

    Previously, the `meta` argument was passed to these methods incorrectly. Now, the argument is passed as defined by the typing.

- Updated dependencies [0ff9b9ba]
- Updated dependencies [0ff9b9ba]
    - @comet/admin-icons@5.3.0

## 5.2.0

### Minor Changes

- 0bed4e7c: Add optional `hasConflict` prop to `SaveButton`, `FinalFormSaveButton` and `FinalFormSaveSplitButton`

    If set to `true`, a new "conflict" display state is triggered.
    You should pass the `hasConflict` prop returned by `useSaveConflict()`, `useSaveConflictQuery()` and `useFormSaveConflict()`.

### Patch Changes

- 25daac07: Avoid remount of `RouterTab` with `forceRender={true}` when `RouterTabs` are used inside a `Stack`
- Updated dependencies [9fc7d474]
    - @comet/admin-icons@5.2.0

## 5.1.0

### Minor Changes

- 93b3d971: Extend error details in `ErrorDialog`

    Previously, uncaught errors in production environments would result in an "An error occurred" `ErrorDialog`, making the error difficult to debug.
    To improve the reproducibility of an error, we enrich the `ErrorDialog` with the following `additionalInformation`:
    - `errorType`: The type of the error, network or server error
    - `httpStatus`: The HTTP status of the request that failed
    - `url`: The URL where the error occurred
    - `timestamp`: The timestamp when the error occurred

    This information will be displayed in the `ErrorDialog` if no custom `userMessage` has been provided.
    In addition, a button has been added to allow this information to be copied to the clipboard.

### Patch Changes

- 21c30931: Fix `saveAction` in `RouterPrompt` of `FinalForm`

    The submit mutation wasn't correctly awaited if a `FinalForm` using an asynchronous validation was saved via the `saveAction` provided in the `RouterPrompt`.

    In practice, this affected `FinalForm`s within an `EditDialog`. The `EditDialog` closed before the submission was completed. All changes were omitted. The result of the submission (fail or success) was never shown.

- e33cd652: Fix `EditDialog#onAfterSave` not called on form submission

    The `onAfterSave` callback was only called when submitting a form inside an `EditDialog` by clicking the save button, but not when submitting the form by hitting the enter key.
    We fix this by adding the callback to the `EditDialogFormApi` and calling it after the form has been successfully submitted.
    - @comet/admin-icons@5.1.0

## 5.0.0

### Major Changes

- 692c8555: Replaced the `DirtyHandler` with `Prompt` (no change needed if `DirtyHandler` was only used indirectly, e.g. in Form)

    Using routes (e.g. `Tabs`) in a component with dirty handling (e.g. a `FinalForm`) is now supported

- 0f2794e7: Change the icon used in the `Loading` component from MUI's `CircularProgress` to our `BallTriangle`
- fe5e0735: Add support for multi-select to `FinalFormSelect` (via the `multiple` prop)

    Add a new `getOptionValue()` prop that can be used to extract a unique string representation for a given option. The default implementation should work in most cases.
    Remove the `getOptionSelected()` prop that is not needed anymore.

    You can find an example in [our storybook](https://storybook.comet-dxp.com/?path=/story/stories-form-finalform-fields--finalformselect)

- d0773a1a: Change styling of `FilterBar` components to be more consistent with other form components. The classes of `FilterBarMoreFilters` have changed, which may cause custom styling of this component to break.

### Minor Changes

- 2559ff74: Add CrudVisibility component for implementing visibility column in a Crud Grid
- ed692f50: Add new open and close hamburger icons and use them in the `AppHeaderMenuButton`
- 7c6eb68e: Add new `event` parameter to `FinalForm`'s `onSubmit()` method. The `navigatingBack` field of `event` simplifies implementing different navigation patterns after saving
- 4cd35441: Add a `FinalFormSaveButton` component
- a7116784: Add support for multiple `StackSwitch` on one `StackPage`

    Add a `SubRoute` wrapper for this case that needs to be added in front of the tested `StackSwitch` and do that for all composite blocks

    You can find an example in [our storybook](https://storybook.comet-dxp.com/?path=/story/comet-admin-stack--stack-nested-one-stack)

- e57c6c66: Move dashboard components from the COMET Starter to the library (`DashboardHeader`, `LatestBuildsDashboardWidget`, `LatestContentUpdatesDashboardWidget`)

### Patch Changes

- 0453c36a: Router: Fix `Switch` inside a `SubRouteIndexRoute` to allow a `Stack` inside a `Stack`'s initial page
- 987f08b3: Select: Fix default `getOptionValue()` implementation for values not being an object
- 5f0f8e6e: Correctly support `RouterTabs` in `SubRoute` by including the `subRoutePrefix` in tab paths
- d4bcab04: Fix `useSubRoutePrefix()` if used inside a `Route`
- Updated dependencies [ed692f50]
    - @comet/admin-icons@5.0.0

## 4.7.0

### Minor Changes

- fde8e42b: Add tab scrolling to make tabs responsive

### Patch Changes

- eac9990b: Fix the clear-button in `FinalFormSelect` when using it with the `multiple` prop.
    - The clear button is now only shown when at least one value is selected.
    - Clearing the value now sets it to an empty array instead of `undefined`, which would cause an error when trying to render the select.

- fe310df8: Prevent the clear-button and the select-arrow from overlapping when using `FinalFormSelect` with the `clearable` prop.
- Updated dependencies [dbdc0f55]
    - @comet/admin-icons@4.7.0

## 4.6.0

### Patch Changes

- Updated dependencies [c3b7f992]
- Updated dependencies [c3b7f992]
    - @comet/admin-icons@4.6.0

## 4.5.0

### Minor Changes

- 6d4ca5bf: Deprecate `Table` component

    The `Table` component has been deprecated in favor of [MUI X Data Grid](https://mui.com/x/react-data-grid/) in combination with `useDataGridRemote`. See [docs](https://storybook.comet-dxp.com/?path=/story/docs-components-table-basics--page) for further information.

- 07d921d2: Add a generic Loading component for use in Admin

    `Loading` handles the positioning of the loading indicator automatically, depending on the set `behaviour` prop.

### Patch Changes

- 46cf5a8b: Fix an issue that caused `useDataGridRemote()` to ignore its URL params when `queryParamsPrefix` was set
- 8a2c3302: Correctly position loading indicators by centring them using the new `Loading` component
    - @comet/admin-icons@4.5.0

## 4.4.3

### Patch Changes

- @comet/admin-icons@4.4.3

## 4.4.2

### Patch Changes

- @comet/admin-icons@4.4.2

## 4.4.1

### Patch Changes

- 662abcc9: Prevent the `MainContent` component from having an invalid height.

    This bug would cause the page tree to have no height when navigating into a page and then navigating back again.
    - @comet/admin-icons@4.4.1

## 4.4.0

### Minor Changes

- e824ffa6: Add `fullHeight` & `disablePadding` props to MainContent

    `fullHeight` makes MainContent take up the remaining space below to fill the entire page.
    This is helpful for virtualized components that need a fixed height, such as DataGrid or the PageTree.

    `disablePadding` is helpful if a component requires the `fullHeight` behaviour but should fill the entire page without the surrounding space.

- 3e15b819: Add field components to simplify the creation of forms with final-form.
    - TextField
    - TextAreaField
    - SearchField
    - SelectField
    - CheckboxField
    - SwitchField
    - ColorField
    - DateField
    - DateRangeField
    - TimeField
    - TimeRangeField
    - DateTimeField

    **Example with TextField**

    ```tsx
    // You can now do:
    <TextField name="text" label="Text" />
    ```

    ```tsx
    // Instead of:
    <Field name="text" label="Text" component={FinalFormInput} />
    ```

    **Example with SelectField**

    ```tsx
    // You can now do:
    <SelectField name="select" label="Select">
        {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
                {option.label}
            </MenuItem>
        ))}
    </SelectField>
    ```

    ```tsx
    // Instead of:
    <Field name="select" label="Select">
        {(props) => (
            <FinalFormSelect {...props}>
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </FinalFormSelect>
        )}
    </Field>
    ```

- a77da844: Add little helper for mui grid pagination (muiGridPagingToGql)

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

- @comet/admin-icons@4.4.0

## 4.3.0

### Patch Changes

- @comet/admin-icons@4.3.0

## 4.2.0

### Minor Changes

- 3567533e: Add componentsProps to EditDialog
- d25a7cbb: Allow disabling `RowActionsItem` using a `disabled` prop.

### Patch Changes

- 67e54a82: Add styling variants to Tooltip
- 7b614c13: Add styleOverrides to ToolbarAutomaticTitleItem
- aaf1586c: Fix multiple prop in FinalFormAutocomplete
    - @comet/admin-icons@4.2.0

## 4.1.0

### Minor Changes

- 51466b1a: Add initial sort to `useDataGridRemote` hook
- 51466b1a: Add optional prop `disableCloseAfterSubmit` to `EditDialog`. It prevents the default closing behavior of `EditDialog`.
- 51466b1a: Add optional prop `onAfterSave()` to `EditDialog`. It is called after successfully saving a `FinalForm` within the `EditDialog`
- 51466b1a: Added `RowActionsMenu` and `RowActionsItem` components for creating IconButtons with nested Menus and Items for actions in table rows and other listed items.
- c5f2f918: Add Tooltip Component that adds to MUI Tooltip a trigger prop that allows showing the Tooltip on focus/click without the need for `ClickAwayListener`.

### Patch Changes

- 51466b1a: Add compatible x-data-grid-\* versions as optional peerDependency
- Updated dependencies [51466b1a]
    - @comet/admin-icons@4.1.0
