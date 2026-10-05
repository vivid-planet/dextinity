---
"@dextinity/cli": patch
---

Insert 1Password secrets literally in `inject-site-configs`

Previously, `$&`, `$'` and `` $` `` in a secret were interpreted as replacement patterns, so the injected value differed from the secret stored in 1Password.
