---
"@dextinity/brevo-api": patch
---

Show a descriptive error when Brevo rejects the API key

Previously, an invalid or missing Brevo API key surfaced as a generic "Internal Server Error" in the admin, because the `ExceptionFilter` hides the message of unhandled errors in production.
Now the error states that Brevo rejected the API key and that the API key and the authorized IP addresses in Brevo should be checked.
