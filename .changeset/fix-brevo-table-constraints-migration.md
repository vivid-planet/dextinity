---
"@dextinity/brevo-api": patch
---

Add migration to fix Brevo table constraints and column types

- Rename constraints of `BrevoEmailCampaign`, `BrevoTargetGroup` and `BrevoEmailCampaign_targetGroups` to match the `Brevo`-prefixed table names
- Add nullable to `BrevoEmailImportLog.importId` Property and Field
- Remove Property decorator from `BrevoEmailImportLog.contactSource` since it already has Enum decorator
- Change `BrevoTargetGroup.isMainList` column to not null
- Add missing primary keys to `BrevoEmailImportLog` and `BrevoBlacklistedContacts`
