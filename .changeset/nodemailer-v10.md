---
"@dextinity/cms-api": patch
---

Update `nodemailer` to v10

nodemailer now ships its own type definitions, so `@types/nodemailer` is no longer needed. The return type of `MailerService#sendMail` is now the `SentMessageInfo` returned by the transport instead of the (incorrect) `Mail` type.

Since v9, nodemailer validates TLS certificates when fetching remote content (e.g., attachments with an `href`). To fetch from a host with a self-signed certificate, add its certificate or CA to the trusted ones (e.g., via `NODE_EXTRA_CA_CERTS` or the `tls.ca` option of the attachment) instead of disabling certificate verification.
