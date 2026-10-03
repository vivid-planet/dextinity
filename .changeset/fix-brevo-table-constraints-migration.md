---
"@comet/brevo-api": patch
---

Add migration to fix Brevo table constraints and column types

- Update `BrevoEmailCampaign_targetGroups` primary key and foreign key constraints to use correct naming
- Add nullable to `BrevoEmailImportLog.importId` Property and Field
- Remove Property decorator from `BrevoEmailImportLog.contactSource` since it already has Enum decorator
- Change `BrevoTargetGroup.isMainList` column to not null
