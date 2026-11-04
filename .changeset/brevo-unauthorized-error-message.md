---
"@dextinity/brevo-api": patch
"@dextinity/brevo-admin": patch
---

Show a descriptive error on the Brevo config page when Brevo rejects the API key

Previously, an invalid or missing Brevo API key resulted in an error dialog saying only "Internal Server Error", because the `ExceptionFilter` hides the message of unhandled errors in production.
Now the API explains that the API key and the authorized IP addresses in Brevo need to be checked, and the config page shows this message inline instead of the error dialog.
