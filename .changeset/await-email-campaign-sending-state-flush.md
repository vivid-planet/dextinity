---
"@dextinity/brevo-api": patch
---

Persist email campaign sending states loaded from Brevo reliably

`loadEmailCampaignSendingStatesForEmailCampaigns` didn't await its flush, so the write raced the response: the updated sending states could be lost and a failing flush surfaced as an unhandled promise rejection instead of an error for the caller.
