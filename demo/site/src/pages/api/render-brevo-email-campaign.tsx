import { renderMailHtml } from "@dextinity/mail-react/server";
import { EmailCampaignMail } from "@src/brevo/EmailCampaignMail";
import { replaceMailHtmlPlaceholders } from "@src/brevo/util/replaceMailHtmlPlaceholders";
import { getMailConfig } from "@src/mail/util/getMailConfig";
import { loadMessages } from "@src/util/loadMessages";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const RequestBodyValidationSchema = z.object({
    content: z.object({ blocks: z.array(z.any()) }),
    scope: z.object({ domain: z.string(), language: z.string() }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end();
        return;
    }

    const validationResult = RequestBodyValidationSchema.safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).send("Sent data not valid");
        return;
    }

    const { content, scope } = validationResult.data;
    const messages = await loadMessages(scope.language);

    const { html, mjmlWarnings } = renderMailHtml(
        <EmailCampaignMail content={content} config={getMailConfig(scope)} locale={scope.language} messages={messages} />,
    );

    if (process.env.NODE_ENV === "development" && mjmlWarnings.length) {
        console.warn(`${mjmlWarnings.length} MJML warnings`, mjmlWarnings);
    }

    const outputHtml = replaceMailHtmlPlaceholders(html, "mail");

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(outputHtml);
}
