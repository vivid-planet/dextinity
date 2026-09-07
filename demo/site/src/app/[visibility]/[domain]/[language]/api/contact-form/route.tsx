import { mailerTransport } from "@src/util/mailer";
import { assessRecaptchaToken } from "@src/util/recaptcha/assessRecaptchaToken";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

export async function POST(request: NextRequest, context: RouteContext<"/[visibility]/[domain]/[language]/api/contact-form">) {
    const { domain } = await context.params;
    const body = await request.json();
    const validationResult = queryValidationSchema.safeParse(body);

    if (!validationResult.success) {
        return NextResponse.json(
            {
                cause: validationResult.error,
                message: "Validation failed",
            },
            {
                status: 400,
            },
        );
    }

    const siteConfig = getSiteConfigForDomain(domain);

    const recaptchaTokenValid = await assessRecaptchaToken({
        token: validationResult.data.recaptchaToken,
        action: "form_submit",
        siteKey: siteConfig.recaptchaSiteKey,
    });

    if (!recaptchaTokenValid) {
        return NextResponse.json({
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
        await mailerTransport.sendMail({
            from: process.env.CONTACT_FORM_FROM_EMAIL,
            to: process.env.CONTACT_FORM_TO_EMAIL,
            replyTo: email,
            subject: "Contact form inquiry",
            text: `${details.join("\n")}\n\n${message}`,
        });

        return NextResponse.json(
            { success: true },
            {
                status: 200,
            },
        );
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Something went wrong processing the contact form" }, { status: 500 });
    }
}
