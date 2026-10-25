import type { WelcomeEmailContentBlockData } from "@src/blocks.generated";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import type { Context } from "hono";
import { z } from "zod";

import { loadMailsEntry } from "../loadMailsEntry";

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
export async function welcomeEmailRoute(c: Context) {
    const validationResult = QueryValidationSchema.safeParse(c.req.query());
    if (!validationResult.success) {
        return c.text("Invalid scope", 400);
    }
    const scope = validationResult.data;

    const graphQLFetch = createGraphQLFetch();
    const { welcomeEmail } = await graphQLFetch<{ welcomeEmail: { content: WelcomeEmailContentBlockData } | null }, { scope: typeof scope }>(
        welcomeEmailQuery,
        { scope },
    );

    if (!welcomeEmail) {
        return c.text("No welcome email found for the given scope", 404);
    }

    const content = await recursivelyLoadBlockData({
        blockType: "WelcomeEmailContent",
        blockData: welcomeEmail.content,
        graphQLFetch,
        fetch,
        scope,
    });

    const html = await (await loadMailsEntry()).renderWelcomeEmail({ content, scope });

    return c.body(html, 200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
}
