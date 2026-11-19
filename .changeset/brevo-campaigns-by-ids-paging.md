---
"@dextinity/brevo-api": patch
---

Fix `BrevoApiCampaignsService.loadBrevoCampaignsByIds` not returning campaigns that aren't on the first page of Brevo's campaign list

Previously, paging stopped at the first page that contained none of the requested campaigns, so older campaigns were skipped, for instance when syncing the sending states of email campaigns.
Now, paging continues until all requested campaigns are found or Brevo returns the last page.
