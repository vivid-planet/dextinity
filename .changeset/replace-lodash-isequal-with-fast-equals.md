---
"@dextinity/admin": minor
"@dextinity/cms-admin": patch
---

Replace the deprecated `lodash.isequal` dependency with `fast-equals`

`lodash.isequal` is deprecated on npm, and its replacement notice points at `node:util.isDeepStrictEqual`, which isn't available in the browser. `fast-equals` already ships in the admin bundle as a dependency of `@tiptap/react`, behaves identically for the data compared here, and brings its own types.

`@dextinity/admin` now exports `isEqual`, so applications don't need a deep-equality dependency of their own:

```tsx
import { isEqual } from "@dextinity/admin";

<FinalForm initialValuesEqual={isEqual} ... />;
```
