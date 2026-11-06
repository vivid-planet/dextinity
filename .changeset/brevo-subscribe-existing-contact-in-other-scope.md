---
"@dextinity/brevo-api": patch
---

Allow contacts that already exist in Brevo to subscribe in another scope

Previously, subscribing failed with `ERROR_CONTACT_ALREADY_EXISTS` as soon as the email address existed in Brevo, for example because the contact had subscribed in another scope.
Now, the double opt-in mail is sent again and the contact is added to the scope's lists after confirmation.
`ERROR_CONTACT_ALREADY_EXISTS` is only returned when the contact is already in the scope's main list.
