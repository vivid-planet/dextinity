import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { getSiteContext } from "@src/util/siteContext";
import { data, redirect } from "react-router";

import type { Route } from "./+types/adminRoute";

/**
 * Redirects to the admin of the site, if the admin URL is configured
 */
export function loader({ context }: Route.LoaderArgs) {
    if (!process.env.ADMIN_URL) {
        throw data(null, { status: 404 });
    }
    const { domain } = getSiteContext(context);
    const language = getSiteConfigForDomain(domain).scope.languages[0];
    throw redirect(new URL(`/${domain}/${language}`, process.env.ADMIN_URL).toString(), 307);
}
