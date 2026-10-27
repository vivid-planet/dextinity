import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import { exportJWK, generateKeyPair, type JWK, jwtVerify, SignJWT } from "jose";

import { devAccessAudience } from "../dev-server-paths.js";
import { readBody } from "./read-body.js";

export interface DevAccessUser {
    id: string;
    name: string;
    email: string;
    groups: string[];
}

export interface AccessEmulatorOptions {
    users: DevAccessUser[];
    /** Paths that are reachable without login, like paths with a bypass policy in Access (e.g. public file URLs) */
    isPublicPath?: (path: string) => boolean;
}

const cookieName = "CF_Authorization";

/**
 * Emulates Cloudflare Access in front of the Worker: a login page with a user picker, the `Cf-Access-Jwt-Assertion` header on
 * authenticated requests, the certificates and the identity endpoint. The Worker verifies the JWTs with its production code.
 */
export async function createAccessEmulator({ users, isPublicPath = () => false }: AccessEmulatorOptions) {
    const keyId = randomUUID();
    const { publicKey, privateKey } = await generateKeyPair("RS256", { extractable: true });
    const publicJwk: JWK = { ...(await exportJWK(publicKey)), kid: keyId, alg: "RS256", use: "sig" };

    const origin = (request: IncomingMessage) => `http://${request.headers.host}`;

    async function verifiedUser(request: IncomingMessage): Promise<{ user: DevAccessUser; token: string } | undefined> {
        const token = parseCookies(request.headers.cookie)[cookieName];
        if (!token) {
            return undefined;
        }
        try {
            const { payload } = await jwtVerify(token, publicKey, { issuer: origin(request), audience: devAccessAudience });
            const user = users.find(({ id }) => id === payload.sub);
            return user && { user, token };
        } catch {
            return undefined;
        }
    }

    function redirect(response: ServerResponse, location: string, headers: Record<string, string> = {}) {
        response.writeHead(302, { location, ...headers }).end();
    }

    return async function handle(request: IncomingMessage, response: ServerResponse): Promise<boolean> {
        const url = new URL(request.url ?? "/", origin(request));

        if (url.pathname === "/cdn-cgi/access/certs") {
            response.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ keys: [publicJwk] }));
            return true;
        }

        if (url.pathname === "/cdn-cgi/access/login" && request.method === "POST") {
            const form = new URLSearchParams((await readBody(request)).toString());
            const user = users.find(({ id }) => id === form.get("user"));
            if (!user) {
                response.writeHead(400).end("Unknown user");
                return true;
            }
            const token = await new SignJWT({ email: user.email, type: "app" })
                .setProtectedHeader({ alg: "RS256", kid: keyId })
                .setSubject(user.id)
                .setIssuer(origin(request))
                .setAudience(devAccessAudience)
                .setIssuedAt()
                .setExpirationTime("24h")
                .sign(privateKey);
            const redirectUrl = form.get("redirect_url") ?? "/";
            redirect(response, redirectUrl.startsWith("/") && !redirectUrl.startsWith("//") ? redirectUrl : "/", {
                "set-cookie": `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax`,
            });
            return true;
        }

        if (url.pathname === "/cdn-cgi/access/login") {
            response
                .writeHead(200, { "content-type": "text/html" })
                .end(loginPage({ users, redirectUrl: url.searchParams.get("redirect_url") ?? "/" }));
            return true;
        }

        if (url.pathname === "/cdn-cgi/access/logout") {
            redirect(response, "/cdn-cgi/access/login", { "set-cookie": `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` });
            return true;
        }

        const authenticated = await verifiedUser(request);

        if (url.pathname === "/cdn-cgi/access/get-identity") {
            if (!authenticated) {
                response.writeHead(401).end();
                return true;
            }
            const { user } = authenticated;
            const identity = { id: user.id, name: user.name, email: user.email, groups: user.groups.map((group) => ({ id: group, name: group })) };
            response.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(identity));
            return true;
        }

        // Access never forwards the header from the client
        delete request.headers["cf-access-jwt-assertion"];
        if (authenticated) {
            request.headers["cf-access-jwt-assertion"] = authenticated.token;
        } else if (request.method === "GET" && request.headers["sec-fetch-mode"] === "navigate" && !isPublicPath(url.pathname)) {
            redirect(response, `/cdn-cgi/access/login?redirect_url=${encodeURIComponent(url.pathname + url.search)}`);
            return true;
        }
        return false;
    };
}

function parseCookies(header = ""): Record<string, string> {
    return Object.fromEntries(
        header
            .split(";")
            .map((cookie) => cookie.trim().split("="))
            .filter(([name, value]) => name && value)
            .map(([name, ...value]) => [name, value.join("=")]),
    );
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
}

function loginPage({ users, redirectUrl }: { users: DevAccessUser[]; redirectUrl: string }): string {
    const buttons = users
        .map(
            (user) =>
                `<button name="user" value="${escapeHtml(user.id)}"><strong>${escapeHtml(user.name)}</strong><span>${escapeHtml(user.email)}</span><span>Groups: ${escapeHtml(user.groups.join(", ") || "none")}</span></button>`,
        )
        .join("");
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Sign in (Cloudflare Access emulator)</title>
<style>
body { font-family: system-ui, sans-serif; background: #f2f2f2; display: grid; place-items: center; min-height: 100vh; margin: 0; }
main { background: #fff; padding: 32px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,.1); width: 360px; }
h1 { font-size: 20px; margin: 0 0 4px; } p { color: #666; margin: 0 0 24px; font-size: 14px; }
button { display: grid; gap: 2px; width: 100%; text-align: left; padding: 12px 16px; margin-bottom: 8px; border: 1px solid #d9d9d9; border-radius: 4px; background: #fff; cursor: pointer; font: inherit; }
button:hover { border-color: #29b6f6; background: #f5fbfe; } span { color: #666; font-size: 13px; }
</style>
</head>
<body>
<main>
<h1>Sign in</h1>
<p>Cloudflare Access emulator for local development</p>
<form method="post" action="/cdn-cgi/access/login">
<input type="hidden" name="redirect_url" value="${escapeHtml(redirectUrl)}" />
${buttons}
</form>
</main>
</body>
</html>`;
}
