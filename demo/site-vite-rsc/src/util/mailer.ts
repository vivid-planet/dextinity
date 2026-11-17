import { createTransport } from "nodemailer";

if (!process.env.MAILER_HOST) {
    throw new Error("Missing MAILER_HOST environment variable");
}

const port = process.env.MAILER_PORT ? parseInt(process.env.MAILER_PORT, 10) : 587;
const user = process.env.MAILER_USER;

export const mailerTransport = createTransport({
    host: process.env.MAILER_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465 && Boolean(user),
    auth: user ? { user, pass: process.env.MAILER_PASSWORD } : undefined,
});
