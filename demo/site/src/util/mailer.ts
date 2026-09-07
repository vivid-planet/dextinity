import { createTransport } from "nodemailer";

if (!process.env.MAILER_HOST) {
    throw new Error("Missing MAILER_HOST environment variable");
}

export const mailerTransport = createTransport({
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT ? parseInt(process.env.MAILER_PORT, 10) : 587,
});
