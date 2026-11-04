import { z } from "zod";

import type { Route } from "./+types/brevoEmailCampaignRoute";
import { loadMailsEntry } from "./loadMailsEntry";

const RequestBodyValidationSchema = z.object({
    content: z.object({ blocks: z.array(z.any()) }),
    scope: z.object({ domain: z.string(), language: z.string() }),
});

export function loader() {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
}

export async function action({ request }: Route.ActionArgs) {
    if (request.method !== "POST") {
        return new Response(null, { status: 405, headers: { Allow: "POST" } });
    }

    const validationResult = RequestBodyValidationSchema.safeParse(await request.json().catch(() => undefined));
    if (!validationResult.success) {
        return new Response("Sent data not valid", { status: 400 });
    }

    const { content, scope } = validationResult.data;
    const html = await (await loadMailsEntry()).renderBrevoEmailCampaign({ content, scope });

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
