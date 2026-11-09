---
"@dextinity/brevo-api": patch
---

Mark Brevo email campaigns as `FAILED` if sending them in the background was interrupted

If the API restarted while `sendBrevoEmailCampaignNow` was sending a campaign in the background, the campaign stayed `SCHEDULED` forever and couldn't be edited or sent again. A campaign that is still a draft in Brevo (or wasn't created in Brevo at all) one hour after it was scheduled is now set to `FAILED`, so it can be edited and sent again. A background send that takes longer than that is aborted before the campaign is sent, so the campaign isn't sent twice.
