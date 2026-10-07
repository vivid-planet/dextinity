---
"@dextinity/cli": patch
---

Resolve all 1Password references in `inject-site-configs` with a single `op inject` call

Previously, `inject-site-configs` started one `op read` process per reference and site-config placeholder, which took about 1.2 seconds each.
Now each unique reference is read once, which also reduces the reads counted against the 1Password rate limits.
