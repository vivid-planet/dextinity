import { renderMailHtml } from "@dextinity/mail-react/server";
import { EmailCampaignMail } from "@src/brevo/EmailCampaignMail";
import { replaceMailHtmlPlaceholders } from "@src/brevo/util/replaceMailHtmlPlaceholders";
import { getMailConfig } from "@src/mail/util/getMailConfig";
import { loadMessages } from "@src/util/loadMessages";
import { z } from "zod";

const RequestBodyValidationSchema = z.object({
    content: z.object({ blocks: z.array(z.any()) }),
    scope: z.object({ domain: z.string(), language: z.string() }),
});

export async function renderBrevoEmailCampaign(request: Request): Promise<Response> {
    const validationResult = RequestBodyValidationSchema.safeParse(await request.json().catch(() => undefined));
    if (!validationResult.success) {
        return new Response("Sent data not valid", { status: 400 });
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

    return new Response(outputHtml, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
