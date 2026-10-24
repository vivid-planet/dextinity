import { renderMailHtml } from "@dextinity/mail-react/server";
import type { WelcomeEmailContentBlockData } from "@src/blocks.generated";
import { getMailConfig } from "@src/mail/util/getMailConfig";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { loadMessages } from "@src/util/loadMessages";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { WelcomeEmailMail } from "@src/welcomeEmail/WelcomeEmailMail";
import { z } from "zod";

const QueryValidationSchema = z.object({
    domain: z.string(),
    language: z.string(),
});

const welcomeEmailQuery = `
    query WelcomeEmailForRender($scope: WelcomeEmailScopeInput!) {
        welcomeEmail(scope: $scope) {
            content
        }
    }
`;

/**
 * Renders the welcome email as HTML.
 *
 * Left open without authentication on purpose: opening the mail in a browser must stay a single click
 * in the demo.
 */
export async function renderWelcomeEmail(request: Request): Promise<Response> {
    const validationResult = QueryValidationSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
    if (!validationResult.success) {
        return new Response("Invalid scope", { status: 400 });
    }
    const scope = validationResult.data;

    const graphQLFetch = createGraphQLFetch();
    const { welcomeEmail } = await graphQLFetch<{ welcomeEmail: { content: WelcomeEmailContentBlockData } | null }, { scope: typeof scope }>(
        welcomeEmailQuery,
        { scope },
    );

    if (!welcomeEmail) {
        return new Response("No welcome email found for the given scope", { status: 404 });
    }

    const content = await recursivelyLoadBlockData({
        blockType: "WelcomeEmailContent",
        blockData: welcomeEmail.content,
        graphQLFetch,
        fetch,
        scope,
    });

    const messages = await loadMessages(scope.language);
    const { html, mjmlWarnings } = renderMailHtml(
        <WelcomeEmailMail content={content} config={getMailConfig(scope)} locale={scope.language} messages={messages} />,
    );

    if (process.env.NODE_ENV === "development" && mjmlWarnings.length) {
        console.warn(`${mjmlWarnings.length} MJML warnings`, mjmlWarnings);
    }

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
