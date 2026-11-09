---
"@dextinity/brevo-api": minor
"@dextinity/brevo-admin": minor
---

Send Brevo email campaigns in the background and add a `FAILED` sending state

Sending a large campaign with `sendBrevoEmailCampaignNow` could exceed the gateway timeout. The mutation now returns right after setting the campaign to `SCHEDULED`, and the campaign is sent in the background. If sending fails, or the campaign has no target group to send to, the campaign is set to `FAILED`.

The admin shows failed campaigns with a red indicator, and they can be edited and sent again.
