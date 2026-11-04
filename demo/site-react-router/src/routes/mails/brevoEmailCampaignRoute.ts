import type { Route } from "./+types/brevoEmailCampaignRoute";

export async function action({ request }: Route.ActionArgs) {
    // Loaded on use, so that the mail renderer isn't loaded for the pages
    const { renderBrevoEmailCampaign } = await import("./renderBrevoEmailCampaign.server");
    return renderBrevoEmailCampaign(request);
}
