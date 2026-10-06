---
"@dextinity/cms-api": patch
---

Update `nodemailer` to v10

nodemailer now ships its own type definitions, so `@types/nodemailer` is no longer needed. The return type of `MailerService#sendMail` is now the `SentMessageInfo` returned by the transport instead of the (incorrect) `Mail` type.

Since v9, nodemailer validates TLS certificates when fetching remote content (e.g., attachments with an `href`). Pass `tls: { rejectUnauthorized: false }` to the attachment or transport if you need to fetch from hosts with self-signed certificates.
