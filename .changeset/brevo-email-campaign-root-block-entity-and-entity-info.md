---
"@dextinity/brevo-api": patch
---

Add `@RootBlockEntity()` and `@EntityInfo()` to the email campaign entity

The entity created by `createEmailCampaignEntity` has a root block (`content`), but was missing `@RootBlockEntity()`, so it wasn't picked up by the root block discovery. Blocks used inside an email campaign therefore never appeared in the block index: dependencies of the campaign's content weren't tracked, DAM files used in a campaign showed no usages, and their IDs weren't remapped when copying between scopes.

`@EntityInfo()` was missing as well, so the campaign had no entry in the `EntityInfo` view. Anything referencing a campaign (dependencies and warnings) couldn't resolve a name for it and logged a warning about the missing decorator instead.

The entity now uses `title` as name and `subject` as secondary information.
