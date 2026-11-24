---
"@dextinity/admin": major
---

Merge `@dextinity/admin-color-picker` into `@dextinity/admin`

The `@dextinity/admin-color-picker` package has been removed. Import `ColorField`, `ColorPicker`, `FinalFormColorPicker` and their types from `@dextinity/admin` instead:

```diff
- import { ColorField } from "@dextinity/admin-color-picker";
+ import { ColorField } from "@dextinity/admin";
```
