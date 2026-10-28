---
"@dextinity/brevo-api": major
"@dextinity/brevo-admin": patch
---

Make the fields of `BrevoApiCampaignStatistics` nullable

Version 6 of the Brevo SDK (`@getbrevo/brevo`) reports every campaign statistic as `number | null`.
The `brevoEmailCampaignStatistics` query now returns `null` for a statistic that Brevo doesn't report, instead of failing with a non-nullable field error.
The email campaign statistics page in the admin shows "–" for such a value.

If your project queries `brevoEmailCampaignStatistics` itself, handle `null` for each statistic:

```ts
// Before
const failedDeliveries = statistics.sent - statistics.delivered;

// After
const failedDeliveries = statistics.sent !== null && statistics.delivered !== null ? statistics.sent - statistics.delivered : null;
```
