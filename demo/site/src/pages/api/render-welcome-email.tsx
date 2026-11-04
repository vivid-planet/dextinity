import { renderMailHtml } from "@dextinity/mail-react/server";
import type { WelcomeEmailContentBlockData } from "@src/blocks.generated";
import { getMailConfig } from "@src/mail/util/getMailConfig";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { loadMessages } from "@src/util/loadMessages";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { WelcomeEmailMail } from "@src/welcomeEmail/WelcomeEmailMail";
import type { NextApiRequest, NextApiResponse } from "next";
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
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        res.status(405).end();
        return;
    }

    const validationResult = QueryValidationSchema.safeParse(req.query);
    if (!validationResult.success) {
        res.status(400).send("Invalid scope");
        return;
    }
    const scope = validationResult.data;

    const graphQLFetch = createGraphQLFetch();
    const { welcomeEmail } = await graphQLFetch<{ welcomeEmail: { content: WelcomeEmailContentBlockData } | null }, { scope: typeof scope }>(
        welcomeEmailQuery,
        { scope },
    );

    if (!welcomeEmail) {
        res.status(404).send("No welcome email found for the given scope");
        return;
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

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(html);
}
