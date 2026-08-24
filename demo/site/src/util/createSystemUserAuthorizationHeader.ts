import dextinityConfig from "@src/dextinity-config.json" with { type: "json" };

/**
 * Builds the Basic auth header the site uses to authenticate against the API as the system user.
 *
 * The user name is shared with the API through dextinity-config.json to keep both sides in sync.
 */
export function createSystemUserAuthorizationHeader(): string {
    if (!process.env.API_BASIC_AUTH_SYSTEM_USER_PASSWORD) {
        throw new Error("API_BASIC_AUTH_SYSTEM_USER_PASSWORD is not set");
    }

    return `Basic ${Buffer.from(`${dextinityConfig.auth.systemUserName}:${process.env.API_BASIC_AUTH_SYSTEM_USER_PASSWORD}`).toString("base64")}`;
}
