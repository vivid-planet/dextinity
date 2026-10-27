import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { createRemoteJWKSet, type JWTPayload, jwtVerify } from "jose";

import { devAccessAudience } from "../../dev-server-paths.js";

export interface AccessIdentity {
    id: string;
    email: string | null;
    name: string;
    groups: string[];
    /** Machine-to-machine requests authenticated with an Access service token */
    isServiceToken: boolean;
}

export interface AccessVariables {
    /** `null` for requests without a valid Access JWT, e.g. to paths with a bypass policy like the public DAM URLs */
    identity: AccessIdentity | null;
}

export interface CloudflareAccessConfig {
    /** e.g. `https://<team-name>.cloudflareaccess.com` */
    teamDomain: string;
    /** The audience (AUD) tag of the Access application */
    audience: string;
}

interface AccessJwtPayload extends JWTPayload {
    email?: string;
    common_name?: string;
}

interface AccessIdentityResponse {
    name?: string;
    email?: string;
    groups?: Array<{ name: string } | string>;
}

const teamDomainPattern = /^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/;
const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
const identities = new Map<string, Omit<AccessIdentity, "id" | "isServiceToken">>();
const maxCachedIdentities = 1000;

/**
 * Configures `cloudflareAccess()` for the Access emulator of the Vite dev server (`dextinityDevServer()` of `@dextinity/serverless/vite`),
 * which signs the JWTs with a local key. Only use it behind `import.meta.env.DEV`, so Vite removes it from the production build.
 */
export function devAccessConfig(c: Context): CloudflareAccessConfig & { isDevEmulator: true } {
    return { teamDomain: new URL(c.req.url).origin, audience: devAccessAudience, isDevEmulator: true };
}

/**
 * Verifies the JWT Cloudflare Access adds to requests and provides the identity as `c.var.identity`. The groups come from Access's
 * identity endpoint, cached per isolate. Requests without a valid JWT get `null`: whether they may continue is up to the routes.
 */
export function cloudflareAccess(getConfig: (c: Context) => CloudflareAccessConfig & { isDevEmulator?: boolean }) {
    return createMiddleware<{ Variables: AccessVariables }>(async (c, next) => {
        const { teamDomain, audience, isDevEmulator = false } = getConfig(c);
        if (!isDevEmulator && !teamDomainPattern.test(teamDomain)) {
            throw new Error(`Invalid Access team domain "${teamDomain}", expected https://<team-name>.cloudflareaccess.com`);
        }

        const token = c.req.header("cf-access-jwt-assertion") ?? getCookie(c, "CF_Authorization");
        c.set("identity", token ? await verify({ token, teamDomain, audience }) : null);
        await next();
    });
}

async function verify({ token, teamDomain, audience }: { token: string } & CloudflareAccessConfig): Promise<AccessIdentity | null> {
    let keySet = keySets.get(teamDomain);
    if (!keySet) {
        keySet = createRemoteJWKSet(new URL(`${teamDomain}/cdn-cgi/access/certs`));
        keySets.set(teamDomain, keySet);
    }

    let payload: AccessJwtPayload;
    try {
        ({ payload } = await jwtVerify<AccessJwtPayload>(token, keySet, { issuer: teamDomain, audience }));
    } catch {
        return null;
    }

    if (payload.common_name && !payload.email) {
        return { id: payload.common_name, email: null, name: payload.common_name, groups: [], isServiceToken: true };
    }
    if (!payload.sub) {
        return null;
    }
    return { id: payload.sub, ...(await fetchIdentity({ token, teamDomain, payload })), isServiceToken: false };
}

async function fetchIdentity({ token, teamDomain, payload }: { token: string; teamDomain: string; payload: AccessJwtPayload }) {
    const cached = identities.get(token);
    if (cached) {
        return cached;
    }

    const response = await fetch(`${teamDomain}/cdn-cgi/access/get-identity`, { headers: { cookie: `CF_Authorization=${token}` } });
    const identityResponse: AccessIdentityResponse = response.ok ? await response.json() : {};
    const identity = {
        email: identityResponse.email ?? payload.email ?? null,
        name: identityResponse.name ?? identityResponse.email ?? payload.email ?? "Unknown",
        groups: (identityResponse.groups ?? []).map((group) => (typeof group === "string" ? group : group.name)),
    };

    if (response.ok) {
        if (identities.size >= maxCachedIdentities) {
            identities.clear();
        }
        identities.set(token, identity);
    }
    return identity;
}
