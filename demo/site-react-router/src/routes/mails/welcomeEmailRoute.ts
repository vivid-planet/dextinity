import type { WelcomeEmailContentBlockData } from "@src/blocks.generated";
import { getGraphQLFetch } from "@src/util/graphQLClient";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { z } from "zod";

import type { Route } from "./+types/welcomeEmailRoute";
import { loadMailsEntry } from "./loadMailsEntry";

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
export async function loader({ url, context }: Route.LoaderArgs) {
    const validationResult = QueryValidationSchema.safeParse(Object.fromEntries(url.searchParams));
    if (!validationResult.success) {
        return new Response("Invalid scope", { status: 400 });
    }
    const scope = validationResult.data;
    const graphQLFetch = getGraphQLFetch(context);

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

    const html = await (await loadMailsEntry()).renderWelcomeEmail({ content, scope });

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
