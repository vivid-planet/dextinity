import { getSiteContext } from "@src/framework/requestContext";
import { mailerTransport } from "@src/util/mailer";
import { assessRecaptchaToken } from "@src/util/recaptcha/assessRecaptchaToken";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import type { Context } from "hono";
import { z } from "zod";

const fromEmail = process.env.CONTACT_FORM_FROM_EMAIL;
const toEmail = process.env.CONTACT_FORM_TO_EMAIL;

if (!fromEmail) {
    throw new Error("Missing CONTACT_FORM_FROM_EMAIL environment variable");
}

if (!toEmail) {
    throw new Error("Missing CONTACT_FORM_TO_EMAIL environment variable");
}

const queryValidationSchema = z.object({
    name: z.string(),
    company: z.string().optional(),
    email: z.string().email(),
    phoneNumber: z.string().optional(),
    subject: z.string(),
    message: z.string(),
    privacyConsent: z.literal(true),
    recaptchaToken: z.string(),
    attachments: z.array(z.uuid()).default([]),
});

export async function contactFormRoute(c: Context) {
    const { domain } = getSiteContext();
    const body = await c.req.json();
    const validationResult = queryValidationSchema.safeParse(body);

    if (!validationResult.success) {
        return c.json(
            {
                cause: validationResult.error,
                message: "Validation failed",
            },
            400,
        );
    }

    const siteConfig = getSiteConfigForDomain(domain);

    const recaptchaTokenValid = await assessRecaptchaToken({
        token: validationResult.data.recaptchaToken,
        action: "form_submit",
        siteKey: siteConfig.recaptchaSiteKey,
    });

    if (!recaptchaTokenValid) {
        return c.json({
            success: false,
            error: "ReCAPTCHA assessment failed",
        });
    }

    const { name, company, email, phoneNumber, subject, message, attachments } = validationResult.data;

    const details = [
        `Name: ${name}`,
        company && `Company: ${company}`,
        `Email: ${email}`,
        phoneNumber && `Phone number: ${phoneNumber}`,
        `Subject: ${subject}`,
        attachments.length > 0 && `Attachments: ${attachments.join(", ")}`,
    ].filter(Boolean);

    try {
        const { rejected } = await mailerTransport.sendMail({
            from: fromEmail,
            to: process.env.MAILER_SEND_ALL_MAILS_TO || toEmail,
            replyTo: email,
            subject: "Contact form inquiry",
            text: `${details.join("\n")}\n\n${message}`,
        });

        if (rejected.length > 0) {
            console.error("The mail server rejected the contact form inquiry for", rejected);
            return c.json({ error: "Something went wrong processing the contact form" }, 500);
        }

        return c.json({ success: true }, 200);
    } catch (e) {
        console.error(e);
        return c.json({ error: "Something went wrong processing the contact form" }, 500);
    }
}
