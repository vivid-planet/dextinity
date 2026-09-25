---
"@dextinity/brevo-api": patch
---

Allow a Brevo contact to be subscribed in multiple scopes that share the same Brevo account

Previously, creating or subscribing a contact failed with `ERROR_CONTACT_ALREADY_EXISTS` if the email address already existed in the Brevo account, even when it was only subscribed to another scope.
Now, the error is only returned if the contact is already in the main list of the current scope. Otherwise, the existing contact is added to the main list and matching target groups of the current scope. With double opt-in, the confirmation email is sent and the lists are added after confirmation.

Deleting a contact that is also subscribed to another scope now only removes it from the lists of the current scope instead of deleting the Brevo contact.
Updating a contact now only (un)assigns target groups of the scopes the contact is subscribed to and no longer unlinks lists of other scopes.
