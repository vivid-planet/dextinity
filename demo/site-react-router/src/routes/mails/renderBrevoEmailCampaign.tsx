import { renderMailHtml } from "@dextinity/mail-react/server";
import type { EmailCampaignContentBlockData } from "@src/blocks.generated";
import { EmailCampaignMail } from "@src/brevo/EmailCampaignMail";
import { replaceMailHtmlPlaceholders } from "@src/brevo/util/replaceMailHtmlPlaceholders";
import { getMailConfig } from "@src/mail/util/getMailConfig";
import type { ContentScope } from "@src/site-configs";
import { loadMessages } from "@src/util/loadMessages";

export async function renderBrevoEmailCampaign({ content, scope }: { content: EmailCampaignContentBlockData; scope: ContentScope }): Promise<string> {
    const messages = await loadMessages(scope.language);

    const { html, mjmlWarnings } = renderMailHtml(
        <EmailCampaignMail content={content} config={getMailConfig(scope)} locale={scope.language} messages={messages} />,
    );

    if (process.env.NODE_ENV === "development" && mjmlWarnings.length) {
        console.warn(`${mjmlWarnings.length} MJML warnings`, mjmlWarnings);
    }

    return replaceMailHtmlPlaceholders(html, "mail");
}
