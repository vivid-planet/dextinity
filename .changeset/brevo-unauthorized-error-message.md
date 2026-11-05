---
"@dextinity/brevo-admin": patch
---

Show an alert on the Brevo config page when the data from Brevo can't be loaded

Previously, the config page opened an error dialog saying only "Internal Server Error" when the senders or double opt-in templates couldn't be loaded from Brevo, for instance because the API key is invalid.
Now the page shows an alert that points to the API key and the authorized IP addresses in Brevo instead.
