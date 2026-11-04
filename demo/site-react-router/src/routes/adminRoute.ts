import { getHostByHeaders, getSiteConfigForHost } from "@src/util/siteConfig";
import { data, redirect } from "react-router";

import type { Route } from "./+types/adminRoute";

/**
 * Redirects to the admin of the site of the host
 */
export function loader({ request }: Route.LoaderArgs) {
    if (!process.env.ADMIN_URL) {
        throw data(null, { status: 404 });
    }
    const siteConfig = getSiteConfigForHost(getHostByHeaders(request.headers));
    if (siteConfig) {
        const { domain, languages } = siteConfig.scope;
        return redirect(new URL(`/${domain}/${languages[0]}`, process.env.ADMIN_URL).toString(), 307);
    }
    return redirect(process.env.ADMIN_URL, 307);
}
