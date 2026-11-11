---
"@dextinity/brevo-api": patch
---

Share the cached Brevo campaign between `loadBrevoCampaignById` and `loadBrevoCampaignsByIds`

`loadBrevoCampaignById` cached the campaign under the email campaign's ID instead of its Brevo ID, so it requested campaigns from Brevo that were already cached by `loadBrevoCampaignsByIds`.
