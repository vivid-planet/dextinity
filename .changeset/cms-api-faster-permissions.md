---
"@dextinity/cms-api": patch
---

Speed up the calculation of user permissions and `allowedContentScopes` for users with many permissions and content scopes

Permission IDs are now hashed with `node:crypto` instead of the pure-JavaScript SHA-1 of `uuid-by-string`. The generated IDs are unchanged.
`allowedContentScopes` no longer compares every available content scope with every content scope of every permission.
