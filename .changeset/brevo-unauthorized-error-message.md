---
"@dextinity/brevo-api": patch
"@dextinity/brevo-admin": patch
---

Show a descriptive error in the admin when Brevo rejects the API key

Previously, an invalid Brevo API key or an unauthorized IP address resulted in an error dialog saying only "Internal Server Error", because the `ExceptionFilter` hides the message of unhandled errors in production.
Now the Brevo admin queries explain that the API key and the authorized IP addresses in Brevo need to be checked, and the config page shows this message inline instead of the error dialog.
Public endpoints, such as the newsletter subscription, still return a generic error, and the API logs Brevo's original message.
