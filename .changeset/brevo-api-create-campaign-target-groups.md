---
"@dextinity/brevo-api": patch
---

Assign the target groups passed to `createBrevoEmailCampaign` to the campaign

The `brevoTargetGroups` input field was spread into the entity as-is, but the entity property is named `targetGroups`, so newly created campaigns ended up without any target groups.
