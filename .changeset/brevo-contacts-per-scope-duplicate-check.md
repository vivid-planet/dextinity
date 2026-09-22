---
"@dextinity/brevo-api": patch
---

Allow creating a contact with the same email address in multiple scopes

Contacts are global in a Brevo account, scopes are separated by their main list.
Creating a contact was rejected with `ERROR_CONTACT_ALREADY_EXISTS` as soon as the email existed anywhere in the account, so a contact could never be added to a second scope.
The contact is now only rejected when it is already in the main list of the scope it is created in, and contacts blacklisted in one scope no longer block creation in other scopes.
