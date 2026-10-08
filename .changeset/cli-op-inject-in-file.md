---
"@dextinity/cli": patch
---

Fix `inject-site-configs` failing with "expected data on stdin but none found" for configs with 1Password references

Since 10.9.0, `inject-site-configs` passed the references to `op inject` through stdin, which `op` doesn't accept when Node starts it.
The references are now passed in a temporary file.
