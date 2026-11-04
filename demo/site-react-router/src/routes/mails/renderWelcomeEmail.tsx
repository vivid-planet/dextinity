import { renderMailHtml } from "@dextinity/mail-react/server";
import type { WelcomeEmailContentBlockData } from "@src/blocks.generated";
import { getMailConfig } from "@src/mail/util/getMailConfig";
import type { ContentScope } from "@src/site-configs";
import { loadMessages } from "@src/util/loadMessages";
import { WelcomeEmailMail } from "@src/welcomeEmail/WelcomeEmailMail";

/**
 * The content is loaded by the route in the RSC environment, see `welcomeEmailRoute`
 */
export async function renderWelcomeEmail({ content, scope }: { content: WelcomeEmailContentBlockData; scope: ContentScope }): Promise<string> {
    const messages = await loadMessages(scope.language);
    const { html, mjmlWarnings } = renderMailHtml(
        <WelcomeEmailMail content={content} config={getMailConfig(scope)} locale={scope.language} messages={messages} />,
    );

    if (process.env.NODE_ENV === "development" && mjmlWarnings.length) {
        console.warn(`${mjmlWarnings.length} MJML warnings`, mjmlWarnings);
    }

    return html;
}
