# @comet/admin-date-time

## 10.1.0

### Patch Changes

- @dextinity/admin@10.1.0
- @dextinity/admin-icons@10.1.0

## 10.0.1

### Patch Changes

- Updated dependencies [48748b0]
    - @dextinity/admin@10.0.1
    - @dextinity/admin-icons@10.0.1

## 10.0.0

### Major Changes

- f843a5e: Rename `@comet/admin-date-time` to `@dextinity/admin-date-time`

    Update the dependency in `package.json` and all imports.

    **Breaking changes**
    - Rename the theme component prefix from `CometAdmin` to `DextinityAdmin`. This affects `components` overrides passed to `createDextinityTheme` and the generated CSS class names

### Patch Changes

- Updated dependencies [f843a5e]
- Updated dependencies [f843a5e]
    - @dextinity/admin-icons@10.0.0
    - @dextinity/admin@10.0.0

## 10.0.0-beta.0

### Major Changes

- f843a5e: Rename `@comet/admin-date-time` to `@dextinity/admin-date-time`

    Update the dependency in `package.json` and all imports.

    **Breaking changes**
    - Rename the theme component prefix from `CometAdmin` to `DextinityAdmin`. This affects `components` overrides passed to `createDextinityTheme` and the generated CSS class names

### Patch Changes

- Updated dependencies [f843a5e]
- Updated dependencies [f843a5e]
- Updated dependencies [085b9ac]
    - @dextinity/admin-icons@10.0.0-beta.0
    - @dextinity/admin@10.0.0-beta.0

## 9.5.0

### Patch Changes

- @comet/admin@9.5.0
- @comet/admin-icons@9.5.0

## 9.4.0

### Patch Changes

- Updated dependencies [bf1ff64]
- Updated dependencies [085b9ac]
    - @comet/admin@9.4.0
    - @comet/admin-icons@9.4.0

## 9.3.0

### Patch Changes

- Updated dependencies [7b2d8db]
    - @comet/admin@9.3.0
    - @comet/admin-icons@9.3.0

## 9.2.2

### Patch Changes

- @comet/admin@9.2.2
- @comet/admin-icons@9.2.2

## 9.2.1

### Patch Changes

- @comet/admin@9.2.1
- @comet/admin-icons@9.2.1

## 9.2.0

### Patch Changes

- Updated dependencies [5a05d97]
    - @comet/admin@9.2.0
    - @comet/admin-icons@9.2.0

## 9.1.1

### Patch Changes

- @comet/admin@9.1.1
- @comet/admin-icons@9.1.1

## 9.1.0

### Patch Changes

- @comet/admin@9.1.0
- @comet/admin-icons@9.1.0

## 9.0.1

### Patch Changes

- @comet/admin@9.0.1
- @comet/admin-icons@9.0.1

## 9.0.0

### Major Changes

- 3fda20b: Add a "Legacy" prefix to class-names and theme component-keys

    This affects the components of which their new counterparts are now considered stable in `@comet/admin`.

    **Consider using the new components from `@comet/admin`**

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
    | `DateTimePicker`                               | `DateTimePicker`                                   |
    | `DateTimeField`                                | `DateTimePickerField`                              |
    | `FinalFormDateTimePicker`                      | `DateTimePickerField` (without using `<Field />`)  |

    **To continue using the existing components, the following changes will need to be made:**

    Update any use of class-names of the component's slots:
    - `CometAdminDatePicker-*` -> `CometAdminLegacyDatePicker-*`
    - `CometAdminDateRangePicker-*` -> `CometAdminLegacyDateRangePicker-*`
    - `CometAdminDateTimePicker-*` -> `CometAdminLegacyDateTimePicker-*`
    - `CometAdminTimePicker-*` -> `CometAdminLegacyTimePicker-*`

    Update the component-keys when using `defaultProps` or `styleOverrides` in the theme:
    - `CometAdminDatePicker` -> `CometAdminLegacyDatePicker`
    - `CometAdminDateRangePicker` -> `CometAdminLegacyDateRangePicker`
    - `CometAdminDateTimePicker` -> `CometAdminLegacyDateTimePicker`
    - `CometAdminTimePicker` -> `CometAdminLegacyTimePicker`

- 15e771b: Deprecate `TimeRangePicker`, `TimeRangeField` and `FinalFormTimeRangePicker` and add a "Legacy" prefix to their class-names and theme component-key

    Their new counterparts in `@comet/admin` are now considered stable.

    **Consider using the new components from `@comet/admin`**

    In most cases, the new components will be a drop-in replacement for the legacy components, so you can simply replace the imports:

    | Legacy component from `@comet/admin-date-time` | New component from `@comet/admin`                  |
    | ---------------------------------------------- | -------------------------------------------------- |
    | `TimeRangePicker`                              | `TimeRangePicker`                                  |
    | `TimeRangeField`                               | `TimeRangePickerField`                             |
    | `FinalFormTimeRangePicker`                     | `TimeRangePickerField` (without using `<Field />`) |

    **To continue using the existing component, the following changes will need to be made:**

    Update any use of class-names of the component's slots:
    - `CometAdminTimeRangePicker-*` -> `CometAdminLegacyTimeRangePicker-*`

    Update the component-key when using `defaultProps` or `styleOverrides` in the theme:
    - `CometAdminTimeRangePicker` -> `CometAdminLegacyTimeRangePicker`

- 5f1566a: Make packages ESM-only

### Minor Changes

- 1a83c01: Deprecate the `@comet/admin-date-time` package

    All of its components now have stable replacements in `@comet/admin`. The remaining exports (`DatePickerNavigation`, `DateFnsLocaleProvider`, `DateFnsLocaleContext` and `useDateFnsLocale`) are now marked as deprecated as well.

    See the [migration guide](https://docs.comet-dxp.com/docs/migration-guide/migration-from-v8-to-v9) for how to migrate to the new components in `@comet/admin`.

- f066335: Add support for React 19

### Patch Changes

- 92281f1: Add `"sideEffects"` to package.json for better tree-shakability
- Updated dependencies [92281f1]
- Updated dependencies [15e771b]
- Updated dependencies [d7b77af]
- Updated dependencies [8c2fdde]
- Updated dependencies [f066335]
- Updated dependencies [b4ba869]
- Updated dependencies [57678d0]
- Updated dependencies [fdabaf1]
- Updated dependencies [8e40458]
- Updated dependencies [5f1566a]
- Updated dependencies [99140f8]
- Updated dependencies [b459ec7]
- Updated dependencies [cabba53]
- Updated dependencies [8e3a074]
- Updated dependencies [3fda20b]
- Updated dependencies [fd5c36f]
- Updated dependencies [3c81ff0]
- Updated dependencies [631540c]
- Updated dependencies [2fe9d4b]
- Updated dependencies [460cbfb]
- Updated dependencies [9cb3f95]
    - @comet/admin@9.0.0
    - @comet/admin-icons@9.0.0

## 9.0.0-beta.6

### Major Changes

- 15e771b: Deprecate `TimeRangePicker`, `TimeRangeField` and `FinalFormTimeRangePicker` and add a "Legacy" prefix to their class-names and theme component-key

    Their new counterparts in `@comet/admin` are now considered stable.

    **Consider using the new components from `@comet/admin`**

    In most cases, the new components will be a drop-in replacement for the legacy components, so you can simply replace the imports:

    | Legacy component from `@comet/admin-date-time` | New component from `@comet/admin`                  |
    | ---------------------------------------------- | -------------------------------------------------- |
    | `TimeRangePicker`                              | `TimeRangePicker`                                  |
    | `TimeRangeField`                               | `TimeRangePickerField`                             |
    | `FinalFormTimeRangePicker`                     | `TimeRangePickerField` (without using `<Field />`) |

    **To continue using the existing component, the following changes will need to be made:**

    Update any use of class-names of the component's slots:
    - `CometAdminTimeRangePicker-*` -> `CometAdminLegacyTimeRangePicker-*`

    Update the component-key when using `defaultProps` or `styleOverrides` in the theme:
    - `CometAdminTimeRangePicker` -> `CometAdminLegacyTimeRangePicker`

### Minor Changes

- 1a83c01: Deprecate the `@comet/admin-date-time` package

    All of its components now have stable replacements in `@comet/admin`. The remaining exports (`DatePickerNavigation`, `DateFnsLocaleProvider`, `DateFnsLocaleContext` and `useDateFnsLocale`) are now marked as deprecated as well.

    See the [migration guide](https://docs.comet-dxp.com/docs/migration-guide/migration-from-v8-to-v9) for how to migrate to the new components in `@comet/admin`.

### Patch Changes

- Updated dependencies [15e771b]
- Updated dependencies [b4ba869]
- Updated dependencies [57678d0]
- Updated dependencies [b459ec7]
    - @comet/admin@9.0.0-beta.6
    - @comet/admin-icons@9.0.0-beta.6

## 9.0.0-beta.5

### Patch Changes

- Updated dependencies [fdabaf1]
    - @comet/admin@9.0.0-beta.5
    - @comet/admin-icons@9.0.0-beta.5

## 9.0.0-beta.4

### Patch Changes

- Updated dependencies [d7b77af]
- Updated dependencies [8e40458]
- Updated dependencies [2fe9d4b]
- Updated dependencies [460cbfb]
    - @comet/admin@9.0.0-beta.4
    - @comet/admin-icons@9.0.0-beta.4

## 9.0.0-beta.3

### Patch Changes

- Updated dependencies [cabba53]
- Updated dependencies [3c81ff0]
    - @comet/admin@9.0.0-beta.3
    - @comet/admin-icons@9.0.0-beta.3

## 9.0.0-beta.2

### Patch Changes

- 92281f1: Add `"sideEffects"` to package.json for better tree-shakability
- Updated dependencies [92281f1]
- Updated dependencies [99140f8]
- Updated dependencies [9cb3f95]
    - @comet/admin@9.0.0-beta.2
    - @comet/admin-icons@9.0.0-beta.2

## 9.0.0-beta.1

### Patch Changes

- Updated dependencies [8c2fdde]
- Updated dependencies [8e3a074]
    - @comet/admin@9.0.0-beta.1
    - @comet/admin-icons@9.0.0-beta.1

## 9.0.0-beta.0

### Major Changes

- 3fda20b: Add a "Legacy" prefix to class-names and theme component-keys

    This affects the components of which their new counterparts are now considered stable in `@comet/admin`.

    **Consider using the new components from `@comet/admin`**

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
    | `DateTimePicker`                               | `DateTimePicker`                                   |
    | `DateTimeField`                                | `DateTimePickerField`                              |
    | `FinalFormDateTimePicker`                      | `DateTimePickerField` (without using `<Field />`)  |

    **To continue using the existing components, the following changes will need to be made:**

    Update any use of class-names of the component's slots:
    - `CometAdminDatePicker-*` -> `CometAdminLegacyDatePicker-*`
    - `CometAdminDateRangePicker-*` -> `CometAdminLegacyDateRangePicker-*`
    - `CometAdminDateTimePicker-*` -> `CometAdminLegacyDateTimePicker-*`
    - `CometAdminTimePicker-*` -> `CometAdminLegacyTimePicker-*`

    Update the component-keys when using `defaultProps` or `styleOverrides` in the theme:
    - `CometAdminDatePicker` -> `CometAdminLegacyDatePicker`
    - `CometAdminDateRangePicker` -> `CometAdminLegacyDateRangePicker`
    - `CometAdminDateTimePicker` -> `CometAdminLegacyDateTimePicker`
    - `CometAdminTimePicker` -> `CometAdminLegacyTimePicker`

- 5f1566a: Make packages ESM-only

### Minor Changes

- f066335: Add support for React 19

### Patch Changes

- Updated dependencies [f066335]
- Updated dependencies [5f1566a]
- Updated dependencies [3fda20b]
- Updated dependencies [fd5c36f]
- Updated dependencies [631540c]
    - @comet/admin-icons@9.0.0-beta.0
    - @comet/admin@9.0.0-beta.0

## 8.20.0

### Patch Changes

- Updated dependencies [412ed19]
- Updated dependencies [caceff8]
    - @comet/admin@8.20.0
    - @comet/admin-icons@8.20.0

## 8.19.0

### Patch Changes

- Updated dependencies [fff2cc2]
- Updated dependencies [fff2cc2]
    - @comet/admin@8.19.0
    - @comet/admin-icons@8.19.0

## 8.18.0

### Patch Changes

- Updated dependencies [0ce431c]
- Updated dependencies [d344f53]
    - @comet/admin@8.18.0
    - @comet/admin-icons@8.18.0

## 8.17.1

### Patch Changes

- Updated dependencies [91e9a8f]
    - @comet/admin-icons@8.17.1
    - @comet/admin@8.17.1

## 8.17.0

### Patch Changes

- Updated dependencies [45163f1]
    - @comet/admin@8.17.0
    - @comet/admin-icons@8.17.0

## 8.16.0

### Patch Changes

- Updated dependencies [472b496]
    - @comet/admin@8.16.0
    - @comet/admin-icons@8.16.0

## 8.15.0

### Patch Changes

- Updated dependencies [cc96333]
- Updated dependencies [180d1e3]
- Updated dependencies [f7b9de9]
- Updated dependencies [39a9bb0]
- Updated dependencies [5b52998]
- Updated dependencies [0c2435a]
    - @comet/admin@8.15.0
    - @comet/admin-icons@8.15.0

## 8.14.0

### Patch Changes

- Updated dependencies [f31b52e]
- Updated dependencies [5075f7a]
- Updated dependencies [d0a7c96]
    - @comet/admin@8.14.0
    - @comet/admin-icons@8.14.0

## 8.13.0

### Patch Changes

- Updated dependencies [60ecc0a]
- Updated dependencies [dbf8774]
    - @comet/admin@8.13.0
    - @comet/admin-icons@8.13.0

## 8.12.0

### Patch Changes

- Updated dependencies [12466e4]
    - @comet/admin@8.12.0
    - @comet/admin-icons@8.12.0

## 8.11.1

### Patch Changes

- Updated dependencies [a498b80]
    - @comet/admin@8.11.1
    - @comet/admin-icons@8.11.1

## 8.11.0

### Minor Changes

- 9d5e331: Enable `@typescript-eslint/consistent-type-exports` in `@comet/eslint-config/future/react.js`

### Patch Changes

- Updated dependencies [198da7b]
- Updated dependencies [2580c61]
- Updated dependencies [f0b1eb1]
- Updated dependencies [9c091ec]
- Updated dependencies [f293762]
- Updated dependencies [9d5e331]
- Updated dependencies [5337c20]
- Updated dependencies [7e34c0b]
- Updated dependencies [ed03e8d]
    - @comet/admin@8.11.0
    - @comet/admin-icons@8.11.0

## 8.10.0

### Patch Changes

- Updated dependencies [1918d88]
    - @comet/admin@8.10.0
    - @comet/admin-icons@8.10.0

## 8.9.0

### Patch Changes

- @comet/admin@8.9.0
- @comet/admin-icons@8.9.0

## 8.8.0

### Patch Changes

- @comet/admin@8.8.0
- @comet/admin-icons@8.8.0

## 8.7.1

### Patch Changes

- @comet/admin@8.7.1
- @comet/admin-icons@8.7.1

## 8.7.0

### Patch Changes

- Updated dependencies [a8e8132]
    - @comet/admin@8.7.0
    - @comet/admin-icons@8.7.0

## 8.6.0

### Patch Changes

- Updated dependencies [6c5578a]
    - @comet/admin@8.6.0
    - @comet/admin-icons@8.6.0

## 8.5.2

### Patch Changes

- @comet/admin@8.5.2
- @comet/admin-icons@8.5.2

## 8.5.1

### Patch Changes

- @comet/admin@8.5.1
- @comet/admin-icons@8.5.1

## 8.5.0

### Patch Changes

- Updated dependencies [a2af2c6]
- Updated dependencies [c8359f6]
    - @comet/admin@8.5.0
    - @comet/admin-icons@8.5.0

## 8.4.2

### Patch Changes

- Updated dependencies [a57d092]
    - @comet/admin@8.4.2
    - @comet/admin-icons@8.4.2

## 8.4.1

### Patch Changes

- Updated dependencies [9374018]
    - @comet/admin@8.4.1
    - @comet/admin-icons@8.4.1

## 8.4.0

### Patch Changes

- Updated dependencies [a85e7cb]
- Updated dependencies [ff6d79a]
- Updated dependencies [ff6d79a]
    - @comet/admin@8.4.0
    - @comet/admin-icons@8.4.0

## 8.3.0

### Patch Changes

- Updated dependencies [422328b]
- Updated dependencies [ae1dbab]
- Updated dependencies [becc06c]
- Updated dependencies [12e9230]
- Updated dependencies [6f30126]
- Updated dependencies [1bd73a0]
- Updated dependencies [d682135]
- Updated dependencies [ae1dbab]
- Updated dependencies [becc06c]
    - @comet/admin@8.3.0
    - @comet/admin-icons@8.3.0

## 8.2.0

### Patch Changes

- Updated dependencies [ea545c4]
- Updated dependencies [dfafdb3]
- Updated dependencies [d7ab390]
- Updated dependencies [08ad5fe]
- Updated dependencies [01ef80b]
- Updated dependencies [0b08988]
- Updated dependencies [85141bf]
- Updated dependencies [0cfcf90]
    - @comet/admin@8.2.0
    - @comet/admin-icons@8.2.0

## 8.1.1

### Patch Changes

- @comet/admin@8.1.1
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

### Patch Changes

- Updated dependencies [00e6a12]
- Updated dependencies [2f33286]
- Updated dependencies [ec9bce5]
- Updated dependencies [3323fa9]
- Updated dependencies [e70eb31]
- Updated dependencies [911a6da]
    - @comet/admin@8.1.0
    - @comet/admin-icons@8.1.0

## 8.0.0

### Major Changes

- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

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

### Minor Changes

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

- 682a674: Add support for React 18

### Patch Changes

- b8817b8: Add `DatePickerNavigationClassKey`, `DatePickerNavigationProps`, `DateTimePickerClassKey`, `FinalFormTimePickerProps`, `TimePickerClassKey`, and `TimeRangePickerClassKey` to the public API
- Updated dependencies [e74ef46]
- Updated dependencies [9e3e943]
- Updated dependencies [afc306b]
- Updated dependencies [a93455f]
- Updated dependencies [46edfd6]
- Updated dependencies [72d1a5e]
- Updated dependencies [d99602a]
- Updated dependencies [5b8fe2e]
- Updated dependencies [7ce585d]
- Updated dependencies [4182a94]
- Updated dependencies [13d35af]
- Updated dependencies [f7429bd]
- Updated dependencies [b374300]
- Updated dependencies [d148091]
- Updated dependencies [1d28c90]
- Updated dependencies [5b8fe2e]
- Updated dependencies [bb3e809]
- Updated dependencies [f904b71]
- Updated dependencies [afc306b]
- Updated dependencies [6cfc60d]
- Updated dependencies [e15895a]
- Updated dependencies [717ede6]
- Updated dependencies [ad9b2a3]
- Updated dependencies [c48ca03]
- Updated dependencies [1c62e87]
- Updated dependencies [de6d677]
- Updated dependencies [9e3e943]
- Updated dependencies [06d5600]
- Updated dependencies [15c6fa0]
- Updated dependencies [04e308a]
- Updated dependencies [535476e]
- Updated dependencies [5a6efc1]
- Updated dependencies [34124c7]
- Updated dependencies [400dd1e]
- Updated dependencies [f9c32d2]
- Updated dependencies [a8c737b]
- Updated dependencies [09c4830]
- Updated dependencies [b8817b8]
- Updated dependencies [eeb21ce]
- Updated dependencies [cfa2f85]
- Updated dependencies [15b7dd3]
- Updated dependencies [c5d9a47]
- Updated dependencies [4828880]
- Updated dependencies [5b8fe2e]
- Updated dependencies [66abe0a]
- Updated dependencies [682a674]
- Updated dependencies [bf9b1bb]
- Updated dependencies [12a605e]
- Updated dependencies [d6a004a]
- Updated dependencies [77b52a8]
- Updated dependencies [1450882]
- Updated dependencies [43eb598]
    - @comet/admin@8.0.0
    - @comet/admin-icons@8.0.0

## 8.0.0-beta.6

### Patch Changes

- Updated dependencies [9e3e943]
- Updated dependencies [afc306b]
- Updated dependencies [afc306b]
- Updated dependencies [9e3e943]
- Updated dependencies [06d5600]
- Updated dependencies [15b7dd3]
- Updated dependencies [d6a004a]
- Updated dependencies [77b52a8]
    - @comet/admin@8.0.0-beta.6
    - @comet/admin-icons@8.0.0-beta.6

## 8.0.0-beta.5

### Patch Changes

- Updated dependencies [2cf573b]
- Updated dependencies [4182a94]
- Updated dependencies [1d28c90]
- Updated dependencies [6cfc60d]
- Updated dependencies [ad9b2a3]
- Updated dependencies [5a6efc1]
- Updated dependencies [09c4830]
- Updated dependencies [bf9b1bb]
    - @comet/admin@8.0.0-beta.5
    - @comet/admin-icons@8.0.0-beta.5

## 8.0.0-beta.4

### Patch Changes

- Updated dependencies [a93455f]
- Updated dependencies [72d1a5e]
- Updated dependencies [1c62e87]
    - @comet/admin@8.0.0-beta.4
    - @comet/admin-icons@8.0.0-beta.4

## 8.0.0-beta.3

### Patch Changes

- @comet/admin@8.0.0-beta.3
- @comet/admin-icons@8.0.0-beta.3

## 8.0.0-beta.2

### Major Changes

- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

### Patch Changes

- Updated dependencies [d99602a]
- Updated dependencies [5b8fe2e]
- Updated dependencies [5b8fe2e]
- Updated dependencies [f904b71]
- Updated dependencies [15c6fa0]
- Updated dependencies [535476e]
- Updated dependencies [5b8fe2e]
- Updated dependencies [43eb598]
    - @comet/admin@8.0.0-beta.2
    - @comet/admin-icons@8.0.0-beta.2

## 8.0.0-beta.1

### Patch Changes

- @comet/admin@8.0.0-beta.1
- @comet/admin-icons@8.0.0-beta.1

## 8.0.0-beta.0

### Major Changes

- 04e308a: Upgrade to MUI v6

    This only causes minimal breaking changes, see the official [migration guide](https://mui.com/material-ui/migration/upgrade-to-v6/) for details.

    It is recommended to run the following codemods in your application:

    ```sh
    npx @mui/codemod@latest v6.0.0/list-item-button-prop admin/src
    npx @mui/codemod@latest v6.0.0/styled admin/src
    npx @mui/codemod@latest v6.0.0/sx-prop admin/src
    npx @mui/codemod@latest v6.0.0/theme-v6 admin/src/theme.ts
    ```

### Minor Changes

- 682a674: Add support for React 18

### Patch Changes

- b8817b8: Add `DatePickerNavigationClassKey`, `DatePickerNavigationProps`, `DateTimePickerClassKey`, `FinalFormTimePickerProps`, `TimePickerClassKey`, and `TimeRangePickerClassKey` to the public API
- Updated dependencies [7ce585d]
- Updated dependencies [f7429bd]
- Updated dependencies [b374300]
- Updated dependencies [717ede6]
- Updated dependencies [de6d677]
- Updated dependencies [04e308a]
- Updated dependencies [400dd1e]
- Updated dependencies [a8c737b]
- Updated dependencies [b8817b8]
- Updated dependencies [eeb21ce]
- Updated dependencies [cfa2f85]
- Updated dependencies [c5d9a47]
- Updated dependencies [4828880]
- Updated dependencies [682a674]
    - @comet/admin@8.0.0-beta.0
    - @comet/admin-icons@8.0.0-beta.0

## 7.25.3

### Patch Changes

- @comet/admin@7.25.3
- @comet/admin-icons@7.25.3

## 7.25.2

### Patch Changes

- @comet/admin@7.25.2
- @comet/admin-icons@7.25.2

## 7.25.1

### Patch Changes

- @comet/admin@7.25.1
- @comet/admin-icons@7.25.1

## 7.25.0

### Patch Changes

- @comet/admin@7.25.0
- @comet/admin-icons@7.25.0

## 7.24.0

### Patch Changes

- fa611381b: Don't show the `ClearInputAdornment` if the `TimePicker` is disabled
- fa611381b: Support the `disabled` prop in the `DateTimePicker`
- Updated dependencies [fc900f217]
    - @comet/admin@7.24.0
    - @comet/admin-icons@7.24.0

## 7.23.0

### Patch Changes

- @comet/admin@7.23.0
- @comet/admin-icons@7.23.0

## 7.22.0

### Patch Changes

- Updated dependencies [2cf573b72]
- Updated dependencies [086774f01]
    - @comet/admin@7.22.0
    - @comet/admin-icons@7.22.0

## 7.21.1

### Patch Changes

- Updated dependencies [b771bd6d8]
    - @comet/admin@7.21.1
    - @comet/admin-icons@7.21.1

## 7.21.0

### Patch Changes

- 1a30eb858: Adapt styling of `DateTimePicker` on mobile devices to improve readability of the placeholder
- Updated dependencies [1a30eb858]
- Updated dependencies [3e9ea613e]
    - @comet/admin@7.21.0
    - @comet/admin-icons@7.21.0

## 7.20.0

### Patch Changes

- Updated dependencies [415a83165]
- Updated dependencies [99f904f81]
- Updated dependencies [2d1726543]
    - @comet/admin@7.20.0
    - @comet/admin-icons@7.20.0

## 7.19.0

### Patch Changes

- Updated dependencies [3544127ad]
    - @comet/admin@7.19.0
    - @comet/admin-icons@7.19.0

## 7.18.0

### Minor Changes

- e6092df34: Add support for `onBlur` and `onFocus` props to the `DateTimePicker`

    These events will be triggered when either of the date or time picker is focused or blurred.

### Patch Changes

- e6092df34: Fix selection of a date where the month/year differs from the current selection in `DateTimeField` and `FinalFormDateTimePicker`
    - @comet/admin@7.18.0
    - @comet/admin-icons@7.18.0

## 7.17.0

### Patch Changes

- @comet/admin@7.17.0
- @comet/admin-icons@7.17.0

## 7.16.0

### Patch Changes

- 5b7c6b4a7: Disabled `DatePicker` fields no longer have a `ClearInputAdornment`
- Updated dependencies [ec1cf3cf8]
- Updated dependencies [bf7b89ffc]
    - @comet/admin@7.16.0
    - @comet/admin-icons@7.16.0

## 7.15.0

### Patch Changes

- Updated dependencies [a189d4ed9]
- Updated dependencies [faa54eb8e]
- Updated dependencies [7d8c36e6c]
- Updated dependencies [a189d4ed9]
- Updated dependencies [6827982fe]
    - @comet/admin@7.15.0
    - @comet/admin-icons@7.15.0

## 7.14.0

### Patch Changes

- Updated dependencies [6b75f20e4]
    - @comet/admin@7.14.0
    - @comet/admin-icons@7.14.0

## 7.13.0

### Patch Changes

- Updated dependencies [bd562d325]
- Updated dependencies [5c06e4bee]
- Updated dependencies [b918c810b]
    - @comet/admin@7.13.0
    - @comet/admin-icons@7.13.0

## 7.12.0

### Patch Changes

- Updated dependencies [af51bb408]
- Updated dependencies [92b3255d2]
- Updated dependencies [954635630]
- Updated dependencies [e8003f9c7]
- Updated dependencies [4f6e6b011]
- Updated dependencies [5583c9cff]
- Updated dependencies [7da81fa2e]
- Updated dependencies [3ddc2278b]
- Updated dependencies [0bb181a52]
    - @comet/admin@7.12.0
    - @comet/admin-icons@7.12.0

## 7.11.0

### Patch Changes

- Updated dependencies [b8b8e2747]
- Updated dependencies [1e01cca21]
- Updated dependencies [a30f0ee4d]
- Updated dependencies [20f63417e]
- Updated dependencies [e9f547d95]
- Updated dependencies [8114a6ae7]
    - @comet/admin@7.11.0
    - @comet/admin-icons@7.11.0

## 7.10.0

### Patch Changes

- Updated dependencies [8f924d591]
- Updated dependencies [aa02ca13f]
- Updated dependencies [6eba5abea]
- Updated dependencies [6eba5abea]
- Updated dependencies [bf6b03fe0]
- Updated dependencies [589b0b9ee]
    - @comet/admin@7.10.0
    - @comet/admin-icons@7.10.0

## 7.9.0

### Patch Changes

- Updated dependencies [6d6131b16]
- Updated dependencies [7cea765fe]
- Updated dependencies [48cac4dac]
- Updated dependencies [0919e3ba6]
- Updated dependencies [55d40ef08]
    - @comet/admin@7.9.0
    - @comet/admin-icons@7.9.0

## 7.8.0

### Patch Changes

- Updated dependencies [139616be6]
- Updated dependencies [d8fca0522]
- Updated dependencies [a168e5514]
- Updated dependencies [e16ad1a02]
- Updated dependencies [e78315c9c]
- Updated dependencies [c6d3ac36b]
- Updated dependencies [139616be6]
- Updated dependencies [eefb0546f]
- Updated dependencies [795ec73d9]
- Updated dependencies [8617c3bcd]
- Updated dependencies [d8298d59a]
- Updated dependencies [daacf1ea6]
- Updated dependencies [9cc75c141]
    - @comet/admin@7.8.0
    - @comet/admin-icons@7.8.0

## 7.7.0

### Patch Changes

- @comet/admin@7.7.0
- @comet/admin-icons@7.7.0

## 7.6.0

### Patch Changes

- Updated dependencies [bc19fb18c]
- Updated dependencies [37d71a89a]
- Updated dependencies [cf2ee898f]
- Updated dependencies [03afcd073]
- Updated dependencies [00d7ddae1]
- Updated dependencies [fe8909404]
    - @comet/admin@7.6.0
    - @comet/admin-icons@7.6.0

## 7.5.0

### Patch Changes

- Updated dependencies [bb7c2de72]
- Updated dependencies [9a6a64ef3]
- Updated dependencies [c59a60023]
- Updated dependencies [b5838209b]
- Updated dependencies [c8f37fbd1]
- Updated dependencies [4cea3e31b]
- Updated dependencies [216d93a10]
    - @comet/admin@7.5.0
    - @comet/admin-icons@7.5.0

## 7.4.2

### Patch Changes

- @comet/admin@7.4.2
- @comet/admin-icons@7.4.2

## 7.4.1

### Patch Changes

- @comet/admin@7.4.1
- @comet/admin-icons@7.4.1

## 7.4.0

### Patch Changes

- Updated dependencies [22863c202]
- Updated dependencies [cab7c427a]
- Updated dependencies [48d1403d7]
- Updated dependencies [1ca46e8da]
- Updated dependencies [1ca46e8da]
- Updated dependencies [bef162a60]
- Updated dependencies [bc1ed880a]
- Updated dependencies [3e013b05d]
    - @comet/admin@7.4.0
    - @comet/admin-icons@7.4.0

## 7.3.2

### Patch Changes

- Updated dependencies [2286234e5]
    - @comet/admin@7.3.2
    - @comet/admin-icons@7.3.2

## 7.3.1

### Patch Changes

- Updated dependencies [91bfda996]
    - @comet/admin@7.3.1
    - @comet/admin-icons@7.3.1

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

- Updated dependencies [6a1310cf6]
- Updated dependencies [5364ecb37]
- Updated dependencies [a1f4c0dec]
- Updated dependencies [2ab7b688e]
    - @comet/admin@7.3.0
    - @comet/admin-icons@7.3.0

## 7.2.1

### Patch Changes

- @comet/admin@7.2.1
- @comet/admin-icons@7.2.1

## 7.2.0

### Patch Changes

- Updated dependencies [0fb8d9a26]
- Updated dependencies [4b267f90d]
    - @comet/admin@7.2.0
    - @comet/admin-icons@7.2.0

## 7.1.0

### Patch Changes

- Updated dependencies [04844d39e]
- Updated dependencies [dfc4a7fff]
- Updated dependencies [b1bbd6a0c]
- Updated dependencies [c0488eb84]
- Updated dependencies [39ab15616]
- Updated dependencies [c1ab2b340]
- Updated dependencies [99a1f0ae6]
- Updated dependencies [edf14d066]
- Updated dependencies [2b68513be]
- Updated dependencies [374f383ba]
- Updated dependencies [c050f2242]
    - @comet/admin@7.1.0
    - @comet/admin-icons@7.1.0

## 7.0.0

### Major Changes

- ad73068f4: Change `DatePicker` and `DateRangePicker` values from `Date` to `string`

    This affects the `value` prop and the value returned by the `onChange` event.

    The value of `DatePicker` is a string in the format `YYYY-MM-DD`.
    The value of `DateRangePicker` is an object with `start` and `end` keys, each as a string in the format `YYYY-MM-DD`.

    The code that handles values from these components may need to be adjusted.
    This may include how the values are stored in or sent to the database.

    ```diff
    -   const [date, setDate] = useState<Date | undefined>(new Date("2024-03-10"));
    +   const [date, setDate] = useState<string | undefined>("2024-03-10");
        return <DatePicker value={date} onChange={setDate} />;
    ```

    ```diff
        const [dateRange, setDateRange] = useState<DateRange | undefined>({
    -       start: new Date("2024-03-10"),
    -       end: new Date("2024-03-16"),
    +       start: "2024-03-10",
    +       end: "2024-03-16",
        });
        return <DateRangePicker value={dateRange} onChange={setDateRange} />;
    ```

    The reason for this change is that when selecting a date like `2024-04-10` in a timezone ahead of UTC, it would be stored in a `Date` object as e.g. `2024-04-09T22:00:00.000Z`. When only the date is saved to the database, without the time, it would be saved as `2024-04-09`, which differs from the selected date.

- cb544bc3e: Remove the `clearable` prop and add a `required` prop to `DateRangePicker`, `DateTimePicker`, `TimePicker` and `TimeRangePicker`

    The clear button will automatically be shown for all optional fields.

- b87c3c292: Rename multiple props and class-keys and remove the `componentsProps` types:
    - `DatePicker`:
        - Replace the `componentsProps` prop with `slotProps`
        - Remove the `DatePickerComponentsProps` type

    - `DateRangePicker`:
        - Replace the `componentsProps` prop with `slotProps`
        - Remove the `DateRangePickerComponentsProps` type
        - Rename the `calendar` class-key to `dateRange`

    - `DateTimePicker`:
        - Replace the `componentsProps` prop with `slotProps`
        - Remove the `DateTimePickerComponentsProps` type
        - Replace the `formControl` class-key with two separate class-keys: `dateFormControl` and `timeFormControl`

    - `TimeRangePicker`:
        - Replace the `componentsProps` prop with `slotProps`
        - Remove the `TimeRangePickerComponentsProps` and `TimeRangePickerIndividualPickerProps` types
        - Replace the `formControl` class-key with two separate class-keys: `startFormControl` and `endFormControl`
        - Replace the `timePicker` class-key with two separate class-keys: `startTimePicker` and `endTimePicker`

- f8114cd39: Remove `clearable` prop from `DatePicker`

    The clear button will automatically be shown for all optional fields.

- 92eae2ba9: Change the method of overriding the styling of Admin components
    - Remove dependency on the legacy `@mui/styles` package in favor of `@mui/material/styles`.
    - Add the ability to style components using [MUI's `sx` prop](https://mui.com/system/getting-started/the-sx-prop/).
    - Add the ability to style individual elements (slots) of a component using the `slotProps` and `sx` props.
    - The `# @comet/admin-date-time syntax in the theme's `styleOverrides` is no longer supported, see: https://mui.com/material-ui/migration/v5-style-changes/#migrate-theme-styleoverrides-to-emotion

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

### Patch Changes

- b5753e612: Allow partial props in the theme's `defaultProps` instead of requiring all props when setting the `defaultProps` of a component
- Updated dependencies [05ce68ec0]
- Updated dependencies [949356e84]
- Updated dependencies [51a0861d8]
- Updated dependencies [dc8bb6a99]
- Updated dependencies [54f775497]
- Updated dependencies [73140014f]
- Updated dependencies [9a4530b06]
- Updated dependencies [dc8bb6a99]
- Updated dependencies [e3efdfcc3]
- Updated dependencies [02d33e230]
- Updated dependencies [a0bd09afa]
- Updated dependencies [8cc51b368]
- Updated dependencies [c46146cb3]
- Updated dependencies [6054fdcab]
- Updated dependencies [d0869ac82]
- Updated dependencies [9a4530b06]
- Updated dependencies [47ec528a4]
- Updated dependencies [956111ab2]
- Updated dependencies [19eaee4ca]
- Updated dependencies [758c65656]
- Updated dependencies [9a4530b06]
- Updated dependencies [04ed68cc9]
- Updated dependencies [61b2acfb2]
- Updated dependencies [0263a45fa]
- Updated dependencies [4ca4830f3]
- Updated dependencies [3397ec1b6]
- Updated dependencies [20b2bafd8]
- Updated dependencies [51a0861d8]
- Updated dependencies [9c4b7c974]
- Updated dependencies [b5753e612]
- Updated dependencies [2a7bc765c]
- Updated dependencies [774977311]
- Updated dependencies [27efe7bd8]
- Updated dependencies [f8114cd39]
- Updated dependencies [569ad0463]
- Updated dependencies [b87c3c292]
- Updated dependencies [170720b0c]
- Updated dependencies [f06f4bea6]
- Updated dependencies [119714999]
- Updated dependencies [2a7bc765c]
- Updated dependencies [d2e64d1ec]
- Updated dependencies [241249bd4]
- Updated dependencies [be4e6392d]
- Updated dependencies [a53545438]
- Updated dependencies [1a1d83156]
- Updated dependencies [a2f278bbd]
- Updated dependencies [66330e4e6]
- Updated dependencies [b0249e3bc]
- Updated dependencies [92eae2ba9]
    - @comet/admin@7.0.0
    - @comet/admin-icons@7.0.0

## 7.0.0-beta.6

### Patch Changes

- Updated dependencies [119714999]
    - @comet/admin@7.0.0-beta.6
    - @comet/admin-icons@7.0.0-beta.6

## 7.0.0-beta.5

### Patch Changes

- Updated dependencies [569ad0463]
    - @comet/admin@7.0.0-beta.5
    - @comet/admin-icons@7.0.0-beta.5

## 7.0.0-beta.4

### Patch Changes

- Updated dependencies [a0bd09afa]
- Updated dependencies [170720b0c]
    - @comet/admin@7.0.0-beta.4
    - @comet/admin-icons@7.0.0-beta.4

## 7.0.0-beta.3

### Patch Changes

- Updated dependencies [ce5eaede2]
    - @comet/admin@7.0.0-beta.3
    - @comet/admin-icons@7.0.0-beta.3

## 7.0.0-beta.2

### Patch Changes

- Updated dependencies [2fc764e29]
    - @comet/admin@7.0.0-beta.2
    - @comet/admin-icons@7.0.0-beta.2

## 7.0.0-beta.1

### Patch Changes

- @comet/admin@7.0.0-beta.1
- @comet/admin-icons@7.0.0-beta.1

## 7.0.0-beta.0

### Major Changes

- ad73068f4: Change `DatePicker` and `DateRangePicker` values from `Date` to `string`

    This affects the `value` prop and the value returned by the `onChange` event.

    The value of `DatePicker` is a string in the format `YYYY-MM-DD`.
    The value of `DateRangePicker` is an object with `start` and `end` keys, each as a string in the format `YYYY-MM-DD`.

    The code that handles values from these components may need to be adjusted.
    This may include how the values are stored in or sent to the database.

    ```diff
    -   const [date, setDate] = useState<Date | undefined>(new Date("2024-03-10"));
    +   const [date, setDate] = useState<string | undefined>("2024-03-10");
        return <DatePicker value={date} onChange={setDate} />;
    ```

    ```diff
        const [dateRange, setDateRange] = useState<DateRange | undefined>({
    -       start: new Date("2024-03-10"),
    -       end: new Date("2024-03-16"),
    +       start: "2024-03-10",
    +       end: "2024-03-16",
        });
        return <DateRangePicker value={dateRange} onChange={setDateRange} />;
    ```

    The reason for this change is that when selecting a date like `2024-04-10` in a timezone ahead of UTC, it would be stored in a `Date` object as e.g. `2024-04-09T22:00:00.000Z`. When only the date is saved to the database, without the time, it would be saved as `2024-04-09`, which differs from the selected date.

- cb544bc3e: Remove the `clearable` prop and add a `required` prop to `DateRangePicker`, `DateTimePicker`, `TimePicker` and `TimeRangePicker`

    The clear button will automatically be shown for all optional fields.

- b87c3c292: Rename multiple props and class-keys and remove the `componentsProps` types:
    - `DatePicker`:
        - Replace the `componentsProps` prop with `slotProps`
        - Remove the `DatePickerComponentsProps` type

    - `DateRangePicker`:
        - Replace the `componentsProps` prop with `slotProps`
        - Remove the `DateRangePickerComponentsProps` type
        - Rename the `calendar` class-key to `dateRange`

    - `DateTimePicker`:
        - Replace the `componentsProps` prop with `slotProps`
        - Remove the `DateTimePickerComponentsProps` type
        - Replace the `formControl` class-key with two separate class-keys: `dateFormControl` and `timeFormControl`

    - `TimeRangePicker`:
        - Replace the `componentsProps` prop with `slotProps`
        - Remove the `TimeRangePickerComponentsProps` and `TimeRangePickerIndividualPickerProps` types
        - Replace the `formControl` class-key with two separate class-keys: `startFormControl` and `endFormControl`
        - Replace the `timePicker` class-key with two separate class-keys: `startTimePicker` and `endTimePicker`

- f8114cd39: Remove `clearable` prop from `DatePicker`

    The clear button will automatically be shown for all optional fields.

- 92eae2ba9: Change the method of overriding the styling of Admin components
    - Remove dependency on the legacy `@mui/styles` package in favor of `@mui/material/styles`.
    - Add the ability to style components using [MUI's `sx` prop](https://mui.com/system/getting-started/the-sx-prop/).
    - Add the ability to style individual elements (slots) of a component using the `slotProps` and `sx` props.
    - The `# @comet/admin-date-time syntax in the theme's `styleOverrides` is no longer supported, see: https://mui.com/material-ui/migration/v5-style-changes/#migrate-theme-styleoverrides-to-emotion

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

### Patch Changes

- b5753e612: Allow partial props in the theme's `defaultProps` instead of requiring all props when setting the `defaultProps` of a component
- Updated dependencies [865f253d8]
- Updated dependencies [05ce68ec0]
- Updated dependencies [51a0861d8]
- Updated dependencies [dc8bb6a99]
- Updated dependencies [54f775497]
- Updated dependencies [73140014f]
- Updated dependencies [9a4530b06]
- Updated dependencies [dc8bb6a99]
- Updated dependencies [e3efdfcc3]
- Updated dependencies [02d33e230]
- Updated dependencies [6054fdcab]
- Updated dependencies [d0869ac82]
- Updated dependencies [9a4530b06]
- Updated dependencies [47ec528a4]
- Updated dependencies [956111ab2]
- Updated dependencies [19eaee4ca]
- Updated dependencies [758c65656]
- Updated dependencies [9a4530b06]
- Updated dependencies [04ed68cc9]
- Updated dependencies [61b2acfb2]
- Updated dependencies [0263a45fa]
- Updated dependencies [4ca4830f3]
- Updated dependencies [3397ec1b6]
- Updated dependencies [20b2bafd8]
- Updated dependencies [51a0861d8]
- Updated dependencies [9c4b7c974]
- Updated dependencies [b5753e612]
- Updated dependencies [2a7bc765c]
- Updated dependencies [774977311]
- Updated dependencies [f8114cd39]
- Updated dependencies [b87c3c292]
- Updated dependencies [f06f4bea6]
- Updated dependencies [2a7bc765c]
- Updated dependencies [d2e64d1ec]
- Updated dependencies [241249bd4]
- Updated dependencies [be4e6392d]
- Updated dependencies [a53545438]
- Updated dependencies [1a1d83156]
- Updated dependencies [a2f278bbd]
- Updated dependencies [66330e4e6]
- Updated dependencies [b0249e3bc]
- Updated dependencies [92eae2ba9]
    - @comet/admin@7.0.0-beta.0
    - @comet/admin-icons@7.0.0-beta.0

## 6.17.1

### Patch Changes

- @comet/admin@6.17.1
- @comet/admin-icons@6.17.1

## 6.17.0

### Patch Changes

- Updated dependencies [536e95c02]
- Updated dependencies [7ecc30eba]
- Updated dependencies [ec4685bf3]
    - @comet/admin@6.17.0
    - @comet/admin-icons@6.17.0

## 6.16.0

### Patch Changes

- Updated dependencies [fb0fe2539]
- Updated dependencies [747fe32cc]
    - @comet/admin@6.16.0
    - @comet/admin-icons@6.16.0

## 6.15.1

### Patch Changes

- @comet/admin@6.15.1
- @comet/admin-icons@6.15.1

## 6.15.0

### Patch Changes

- Updated dependencies [406027806]
- Updated dependencies [0654f7bce]
    - @comet/admin-icons@6.15.0
    - @comet/admin@6.15.0

## 6.14.1

### Patch Changes

- @comet/admin@6.14.1
- @comet/admin-icons@6.14.1

## 6.14.0

### Patch Changes

- Updated dependencies [2fc764e29]
- Updated dependencies [efccc42a3]
- Updated dependencies [012a768ee]
    - @comet/admin@6.14.0
    - @comet/admin-icons@6.14.0

## 6.13.0

### Patch Changes

- Updated dependencies [5e25348bb]
- Updated dependencies [796e83206]
    - @comet/admin@6.13.0
    - @comet/admin-icons@6.13.0

## 6.12.0

### Patch Changes

- Updated dependencies [16ffa7be9]
    - @comet/admin@6.12.0
    - @comet/admin-icons@6.12.0

## 6.11.0

### Patch Changes

- Updated dependencies [8e3dec523]
    - @comet/admin@6.11.0
    - @comet/admin-icons@6.11.0

## 6.10.0

### Patch Changes

- Updated dependencies [a8a098a24]
- Updated dependencies [d4a269e1e]
- Updated dependencies [52130afba]
- Updated dependencies [e938254bf]
    - @comet/admin@6.10.0
    - @comet/admin-icons@6.10.0

## 6.9.0

### Minor Changes

- e85837a17: Loosen peer dependency on `react-intl` to allow using v6

### Patch Changes

- Updated dependencies [9ff9d66c6]
- Updated dependencies [e85837a17]
    - @comet/admin@6.9.0
    - @comet/admin-icons@6.9.0

## 6.8.0

### Patch Changes

- @comet/admin@6.8.0
- @comet/admin-icons@6.8.0

## 6.7.0

### Patch Changes

- @comet/admin@6.7.0
- @comet/admin-icons@6.7.0

## 6.6.2

### Patch Changes

- @comet/admin@6.6.2
- @comet/admin-icons@6.6.2

## 6.6.1

### Patch Changes

- @comet/admin@6.6.1
- @comet/admin-icons@6.6.1

## 6.6.0

### Patch Changes

- Updated dependencies [95b97d768]
- Updated dependencies [6b04ac9a4]
    - @comet/admin@6.6.0
    - @comet/admin-icons@6.6.0

## 6.5.0

### Patch Changes

- Updated dependencies [6cb2f9046]
    - @comet/admin@6.5.0
    - @comet/admin-icons@6.5.0

## 6.4.0

### Patch Changes

- Updated dependencies [8ce21f34b]
- Updated dependencies [811903e60]
    - @comet/admin@6.4.0
    - @comet/admin-icons@6.4.0

## 6.3.0

### Patch Changes

- @comet/admin@6.3.0
- @comet/admin-icons@6.3.0

## 6.2.1

### Patch Changes

- @comet/admin@6.2.1
- @comet/admin-icons@6.2.1

## 6.2.0

### Patch Changes

- @comet/admin@6.2.0
- @comet/admin-icons@6.2.0

## 6.1.0

### Patch Changes

- Updated dependencies [dcfa03ca]
- Updated dependencies [08e0da09]
- Updated dependencies [b35bb8d1]
- Updated dependencies [8eb13750]
- Updated dependencies [a4fac913]
    - @comet/admin@6.1.0
    - @comet/admin-icons@6.1.0

## 6.0.0

### Patch Changes

- Updated dependencies [921f6378]
- Updated dependencies [76e50aa8]
- Updated dependencies [298b63b7]
- Updated dependencies [a525766c]
- Updated dependencies [0d768540]
- Updated dependencies [62779124]
    - @comet/admin@6.0.0
    - @comet/admin-icons@6.0.0

## 5.6.0

### Patch Changes

- @comet/admin@5.6.0
- @comet/admin-icons@5.6.0

## 5.5.0

### Patch Changes

- @comet/admin@5.5.0
- @comet/admin-icons@5.5.0

## 5.4.0

### Patch Changes

- Updated dependencies [ba800163]
- Updated dependencies [60a18392]
    - @comet/admin@5.4.0
    - @comet/admin-icons@5.4.0

## 5.3.0

### Patch Changes

- Updated dependencies [0ff9b9ba]
- Updated dependencies [0ff9b9ba]
- Updated dependencies [a677a162]
- Updated dependencies [60cc1b2a]
- Updated dependencies [5435b278]
    - @comet/admin-icons@5.3.0
    - @comet/admin@5.3.0

## 5.2.0

### Patch Changes

- Updated dependencies [25daac07]
- Updated dependencies [0bed4e7c]
- Updated dependencies [9fc7d474]
    - @comet/admin@5.2.0
    - @comet/admin-icons@5.2.0

## 5.1.0

### Patch Changes

- Updated dependencies [21c30931]
- Updated dependencies [93b3d971]
- Updated dependencies [e33cd652]
    - @comet/admin@5.1.0
    - @comet/admin-icons@5.1.0

## 5.0.0

### Patch Changes

- Updated dependencies [0453c36a]
- Updated dependencies [692c8555]
- Updated dependencies [2559ff74]
- Updated dependencies [fe5e0735]
- Updated dependencies [ed692f50]
- Updated dependencies [987f08b3]
- Updated dependencies [d0773a1a]
- Updated dependencies [5f0f8e6e]
- Updated dependencies [7c6eb68e]
- Updated dependencies [d4bcab04]
- Updated dependencies [0f2794e7]
- Updated dependencies [80b007ae]
- Updated dependencies [a7116784]
- Updated dependencies [e57c6c66]
    - @comet/admin@5.0.0
    - @comet/admin-icons@5.0.0

## 4.7.0

### Patch Changes

- Updated dependencies [dbdc0f55]
- Updated dependencies [eac9990b]
- Updated dependencies [fe310df8]
- Updated dependencies [fde8e42b]
    - @comet/admin-icons@4.7.0
    - @comet/admin@4.7.0

## 4.6.0

### Patch Changes

- Updated dependencies [c3b7f992]
- Updated dependencies [c3b7f992]
    - @comet/admin-icons@4.6.0
    - @comet/admin@4.6.0

## 4.5.0

### Patch Changes

- Updated dependencies [46cf5a8b]
- Updated dependencies [8a2c3302]
- Updated dependencies [6d4ca5bf]
- Updated dependencies [07d921d2]
    - @comet/admin@4.5.0
    - @comet/admin-icons@4.5.0

## 4.4.3

### Patch Changes

- @comet/admin@4.4.3
- @comet/admin-icons@4.4.3

## 4.4.2

### Patch Changes

- @comet/admin@4.4.2
- @comet/admin-icons@4.4.2

## 4.4.1

### Patch Changes

- Updated dependencies [662abcc9]
    - @comet/admin@4.4.1
    - @comet/admin-icons@4.4.1

## 4.4.0

### Minor Changes

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

### Patch Changes

- Updated dependencies [e824ffa6]
- Updated dependencies [3e15b819]
- Updated dependencies [a77da844]
    - @comet/admin@4.4.0
    - @comet/admin-icons@4.4.0

## 4.3.0

### Patch Changes

- @comet/admin@4.3.0
- @comet/admin-icons@4.3.0

## 4.2.0

### Patch Changes

- Updated dependencies [67e54a82]
- Updated dependencies [3567533e]
- Updated dependencies [7b614c13]
- Updated dependencies [aaf1586c]
- Updated dependencies [d25a7cbb]
    - @comet/admin@4.2.0
    - @comet/admin-icons@4.2.0

## 4.1.0

### Patch Changes

- Updated dependencies [51466b1a]
- Updated dependencies [51466b1a]
- Updated dependencies [51466b1a]
- Updated dependencies [51466b1a]
- Updated dependencies [51466b1a]
- Updated dependencies [51466b1a]
- Updated dependencies [c5f2f918]
    - @comet/admin@4.1.0
    - @comet/admin-icons@4.1.0
