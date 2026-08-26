---
title: Migrating from v8 to v9
sidebar_position: -9
---

# Migrating from v8 to v9

:::info AI-Assisted Migration

This migration guide is designed to be executed by an AI coding agent (e.g., Claude Code). Each section contains structured, step-by-step instructions that an agent can follow to perform the migration automatically.

**Sample prompt to get started:**

```
Migrate this project from Comet v8 to v9. Follow the migration guide at https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v8-to-v9 step by step. Work through each section sequentially, making the required changes and running any verification commands. Commit after each major section.
```

:::

## Root

### Update Comet dependencies

Update the `@comet/*` dependencies in the root `package.json` to version `9.0.0`:

```diff title="package.json"
{
    "devDependencies": {
-       "@comet/cli": "^8.0.0",
+       "@comet/cli": "9.0.0",
    }
}
```

Then, install the updated dependencies:

```sh
npm install
```

### Replace `install-agent-skills` with `install-agent-features`

The `install-agent-skills` command and its `agent-skills.json` config have been removed and replaced by `install-agent-features`, a combined installer for agent skills and agent rules.

Comet's skills and rules are now shipped via the `@comet/agent-features` npm package, which is discovered automatically from `node_modules` — you no longer need an `agent-features.json` file to reference the Comet repo.

Delete the old `agent-skills.json`:

```sh
rm agent-skills.json
```

Add `@comet/agent-features` to the root `package.json` and replace the `install-agent-skills` script:

```diff title="package.json"
{
    "scripts": {
-       "install-agent-skills": "npx @comet/cli install-agent-skills"
+       "install-agent-features": "npx @comet/cli install-agent-features"
    },
    "devDependencies": {
+       "@comet/agent-features": "9.0.0",
    }
}
```

And in `install.sh`:

```diff title="install.sh"
- npx @comet/cli install-agent-skills
+ npm run install-agent-features
```

If you need to pull in additional skills/rules from external git repos, create an `agent-features.json` as described in the [Installing agent features](../guides/installing-agent-features) guide.

### Verify lint passes

```sh
npm run lint:root
```

Repeat this step, fixing all lint errors, until the lint passes.

## All packages

The following changes apply to API, Admin, and Site. Run the steps in each package that consumes `@comet/*` packages.

### Replace `/lib` imports from `@comet/*` packages

`@comet/eslint-config` v9 forbids importing from `@comet/*/lib` and `@comet/*/lib/**`. Only the package root (and explicit subpath exports like `@comet/site-nextjs/server`) may be imported. Reaching into `/lib` couples your project to internal file layout and breaks whenever a package is restructured.

```diff
- import { Something } from "@comet/cms-api/lib/some/internal/path";
+ import { Something } from "@comet/cms-api";
```

If the symbol you need isn't exported from the package root, **do not copy the code from `/lib` into your project**. The duplicate drifts out of sync with the library, misses bug fixes, and defeats the purpose of using the package.

Instead, open a pull request in [vivid-planet/comet](https://github.com/vivid-planet/comet) that adds the missing export to the package's `src/index.ts` (plus a changeset). Once merged and released, import it from the package root.

## API

### Update Comet dependencies

Update all `@comet/*` dependencies in `api/package.json` to version `9.0.0`:

```diff title="api/package.json"
{
    "dependencies": {
-       "@comet/cms-api": "^8.0.0",
+       "@comet/cms-api": "9.0.0",
-       "@comet/mail-react": "^8.0.0",
+       "@comet/mail-react": "9.0.0",
    },
    "devDependencies": {
-       "@comet/api-generator": "^8.0.0",
+       "@comet/api-generator": "9.0.0",
-       "@comet/eslint-config": "^8.0.0",
+       "@comet/eslint-config": "9.0.0",
    }
}
```

Update any other `@comet/*` packages your project uses (e.g., `@comet/brevo-api`) to `9.0.0` as well.

Then, install the updated dependencies:

```sh
npm install
```

### API Generator: Remove the `targetDirectory` option

The `targetDirectory` option of the `@CrudGenerator` and `@CrudSingleGenerator` decorators has been removed.
Generated files are now always written to `${__dirname}/../generated/`, which was a commonly used default.

```diff title="api/src/products/entities/product.entity.ts"
@CrudGenerator({
-   targetDirectory: `${__dirname}/../generated/`,
    requiredPermission: ["products"],
})
export class Product extends BaseEntity {}
```

```diff title="api/src/footers/entities/footer.entity.ts"
@CrudSingleGenerator({
-   targetDirectory: `${__dirname}/../generated/`,
    requiredPermission: "pageTree",
})
export class Footer extends BaseEntity {}
```

### Enable MikroORM dataloader for generated CRUD resolvers

Generated list resolvers from `@comet/api-generator` no longer inspect GraphQL selection sets to build `populate` options.
Relation loading is now expected to be handled by MikroORM's dataloader.

Enable dataloader in your MikroORM config:

```diff title="api/src/db/ormconfig.ts"
+ import { DataloaderType } from "@mikro-orm/core";

  export const ormConfig = createOrmConfig(
      defineConfig({
          // ...
+         dataloader: DataloaderType.ALL,
      }),
 );
```

Without enabling dataloader, relation fields resolved by generated resolvers can lead to significantly more SQL queries.

### Update `@EntityInfo` decorator usage

The `@EntityInfo` decorator no longer accepts a TypeScript function or a service class. Migrate to the new object-based API using dot-notation field paths.

#### Entities using an inline function:

```diff
- @EntityInfo<News>((news) => ({ name: news.title, secondaryInformation: news.slug }))
+ @EntityInfo<News>({ name: "title", secondaryInformation: "slug" })
  @Entity()
  export class News { ... }
```

If the entity has a visibility concept, move it into the `visible` field using a MikroORM `ObjectQuery`:

```diff
- @EntityInfo<News>((news) => ({ name: news.title, secondaryInformation: news.slug }))
+ @EntityInfo<News>({ name: "title", secondaryInformation: "slug", visible: { status: { $eq: NewsStatus.active } } })
  @Entity()
  export class News { ... }
```

Dot-notation is supported for nested relations and embeddables (ManyToOne/OneToOne only):

```ts
@EntityInfo<Product>({ name: "title", secondaryInformation: "manufacturer.name", visible: { status: { $eq: ProductStatus.Published } } })
```

#### Documents using a service class (e.g. `PageTreeNodeDocumentEntityInfoService`):

Remove `@EntityInfo(PageTreeNodeDocumentEntityInfoService)` from `Page`, `Link`, and any other `DocumentInterface` entities. Their entity info is now derived automatically from the `PageTreeNodeEntityInfo` SQL view — no decorator is needed.

```diff
- @EntityInfo(PageTreeNodeDocumentEntityInfoService)
  @Entity()
  @ObjectType({ implements: () => [DocumentInterface] })
  export class Page { ... }
```

Remove `PageTreeNodeDocumentEntityInfoService` from all NestJS module providers as well.

#### Entities with complex info logic (custom `EntityInfoServiceInterface` -> raw SQL string):

For cases where the object syntax is insufficient, e.g. cases where you used a custom `EntityInfoService` before, you can pass a raw `SELECT` statement instead.
The query must return the columns `name`, `secondaryInformation`, `visible`, `id`, and `entityName`:

```ts
@EntityInfo<DamFile>(`SELECT "name", "secondaryInformation", "visible", "id", 'DamFile' AS "entityName" FROM "DamFileEntityInfo"`)
```

Don't forget to remove all custom services that implemented `EntityInfoServiceInterface` as they are no longer needed:

```diff
- import { EntityInfoServiceInterface } from "@comet/cms-api";
-
- @Injectable()
- export class MyEntityInfoService implements EntityInfoServiceInterface<MyEntity> {
-     async getEntityInfo(entity: MyEntity) {
-         return { name: entity.title, secondaryInformation: entity.slug };
-     }
- }
```

### Fix dev dependency imports in API source code

`@comet/eslint-config` v9 adds the `import/no-extraneous-dependencies` rule to the NestJS ESLint config.
This rule prevents production source files from importing packages that are listed as `devDependencies` in `package.json`.
Dev dependencies may still be imported in test files (`*.spec.ts`, `*.test.ts`).

After upgrading, run the lint to surface any violations:

```sh
cd api
npm run lint
```

For each `import/no-extraneous-dependencies` error, move the imported package from `devDependencies` to the appropriate section in `api/package.json`:

- **Packages used only as types or utilities in source code** → move to `dependencies`
- **Packages that consumers of your package are expected to install themselves** → move to `peerDependencies`

```diff title="api/package.json"
{
    "dependencies": {
+       "some-package": "^1.0.0",
    },
-   "devDependencies": {
-       "some-package": "^1.0.0",
-   }
}
```

Reinstall dependencies after updating `package.json`:

```sh
npm install
```

### Rename `RedirectSourceTypeValues` to `RedirectSourceType``

Use `RedirectSourceType` instead of `RedirectSourceTypeValues` from `@comet/cms-api`

### Brevo: `@getbrevo/brevo` upgraded to v5

`@comet/brevo-api` now uses `@getbrevo/brevo` v5, which is a ground-up rewrite of the Brevo SDK. If your project imports `@getbrevo/brevo` directly, upgrade it to `^5` and follow the [Brevo SDK migration guide](https://github.com/getbrevo/brevo-node).

`BrevoTransactionalMailsService.send()` now resolves to the Brevo response body directly instead of the previous `{ response, body }` wrapper, and its options are typed as `SendTransacEmailRequest` instead of `SendSmtpEmail`. The supported fields (`to`, `subject`, `htmlContent`, `textContent`, …) are unchanged, so only adjust code that reads the return value:

```diff title="api/src/.../some.service.ts"
- const { body } = await this.brevoTransactionalMailsService.send({ to: [{ email }], subject, htmlContent }, scope);
- const messageId = body.messageId;
+ const { messageId } = await this.brevoTransactionalMailsService.send({ to: [{ email }], subject, htmlContent }, scope);
```

<!-- "Verify lint passes" must always be the last step for this service. -->

### Verify lint passes

```sh
cd api
npm run lint
```

Repeat this step, fixing all lint errors, until the lint passes.

## Admin

### Update Comet and peer dependencies

Update all `@comet/*` dependencies in `admin/package.json` to version `9.0.0` and update peer dependencies:

```diff title="admin/package.json"
{
    "dependencies": {
-       "@comet/admin": "^8.0.0",
+       "@comet/admin": "9.0.0",
-       "@comet/admin-date-time": "^8.0.0",
+       "@comet/admin-date-time": "9.0.0",
-       "@comet/admin-icons": "^8.0.0",
+       "@comet/admin-icons": "9.0.0",
-       "@comet/cms-admin": "^8.0.0",
+       "@comet/cms-admin": "9.0.0",
-       "rdndmb-html5-to-touch": "^8.1.2",
+       "rdndmb-html5-to-touch": "^9.0.0",
-       "react": "^18.3.1",
-       "react-dom": "^18.3.1",
+       "react": "^19.2.0",
+       "react-dom": "^19.2.0",
-       "react-dnd-multi-backend": "^8.1.2",
+       "react-dnd-multi-backend": "^9.0.0",
-       "react-intl": "^6.8.9",
+       "react-intl": "^7.1.9",
-       "@mui/x-data-grid": "^7.29.12",
-       "@mui/x-data-grid-pro": "^7.29.12",
+       "@mui/x-data-grid": "^8.27.5",
+       "@mui/x-data-grid-pro": "^8.27.5",
-       "@mui/x-date-pickers": "^7.29.4",
-       "@mui/x-date-pickers-pro": "^7.29.4",
-       "@mui/x-license-pro": "^7.29.1",
+       "@mui/x-date-pickers": "^8.27.2",
+       "@mui/x-date-pickers-pro": "^8.27.2",
+       "@mui/x-license": "^8.26.0",
    },
    "devDependencies": {
-       "@comet/admin-generator": "^8.0.0",
+       "@comet/admin-generator": "9.0.0",
-       "@comet/cli": "^8.0.0",
+       "@comet/cli": "9.0.0",
-       "@comet/eslint-config": "^8.0.0",
+       "@comet/eslint-config": "9.0.0",
-       "@types/react": "^18.3.23",
-       "@types/react-dom": "^18.3.7",
+       "@types/react": "^19.2.14",
+       "@types/react-dom": "^19.2.3",
    }
}
```

Update any other `@comet/*` packages your project uses (e.g., `@comet/admin-color-picker`, `@comet/admin-rte`, `@comet/brevo-admin`) to `9.0.0` as well.
Ensure that all other dependencies are compatible with React 19.

For `react-final-form`, add the following `overrides` to your `package.json`:

```diff title="admin/package.json"
{
+   "overrides": {
+        "react-final-form": {
+            "react": "^19.2.4"
+        },
+        "react-final-form-arrays": {
+            "react": "^19.2.4"
+        }
+    },
}
```

:::info Why do we need these overrides?

The latest Final Form version does include support for React 19.
However, it was rewritten to TypeScript using AI, which introduced some incompatibilities.
Since the project isn't actively maintained anymore and we're planning to switch to react-hook-form, we decided to not upgrade and override the supported React version instead.

:::

Then, install the updated dependencies:

```sh
npm install
```

### Replace `DependencyList` with `DependenciesList` or `DependentsList`

The `DependencyList` component has been replaced by two focused components:

- `DependenciesList` — displays what an entity depends on (query must return `item.dependencies`)
- `DependentsList` — displays what depends on an entity (query must return `item.dependents`)

```diff
- import { DependencyList } from "@comet/cms-admin";
+ import { DependenciesList, DependentsList } from "@comet/cms-admin";

- <DependencyList query={myDependentsQuery} variables={{ id }} />
+ <DependentsList query={myDependentsQuery} variables={{ id }} />

- <DependencyList query={myDependenciesQuery} variables={{ id }} />
+ <DependenciesList query={myDependenciesQuery} variables={{ id }} />
```

### Admin packages are now ESM-only

The admin packages now ship ESM-only builds.
This should not require any significant changes if you're already using Vite.
Review the [Starter](https://github.com/vivid-planet/comet-starter/tree/main/admin) for an example of a Vite-based admin setup.

The only required change is to update your TSConfig's `module` and `moduleResolution` options:

```diff title="admin/tsconfig.json"
{
    "compilerOptions": {
-       "module": "ESNext",
-       "moduleResolution": "Node",
+       "module": "preserve",
+       "moduleResolution": "bundler"
    }
}
```

:::info Why do we need this change?

This is necessary to support importing from Admin packages (e.g, `import { GridCellContent } from "@comet/admin"`) in the Admin Generator configuration files.

:::

### Upgrade to React 19

Execute the following codemods:

```sh
cd admin

npx codemod@latest react/19/migration-recipe
```

```sh
npx types-react-codemod@latest preset-19 ./src
```

See the official React 19 [migration guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) for more information.

### Upgrade MUI X Data Grid to v8

The MUI X Data Grid peer dependency has been bumped to v8.
Review the [migration guide](https://mui.com/x/migration/migration-data-grid-v7/) for more information.

#### Run codemods

```sh
cd admin

npx @mui/x-codemod@latest v8.0.0/data-grid/preset-safe src
```

#### Import `GridToolbarQuickFilter` from `@comet/admin`

`GridToolbarQuickFilter` must now be imported from `@comet/admin`:

```diff
-import { GridToolbarQuickFilter } from "@mui/x-data-grid";
+import { GridToolbarQuickFilter } from "@comet/admin";
```

```diff
-import { GridToolbarQuickFilter } from "@mui/x-data-grid-pro";
+import { GridToolbarQuickFilter } from "@comet/admin";
```

```diff
-import { GridToolbarQuickFilter } from "@mui/x-data-grid-premium";
+import { GridToolbarQuickFilter } from "@comet/admin";
```

:::info

An ESLint rule enforces this import. Running `npm run lint` will flag any remaining usages.

:::

#### Update row selection model usage

The row selection model has been changed from `GridRowId[]` to `{ type: 'include' | 'exclude'; ids: Set<GridRowId> }`:

```diff
-const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
+const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
+    type: "include",
+    ids: new Set([]),
+});
```

Update all code that reads from the selection model:

```diff
-selectionModel.length
+selectionModel.ids.size

-selectionModel.includes(row.id)
+selectionModel.ids.has(row.id)

-for (const id of selectionModel) {
+for (const id of Array.from(selectionModel.ids)) {
```

When passing `rowSelectionModel` as a prop, convert to the new format:

```diff
-rowSelectionModel={state.ids}
+rowSelectionModel={{ type: "include", ids: new Set(state.ids) }}
```

When reading from `onRowSelectionModelChange`, convert back from `Set` to array if needed:

```diff
onRowSelectionModelChange={(newSelection) => {
-    updateState({ ids: newSelection as string[] });
+    updateState({ ids: Array.from(newSelection.ids) as string[] });
}}
```

Add `disableRowSelectionExcludeModel` to opt out of the new exclude selection model:

```diff
  <DataGridPro
      checkboxSelection
      keepNonExistentRowsSelected
+     disableRowSelectionExcludeModel
  />
```

### Provide the DataGrid component via `CometConfig`

The `CometConfig` context now exposes the DataGrid component used by `@comet/cms-admin`'s `DataGrid` wrapper.
If you use `DataGridPro`/`DataGridPremium`, provide it in your `CometConfigProvider`:

```tsx
import { DataGridPro } from "@mui/x-data-grid-pro";
import { CometConfigProvider } from "@comet/cms-admin";

<CometConfigProvider
    dataGrid={{ component: DataGridPro }}
    // ...rest of config
>
    {children}
</CometConfigProvider>;
```

### Update `LicenseInfo` import

In MUI X v8, `LicenseInfo` is now exported from `@mui/x-license`:

```diff
-import { LicenseInfo } from "@mui/x-license-pro";
+import { LicenseInfo } from "@mui/x-license";
```

### Upgrade MUI X Date Pickers to v8

The MUI X Date Pickers peer dependency has been bumped to v8.
Review the [migration guide](https://mui.com/x/migration/migration-pickers-v7/) for more information.

#### Update the `AdapterDateFns` import

```diff title="src/App.tsx"
-import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
+import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
```

### Replace the `variant` prop with `color` in `Tooltip`

The `variant` prop has been renamed to color and the options `neutral` and `primary` have been removed.
Change the usage of `variant` to `color` and remove or replace the values `neutral` and `primary`.

Example:

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

### Replace `createHttpClient` with native fetch

The `createHttpClient` function has been removed. Use native fetch instead.

### Remove `clearable` prop from `Autocomplete`, `FinalFormInput`, `FinalFormNumberInput` and `FinalFormSearchTextField`

Those fields are now clearable automatically when not set to `required`, `disabled` or `readOnly`.

### Remove `hasClearableContent` prop from `ClearInputAdornment`

The `hasClearableContent` prop has been removed from `ClearInputAdornment`. The component now always renders when included in the component tree.

Callers should conditionally render the component instead of passing the `hasClearableContent` prop.

**Before:**

```tsx
<ClearInputAdornment
    position="end"
    hasClearableContent={Boolean(value)}
    onClick={() => onChange("")}
/>
```

**After:**

```tsx
{
    value && <ClearInputAdornment position="end" onClick={() => onChange("")} />;
}
```

### Replacement of `@comet/admin-date-time`

The `@comet/admin-date-time` package is deprecated. All of its components have been replaced by new components in `@comet/admin`.

#### Use the new components from `@comet/admin` (recommended)

In most cases, the new components will be a drop-in replacement for the legacy components, so you can simply replace the imports:

| Legacy component from `@comet/admin-date-time` | New component from `@comet/admin`                  |
| ---------------------------------------------- | -------------------------------------------------- |
| `DatePicker`                                   | `DatePicker`                                       |
| `DateField`                                    | `DatePickerField`                                  |
| `FinalFormDatePicker`                          | `DatePickerField` (without using `<Field />`)      |
| `DateRangePicker`                              | `DateRangePicker`                                  |
| `DateRangeField`                               | `DateRangePickerField`                             |
| `FinalFormDateRangePicker`                     | `DateRangePickerField` (without using `<Field />`) |
| `TimePicker`                                   | `TimePicker`                                       |
| `TimeField`                                    | `TimePickerField`                                  |
| `FinalFormTimePicker`                          | `TimePickerField` (without using `<Field />`)      |
| `TimeRangePicker`                              | `TimeRangePicker`                                  |
| `TimeRangeField`                               | `TimeRangePickerField`                             |
| `FinalFormTimeRangePicker`                     | `TimeRangePickerField` (without using `<Field />`) |
| `DateTimePicker`                               | `DateTimePicker`                                   |
| `DateTimeField`                                | `DateTimePickerField`                              |
| `FinalFormDateTimePicker`                      | `DateTimePickerField` (without using `<Field />`)  |

```diff title="Example of replacing DatePicker"
-import { DatePicker } from "@comet/admin-date-time";
+import { DatePicker } from "@comet/admin";
```

```diff title="Example of replacing DateField"
-import { DateField } from "@comet/admin-date-time";
+import { DatePickerField } from "@comet/admin";
```

When using final-form, only the field-components are available for the new components. Therefore, usage of the `FinalForm*` components with `<Field />` must be updated to use the respective `*Field` directly, without using `<Field />`.

```diff title="Example of replacing FinalFormDatePicker"
-import { Field } from "@comet/admin";
-import { FinalFormDatePicker } from "@comet/admin-date-time";
+import { DatePickerField } from "@comet/admin";

export const ExampleFields = () => {
    return (
        <>
-           <Field component={FinalFormDatePicker} name="date" label="Date Picker" />
+           <DatePickerField name="date" label="Date Picker" />
        </>
    );
};
```

##### Remove `DateFnsLocaleProvider`

The new components from `@comet/admin` are based on MUI X and read the date-fns locale from MUI X's `LocalizationProvider` (`adapterLocale`).
Once you no longer render any legacy components, the `DateFnsLocaleProvider` (and `useDateFnsLocale`) from `@comet/admin-date-time` are no longer needed and can be removed:

```diff title="src/App.tsx"
-import { DateFnsLocaleProvider } from "@comet/admin-date-time";
 import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
 import { LocalizationProvider } from "@mui/x-date-pickers";

 <LocalizationProvider adapterLocale={dateFnsLocale} dateAdapter={AdapterDateFns}>
-    <DateFnsLocaleProvider value={dateFnsLocale}>
         {children}
-    </DateFnsLocaleProvider>
 </LocalizationProvider>;
```

#### Continue using the deprecated components

The legacy components will continue to work as they did previously. The only change is that the class-names and theme component-keys are now prefixed with "Legacy".

Update any use of class-names of the component's slots:

- `CometAdminDatePicker-*` -> `CometAdminLegacyDatePicker-*`
- `CometAdminDateRangePicker-*` -> `CometAdminLegacyDateRangePicker-*`
- `CometAdminDateTimePicker-*` -> `CometAdminLegacyDateTimePicker-*`
- `CometAdminTimePicker-*` -> `CometAdminLegacyTimePicker-*`
- `CometAdminTimeRangePicker-*` -> `CometAdminLegacyTimeRangePicker-*`

```diff title="Example of updating the class-names"
const WrapperForStyling = styled(Box)(({ theme }) => ({
-   ".CometAdminDatePicker-calendar": {
+   ".CometAdminLegacyDatePicker-calendar": {
        backgroundColor: "magenta",
    },
}));
```

Update the component-keys when using `defaultProps` or `styleOverrides` in the theme:

- `CometAdminDatePicker` -> `CometAdminLegacyDatePicker`
- `CometAdminDateRangePicker` -> `CometAdminLegacyDateRangePicker`
- `CometAdminDateTimePicker` -> `CometAdminLegacyDateTimePicker`
- `CometAdminTimePicker` -> `CometAdminLegacyTimePicker`
- `CometAdminTimeRangePicker` -> `CometAdminLegacyTimeRangePicker`

```diff title="Example of updating the component-keys"
export const theme = createCometTheme({
    components: {
-       CometAdminDatePicker: {
+       CometAdminLegacyDatePicker: {
            defaultProps: {
                startAdornment: <FancyCalendarIcon />,
            },
        },
    },
});
```

#### Update usages of "Future" (now stable) components

The "Future" prefix has been removed from date/time components that are now considered stable.

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

### Rename GraphQL operations and fragments with redundant kind suffixes

`@comet/eslint-config` v9 adds the `@graphql-eslint/naming-convention` rule from `@graphql-eslint/eslint-plugin`. The rule forbids GraphQL fragment, query, mutation, and subscription names that end with their own kind (e.g. `FooFragment`, `BarQuery`), which would otherwise produce duplicated suffixes such as `FragmentFragment` or `QueryQuery` in generated TypeScript types.

After upgrading, run the lint to surface any violations:

```sh
cd admin
npm run lint
```

For each `@graphql-eslint/naming-convention` error, rename the operation/fragment to drop the redundant suffix and update any generated TypeScript type references accordingly:

```diff
const attributesFragment = gql`
-     fragment BrevoContactAttributesFragment on BrevoContact {
+     fragment BrevoContactAttributes on BrevoContact {
        ...
    }
`;
- import type { GQLBrevoContactAttributesFragmentFragment } from "./generated";
+ import type { GQLBrevoContactAttributesFragment } from "./generated";
```

After renaming, re-run code generation to update the `*.generated.ts` files.

<!-- "Verify lint passes" must always be the last step for this service. -->

### Verify lint passes

```sh
cd admin
npm run lint
```

Repeat this step, fixing all lint errors, until the lint passes.

## Site

### Update Comet dependencies

Update all `@comet/*` dependencies in `site/package.json` to version `9.0.0`:

```diff title="site/package.json"
{
    "dependencies": {
-       "@comet/site-nextjs": "^8.0.0",
+       "@comet/site-nextjs": "9.0.0",
-       "react-intl": "^6.8.9",
+       "react-intl": "^7.1.9",
    },
    "devDependencies": {
-       "@comet/cli": "^8.0.0",
+       "@comet/cli": "9.0.0",
-       "@comet/eslint-config": "^8.0.0",
+       "@comet/eslint-config": "9.0.0",
    }
}
```

`react-intl` v7 is compatible with both React 18 and React 19.

:::info Next.js and React versions

`@comet/site-nextjs` v9 supports Next.js 14, 15, and 16 and React 18 and 19.
You can adopt Comet v9 without changing your Next.js or React version.

We recommend upgrading to Next.js 16 — see [Upgrade to Next.js 16 (recommended)](#upgrade-to-nextjs-16-recommended) for the upgrade steps and the corresponding `next`, `react`, `react-dom`, and `@next/bundle-analyzer` bumps.

:::

After updating the dependencies, remove `node_modules/` and `package-lock.json` (or your lock file) before reinstalling to avoid peer dependency conflicts:

```sh
rm -rf site/node_modules site/package-lock.json
npm install
```

### Upgrade to Next.js 16 (recommended)

Next.js 16 is recommended but not required. `@comet/site-nextjs` v9 also supports Next.js 14 and 15 and React 18, so you can skip this section and stay on your current Next.js and React version.

To upgrade, update the framework dependencies and follow the steps below:

```diff title="site/package.json"
{
    "dependencies": {
-       "@next/bundle-analyzer": "^14.2.30",
+       "@next/bundle-analyzer": "^16.1.6",
-       "next": "^14.2.30",
+       "next": "^16.1.6",
-       "react": "^18.3.1",
-       "react-dom": "^18.3.1",
+       "react": "^19.2.0",
+       "react-dom": "^19.2.0",
    },
    "devDependencies": {
-       "@types/react": "^18.3.23",
-       "@types/react-dom": "^18.3.7",
+       "@types/react": "^19.2.0",
+       "@types/react-dom": "^19.2.0",
    }
}
```

Ensure that all other dependencies are compatible with React 19 and Next.js 16.
After updating the dependencies, remove `node_modules/` and your lock file and reinstall to avoid peer dependency conflicts.

#### Add `next-env.d.ts` to `.gitignore`

```sh
git rm site/next-env.d.ts

echo "next-env.d.ts" >> site/.gitignore
```

#### Add `next typegen` to `lint:tsc` script

This is necessary for the lint to work during CI.

```diff title="site/package.json"
{
    "scripts": {
-       "lint:tsc": "tsc --project ."
+       "lint:tsc": "npx next typegen && tsc --project ."
    }
}
```

Now, execute `npx next typegen` once to generate the necessary types.

#### Remove `eslint` from the Next.js config file

```diff title="site/next.config.(js|mjs|ts)"
const nextConfig: NextConfig = {
    /* ... */,
-   eslint: {
-       ignoreDuringBuilds: process.env.NODE_ENV === "production",
-   },
};
```

#### Remove deprecated `experimental.instrumentationHook`

In Next.js 16, the instrumentation hook is built in and the experimental flag is no longer valid.
Leaving it in place logs a deprecation warning on every start.

```diff title="site/next.config.(js|mjs|ts)"
const nextConfig: NextConfig = {
    experimental: {
-       instrumentationHook: true,
        optimizePackageImports: ["@comet/site-nextjs"],
    },
};
```

#### Update `tsconfig.server.json`

If you have a separate `tsconfig.server.json` for `server.ts` / `tracing.ts` / `cache-handler.ts` that sets `module: "commonjs"`, you must also override `moduleResolution`.
Otherwise `tsc` fails with `TS5095: Option 'bundler' can only be used when 'module' is set to 'preserve' or to 'es2015' or later` — because Next 16 enforces `moduleResolution: "bundler"` in the base `tsconfig.json` and rewrites it back if you change it.

```diff title="site/tsconfig.server.json"
{
    "compilerOptions": {
        "module": "commonjs",
+       "moduleResolution": "node",
        // ...
    },
    "extends": "./tsconfig.json"
}
```

#### Disable Turbopack

Our site packages currently aren't compatible with Turbopack.
Disable Turbopack until this is resolved:

```diff title="site/server.(js|ts)"
- const app = next({ dev, hostname: host, port });
+ const app = next({ dev, hostname: host, port, webpack: true });
```

```diff title="site/package.json"
{
    "scripts": {
-       "build": "run-s intl:compile && run-p gql:types generate-block-types css:types build-server && next build"
+       "build": "run-s intl:compile && run-p gql:types generate-block-types css:types build-server && next build --webpack"
    }
}
```

#### Upgrade to React 19

Execute the following codemods:

```sh
cd site

npx codemod@latest react/19/migration-recipe
```

```sh
npx types-react-codemod@latest preset-19 ./src
```

See the official React 19 [migration guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) for more information.

#### Change to Next.js Async Request APIs

Multiple Next.js APIs are now asynchronous and must be `await`ed. This applies to:

- `headers()`
- `cookies()`
- `draftMode()`
- `params` and `searchParams` on pages, layouts, and route handlers

Update your usages to support the asynchronous APIs.
Use the new generated props helper types (`PageProps<"…">`, `LayoutProps<"…">`, and the route handler context type) instead of hand-written param types.
Review the [migration guide](https://nextjs.org/docs/app/guides/upgrading/version-16#async-request-apis-breaking-change) for more information.

:::danger Replace every hand-written `params`/`searchParams` type — do not rely on `tsc` to find them

A hand-written type such as `{ params: { domain: string } }` describes `params` as a plain object, so reading it synchronously (`params.domain`) type-checks even though `params` is actually a `Promise` at runtime. The missing `await` is invisible to the type checker, the build passes, and `params.domain` is `undefined` at runtime. Fed into a scope, that `undefined` serializes to `{}` and fails only when the page is requested:

```
Variable "$scope" got invalid value {}; Field "domain" of required type "String!" was not provided.
```

Switching to the generated `PageProps`/`LayoutProps` types makes `params` a `Promise`, so `tsc` then enforces the `await`. Because `tsc` cannot flag the old hand-written types, you must find and convert **every** routing file yourself — see [Scan the whole site](#scan-the-whole-site-for-synchronous-paramssearchparams-usage) below.

:::

#### Examples

```diff title="site/src/app/[visibility]/[domain]/[language]/layout.tsx"
- const isDraftModeEnabled = draftMode().isEnabled;
+ const isDraftModeEnabled = (await draftMode()).isEnabled;
```

```diff title="site/src/app/api/example/route.ts"
- const cookieStore = cookies();
+ const cookieStore = await cookies();
```

```diff title="site/src/app/[visibility]/[domain]/[language]/[[...path]]/page.tsx"
- type PageProps = {
-   params: { path: string[]; domain: string; language: string; visibility: VisibilityParam };
- };

- export default async function Page({ params }: PageProps) {
+ export default async function Page({ params }: PageProps<"/[visibility]/[domain]/[language]/[[...path]]">) {
-   setVisibilityParam(params.visibility);
-   const scope = { domain: params.domain, language: params.language };
+   const { visibility, domain, language } = await params;
+   setVisibilityParam(visibility as VisibilityParam);
+   const scope = { domain, language };
}
```

```diff title="site/src/app/[visibility]/[domain]/[language]/[[...path]]/page.tsx"
- async function fetchPageTreeNode(params: { path: string[]; domain: string; language: string }) {
+ async function fetchPageTreeNode(params: PageProps<"/[visibility]/[domain]/[language]/[[...path]]">["params"]) {
-     const siteConfig = getSiteConfigForDomain(params.domain);
+     const { domain, language, path: pathParam } = await params;
+     const siteConfig = getSiteConfigForDomain(domain);

-     const path = `/${(params.path ?? []).join("/")}`;
-     const { scope } = { scope: { domain: params.domain, language: params.language } };
+     const path = `/${(pathParam ?? []).join("/")}`;
+     const { scope } = { scope: { domain, language } };
```

```diff title="site/src/app/[visibility]/[domain]/[language]/layout.tsx"
- interface LayoutProps {
-     params: { domain: string; language: string };
- }

- export default async function Layout({ children, params: { domain, language } }: PropsWithChildren<LayoutProps>) {
+ export default async function Layout({ children, params }: LayoutProps<"/[visibility]/[domain]/[language]">) {
+   const { domain, language: languageParam } = await params;
    const siteConfig = getSiteConfigForDomain(domain);
+   let language = languageParam;
    if (!siteConfig.scope.languages.includes(language)) {
        language = "en";
    }
```

#### Scan the whole site for synchronous `params`/`searchParams` usage

Do not stop at the files that fail `tsc` — hand-written param types hide the missing `await`, so a project can build cleanly while several pages are silently broken at runtime. Check **every** `page.tsx`, `layout.tsx`, `route.ts`/`route.tsx`, and every file exporting `generateMetadata` or `generateStaticParams` under `src/app`. Repeat this for **every** site app in the project (some projects contain more than one site).

List the routing files that reference `params`/`searchParams`:

```sh
cd site
grep -rlE "params|searchParams" src/app --include="*.ts" --include="*.tsx"
```

Find the hand-written param/searchParams object types that mask a missing `await`:

```sh
grep -rnE "(params|searchParams)\s*:\s*\{" src/app --include="*.ts" --include="*.tsx"
```

For each file:

1. Replace the hand-written type with the generated `PageProps<"/route/pattern">`, `LayoutProps<"/route/pattern">`, or route handler context type.
2. Make the function `async` if it is not already — a synchronous page such as `export default function Page({ params }: { params: { domain: string } })` must become `export default async function Page({ params }: PageProps<"…">)`.
3. `await params` / `await searchParams` before reading any field, and use the awaited values everywhere (including in nested helpers, `generateMetadata`, and JSX).

When done, run the grep again to confirm no hand-written `params: {` / `searchParams: {` types remain under `src/app`, then run `npm run lint` (which runs `next typegen` + `tsc`).

#### Rename `middleware.ts` to `proxy.ts`

```sh
mv site/src/middleware.ts site/src/proxy.ts
```

Next.js 16 requires `proxy.ts` to export a function named `proxy` (or a default export).
The previously exported `middleware` function must be renamed — otherwise every request fails at runtime with `must export a function named "proxy" or a default function`:

```diff title="site/src/proxy.ts"
- export async function middleware(request: NextRequest) {
+ export async function proxy(request: NextRequest) {
      // ...
  }
```

:::note

If you're using Knip, you may need to add `proxy.ts` as entry point:

```diff title="site/knip.json"
{
    "$schema": "https://unpkg.com/knip@5/schema.json",
    "entry": [
        "./src/app/**",
        "./cache-handler.ts",
        "./tracing.ts",
+       "./src/proxy.ts"
    ],
    "project": ["./src/**/*.{ts,tsx}"]
}
```

:::

#### Add `cache: "force-cache"` to GraphQL fetch

Since Next.js 15, `fetch` requests are no longer cached by default.
Review the [migration guide](https://nextjs.org/docs/app/guides/upgrading/version-15#fetch-requests) for more information.
Add `cache: "force-cache"` to `createGraphQLFetch()`.
The file might be named differently in some Comet projects (e.g. `createGraphQLFetch.ts`):

```diff title="site/src/util/graphQLClient.ts"
export function createGraphQLFetch() {
    // ...

    return createGraphQLFetchLibrary(
        createFetchWithDefaults(createFetchWithDefaultNextRevalidate(fetch, 7.5 * 60), {
+           cache: "force-cache",
            headers: {
                // ...
            },
        }),
        `${process.env.API_URL_INTERNAL}/graphql`,
    );
}
```

#### Store the wrapped cache value in the in-memory fallback in `cache-handler.ts`

:::danger Very important — the site can crash in production if this is missing

The in-memory fallback in `cache-handler.ts` must store the same wrapped `{ lastModified, value }` shape as the Valkey/Redis path. If it stores the bare `value`, fallback reads are silent on Next.js 14 but crash on Next.js 16 (`Expected cached value to be a FETCH kind, got undefined`) — so **the site goes down whenever Valkey is down**. Type both paths with `CacheHandlerValue` so they can't drift apart.

:::

```diff title="site/cache-handler.ts"
- import { CacheHandler as NextCacheHandler } from "next/dist/server/lib/incremental-cache";
+ import { CacheHandler as NextCacheHandler, CacheHandlerValue } from "next/dist/server/lib/incremental-cache";

- const fallbackCache = new LRUCache<string, any>({
+ const fallbackCache = new LRUCache<string, CacheHandlerValue>({
      // ...
  });

export default class CacheHandler {
-   async get(key: string): ReturnType<NextCacheHandler["get"]> {
+   async get(key: string): Promise<ReturnType<NextCacheHandler["get"]>> {
        // ...
-       const response = JSON.parse(redisResponse);
+       const response = JSON.parse(redisResponse) as CacheHandlerValue;
        // ...
    }

    async set(key: string, value: Parameters<NextCacheHandler["set"]>[1]): Promise<void> {
        // ...
-       const data = {
+       const data: CacheHandlerValue = {
            lastModified: Date.now(),
            value,
        };
        const stringData = JSON.stringify(data);
        // ...
-       fallbackCache.set(key, value, { size: stringData.length });
+       fallbackCache.set(key, data, { size: stringData.length });
    }
}
```

See the [full reference implementation in the demo](https://github.com/vivid-planet/comet/blob/main/demo/site/cache-handler.ts).

### Domain Redirects

Domain redirects can now be set in the admin. It is necessary to update your middleware — most likely the `redirectToMainHost` middleware — to handle domain redirects.

The full reference implementation is in the demo: https://github.com/vivid-planet/comet/blob/main/demo/site/src/middleware/redirectToMainHost.ts.
The essential steps are outlined below.

#### 1. Add a `DomainRedirects` query

Query `paginatedRedirects` with `sourceType: { equal: "domain" }` to fetch all admin-configured domain redirects for a given scope:

```ts title="site/src/middleware/redirectToMainHost.ts"
import { gql } from "@comet/site-nextjs";

const domainRedirectsQuery = gql`
    query DomainRedirects(
        $scope: RedirectScopeInput!
        $filter: RedirectFilter
        $offset: Int
        $limit: Int
    ) {
        paginatedRedirects(scope: $scope, filter: $filter, offset: $offset, limit: $limit) {
            nodes {
                id
                source
                target
                sourceType
                scope {
                    domain
                }
            }
            totalCount
        }
    }
`;
```

Note: the new `RedirectFilter.sourceType: RedirectSourceTypeEnumFilter` input and the `domain` value on the `RedirectSourceTypeValues` enum are part of the regenerated v9 schema — make sure your project has regenerated `schema.gql` / GraphQL types before running the codegen for this query.

#### 2. Add an in-memory cache for the redirects

Domain redirects are hit on every non-resolving request, so cache them in memory. Using `cache-manager` with a `keyv` store:

```sh
npm install cache-manager keyv
```

```ts title="site/src/middleware/cache.ts"
import { createCache } from "cache-manager";
import Keyv from "keyv";

export const memoryCache = createCache({
    stores: [new Keyv()],
    ttl: 15 * 60 * 1000, // 15 minutes
    refreshThreshold: 5 * 60 * 1000, // refresh if less than 5 minutes TTL are remaining
});

memoryCache.on("refresh", ({ error }) => {
    if (error) {
        console.error("Error refreshing cache in background", error);
    }
});
```

#### 3. Resolve redirect targets to destination URLs

The admin stores the redirect target as a `RedirectsLinkBlock` which can point to an internal page, an external URL, or (if your project has it) a news item. Add a helper that turns the stored `block` into a fully-qualified URL:

```ts title="site/src/middleware/redirectToMainHost.ts"
import {
    type ExternalLinkBlockData,
    type InternalLinkBlockData,
    type RedirectsLinkBlockData,
} from "@src/blocks.generated";
import { createSitePath } from "@src/util/createSitePath";

function getRedirectTargetUrl(
    block: RedirectsLinkBlockData["block"],
    targetBaseUrl: string,
): string | undefined {
    if (!block) return undefined;
    switch (block.type) {
        case "internal": {
            const internalLink = block.props as InternalLinkBlockData;
            if (internalLink.targetPage) {
                return `${targetBaseUrl}${createSitePath({ path: internalLink.targetPage.path })}`;
            }
            break;
        }
        case "external":
            return (block.props as ExternalLinkBlockData).targetUrl;
    }
    return undefined;
}
```

Extend the `switch` with a `case "news"` (or any other link types your project registers) as needed.

#### 4. Update the middleware to look up domain redirects

Before falling back to "redirect to main host", check whether there is a domain redirect for the current host — both when the host matches one of the site-config's additional/pattern domains and when it doesn't match any site-config at all. Detect redirect loops, since misconfigured redirects (e.g. pointing a host at itself) would otherwise 301 in a tight loop.

```ts title="site/src/middleware/redirectToMainHost.ts"
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { getHostByHeaders, getSiteConfigForHost, getSiteConfigs } from "@src/util/siteConfig";
import { type NextRequest, NextResponse } from "next/server";
import { memoryCache } from "./cache";

function normalizeHost(value: string): string {
    return value.replace(/^https?:\/\//, "");
}

async function fetchDomainRedirects(scope: { domain: string }) {
    return memoryCache.wrap(`domainRedirects-${scope.domain}`, async () => {
        const graphQLFetch = createGraphQLFetch();
        // ... paginate through paginatedRedirects with filter: { sourceType: { equal: "domain" } }
        // and return the collected nodes
    });
}

async function fetchDomainRedirectsForAllScopes() {
    return (
        await Promise.all(getSiteConfigs().map((config) => fetchDomainRedirects(config.scope)))
    ).flat();
}

export function withRedirectToMainHostMiddleware(middleware: CustomMiddleware) {
    return async (request: NextRequest) => {
        const host = getHostByHeaders(request.headers);
        const siteConfig = await getSiteConfigForHost(host);

        if (!siteConfig) {
            const redirectSiteConfig =
                getSiteConfigs().find((c) => matchesHostWithAdditionalDomain(c, host)) ||
                getSiteConfigs().find((c) => matchesHostWithPattern(c, host));

            if (redirectSiteConfig) {
                // 1. First, check for an admin-configured domain redirect for this scope
                const domainRedirects = await fetchDomainRedirects(redirectSiteConfig.scope);
                const redirect = domainRedirects.find(
                    (r) => normalizeHost(r.source) === normalizeHost(host),
                );

                if (redirect) {
                    const destination = getRedirectTargetUrl(
                        redirect.target.block,
                        `https://${redirectSiteConfig.domains.main}`,
                    );
                    if (destination) {
                        if (normalizeHost(new URL(destination).host) === normalizeHost(host)) {
                            throw new Error(`Redirect loop detected: ${host} -> ${destination}`);
                        }
                        return NextResponse.redirect(destination, { status: 301 });
                    }
                }

                // 2. Otherwise, redirect to the main host (previous behavior)
                const mainHost = normalizeHost(redirectSiteConfig.domains.main);
                if (mainHost === normalizeHost(host)) {
                    throw new Error(
                        `Redirect loop detected: main host ${mainHost} equals current host`,
                    );
                }
                return NextResponse.redirect(
                    `https://${redirectSiteConfig.domains.main}${request.nextUrl.pathname}${request.nextUrl.search}`,
                    { status: 301 },
                );
            }

            // 3. Host doesn't match any site-config — check cross-scope domain redirects as a last resort
            const domainRedirects = await fetchDomainRedirectsForAllScopes();
            const redirect = domainRedirects.find(
                (r) => normalizeHost(r.source) === normalizeHost(host),
            );
            if (redirect) {
                const scopedSiteConfig = getSiteConfigs().find(
                    (c) => c.scope.domain === redirect.scope.domain,
                );
                if (!scopedSiteConfig) {
                    throw new Error(
                        `Got redirect to domain ${redirect.scope.domain}, but couldn't find corresponding site-config.`,
                    );
                }
                const destination = getRedirectTargetUrl(
                    redirect.target.block,
                    `https://${scopedSiteConfig.domains.main}`,
                );
                if (destination) {
                    if (normalizeHost(new URL(destination).host) === normalizeHost(host)) {
                        throw new Error(`Redirect loop detected: ${host} -> ${destination}`);
                    }
                    return NextResponse.redirect(destination, { status: 301 });
                }
            }

            return NextResponse.json({ error: `Cannot resolve domain: ${host}` }, { status: 404 });
        }
        return middleware(request);
    };
}
```

:::note

`createGraphQLFetch` must be callable from a proxy. In Next.js 16 the proxy runs in the Node.js runtime by default, so a non-edge `createGraphQLFetch` works here. If your project previously had an edge-runtime guard in `createGraphQLFetch` (e.g. a `throw` when `process.env.NEXT_RUNTIME === "edge"`), you can remove it — or call the fetch inside `memoryCache.wrap` so the throw only fires on a real edge deploy.

:::

### Import server-only modules from `@comet/site-nextjs/server`

Server-only exports (`sitePreviewRoute`, `legacyPagesRouterSitePreviewApiHandler`, `previewParams`, `legacyPagesRouterPreviewParams`, `persistedQueryRoute`) have been moved from `@comet/site-nextjs` to `@comet/site-nextjs/server`.

This prevents server-only code (which depends on `next/headers`, `fs/promises`, `server-only`, etc.) from being pulled into client bundles. Previously, tree-shaking would remove unused server code, but this is an optional optimization — for example, Vite's dev server does not tree-shake, causing errors when importing `@comet/site-nextjs` in non-server environments (e.g., Storybook).

Update all imports in your site that use these functions:

```diff
- import { sitePreviewRoute } from "@comet/site-nextjs";
+ import { sitePreviewRoute } from "@comet/site-nextjs/server";
```

```diff
- import { previewParams } from "@comet/site-nextjs";
+ import { previewParams } from "@comet/site-nextjs/server";
```

```diff
- import { legacyPagesRouterPreviewParams } from "@comet/site-nextjs";
+ import { legacyPagesRouterPreviewParams } from "@comet/site-nextjs/server";
```

```diff
- import { legacyPagesRouterSitePreviewApiHandler } from "@comet/site-nextjs";
+ import { legacyPagesRouterSitePreviewApiHandler } from "@comet/site-nextjs/server";
```

```diff
- import { persistedQueryRoute } from "@comet/site-nextjs";
+ import { persistedQueryRoute } from "@comet/site-nextjs/server";
```

Similarly, if you import `persistedQueryRoute` directly from `@comet/site-react`:

```diff
- import { persistedQueryRoute } from "@comet/site-react";
+ import { persistedQueryRoute } from "@comet/site-react/server";
```

### Rename GraphQL operations and fragments with redundant kind suffixes

`@comet/eslint-config` v9 adds the `@graphql-eslint/naming-convention` rule. See the [Admin section](#rename-graphql-operations-and-fragments-with-redundant-kind-suffixes) for details and apply the same renames in `site`.

### Verify embedded webcomponents still work

If your site embeds third-party **webcomponents** / micro-frontends — typically a block that loads an external `<script>` which mounts a widget provided by another team (forms, product sliders, search or booking widgets, etc.) — the React 19 and `react-intl` v7 upgrades can break them **at runtime even though lint, `tsc`, and the production build all pass**.

#### Why this breaks

Such webcomponents often bundle their own React 18 + `react-intl` and, by default, reuse the host page's global `react-intl` context via `window.__REACT_INTL_CONTEXT__`. Once the host runs React 19 + `react-intl` v7, that context's shape is incompatible with the webcomponent's React 18 reconciler, so the webcomponent crashes as soon as it renders — usually with a cryptic minified error such as `TypeError: <minified> is not a function` originating deep inside React.

#### Detect webcomponents

Look for script-based embeds, custom elements, and the global react-intl context flag:

```sh
cd site
grep -rnE "customElements|__REACT_INTL|next/script|<script" src
```

Also review any block whose purpose is to embed an externally hosted widget.

#### Workaround until the webcomponents are fixed

Set `window.__REACT_INTL_BYPASS_GLOBAL_CONTEXT__ = true` **before** the affected webcomponent's script loads, so its bundled `react-intl` creates its own isolated context instead of reusing the host's. Extract it into a shared side-effect module and import it from each affected block:

```ts title="site/src/util/bypassReactIntlGlobalContext.ts"
declare global {
    interface Window {
        __REACT_INTL_BYPASS_GLOBAL_CONTEXT__?: boolean;
    }
}

if (typeof window !== "undefined") {
    window.__REACT_INTL_BYPASS_GLOBAL_CONTEXT__ = true;
}

export {};
```

Apply it only to the webcomponents that actually break — not every embed reuses the global context. This is a temporary workaround: the proper fix belongs in the webcomponent itself, and you can remove the module and its imports once the upstream webcomponents isolate their own context.

:::danger Smoke-test every webcomponent before deploying to production

This is a runtime failure that CI cannot catch — lint, `tsc`, and the build all succeed. Before any production deployment, run the site and manually open **every** page that renders a webcomponent, confirming each one mounts and works. Treat pages containing webcomponents as the highest-risk part of this upgrade, and verify them on a staging/preview environment first.

:::

<!-- "Verify lint passes" must always be the last step for this service. -->

### Verify lint passes

```sh
cd site
npm run lint
```

Repeat this step, fixing all lint errors, until the lint passes.
