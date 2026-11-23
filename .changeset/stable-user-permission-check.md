---
"@dextinity/cms-admin": patch
---

Return a referentially stable callback from `useUserPermissionCheck`

The returned function changed identity on every render, so consumers using it as a `useMemo`/`useCallback` dependency never got a cache hit. It is now memoized and only changes when the current user or the content scope changes.
