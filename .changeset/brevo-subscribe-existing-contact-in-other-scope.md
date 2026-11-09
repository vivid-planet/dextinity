---
"@dextinity/brevo-api": patch
---

Allow contacts that already exist in Brevo to subscribe in another scope

Previously, subscribing failed with `ERROR_CONTACT_ALREADY_EXISTS` as soon as the email address existed in Brevo, for example because the contact had subscribed in another scope.
Now, `ERROR_CONTACT_ALREADY_EXISTS` is only returned when the contact is already in the scope's main list.
With double opt-in, the confirmation mail is sent again and the contact is added to the scope's lists after confirmation.
Without double opt-in (admin contact creation), the existing contact is added to the scope's lists and its attributes are updated.
Because the attributes are shared by all scopes, the contact's target groups in the other scopes it subscribed to are updated to the new attributes as well.
Contacts that unsubscribed from the scope's main list or are blacklisted in Brevo are rejected with `ERROR_CONTACT_IS_BLACKLISTED`.

`BrevoContactsService.subscribeBrevoContact` now returns the `SubscribeResponse` from `createContact` instead of `SUCCESSFUL` for every non-empty response.
An already subscribed contact is still reported as `SUCCESSFUL`, so the public subscribe endpoint does not reveal which email addresses are subscribed.
