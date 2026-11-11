---
"@dextinity/brevo-api": patch
---

Cache Brevo campaigns by scope and Brevo ID

`loadBrevoCampaignById` cached the campaign under the email campaign's ID instead of its Brevo ID, so it requested campaigns from Brevo that were already cached by `loadBrevoCampaignsByIds`.
Both now include the scope in the cache key, since scopes can use different Brevo accounts whose campaign IDs overlap. Before, `loadBrevoCampaignsByIds` could return a campaign cached for another scope.
