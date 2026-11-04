import type { Route } from "./+types/brevoEmailCampaignRoute";
import { loadMailsEntry } from "./loadMailsEntry";

export async function action({ request }: Route.ActionArgs) {
    return (await loadMailsEntry()).renderBrevoEmailCampaign(request);
}
