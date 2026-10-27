---
"@dextinity/admin-generator": patch
"@dextinity/api-generator": patch
"@dextinity/cli": patch
---

Update `commander` to v14

Commands now fail with "too many arguments" when they receive positional arguments they don't declare. Before, these arguments were ignored.
For example, an unquoted glob passed to `dextinity-admin-generator generate --file` is expanded by the shell into several arguments, and only the first file was generated. Quote the glob so the admin generator receives it as one pattern:

```bash
dextinity-admin-generator generate --file 'src/products/**/*.dextinityGen.tsx'
```
