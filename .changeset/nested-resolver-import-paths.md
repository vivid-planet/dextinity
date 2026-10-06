---
"@comet/api-generator": patch
---

Fix import paths in nested entity resolvers when the nested entity is located in a different directory

The resolver is written to the parent entity's `generated` directory, but the import paths were calculated relative to the nested entity's `generated` directory.
