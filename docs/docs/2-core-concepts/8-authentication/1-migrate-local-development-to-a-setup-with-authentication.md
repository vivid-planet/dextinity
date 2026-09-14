---
title: Migrate local development to a setup with authentication
---

This guide helps to add local authentication in a project, like the [current implementation the Dextinity Starter](https://github.com/vivid-planet/dextinity-starter/pull/1201) uses.
That brings the development setup closer to the production setup as it requires real authentication, thus reducing the risk of environment-specific bugs.

## Add Auth-Server

1. Install package

```bash
npm i dev-oidc-provider
```

2. Add configuration variables to `.env`

```env
# idp
IDP_PORT=8080
IDP_CLIENT_ID=dev-oidc-client
IDP_CLIENT_SECRET=dev-oidc-secret
IDP_SSO_URL=http://${DEV_DOMAIN:-localhost}:${IDP_PORT}
IDP_JWKS_URI=http://${DEV_DOMAIN:-localhost}:${IDP_PORT}/jwks
IDP_END_SESSION_ENDPOINT=http://${DEV_DOMAIN:-localhost}:${IDP_PORT}/session/end
```

3. Create configuration file `dev-oidc-provider.config.mts`

It might be possible that you have to alter the implementation of the `userProvider`-callback according to your `staticUsers`.

```ts
import { defineConfig } from "dev-oidc-provider";
import { staticUsers } from "./api/src/auth/static-users";

export default defineConfig({
    userProvider: () => Object.values(staticUsers),
    client: {
        client_id: process.env.IDP_CLIENT_ID,
        client_secret: process.env.IDP_CLIENT_SECRET,
        redirect_uris: [`${process.env.AUTHPROXY_URL}/oauth2/callback`],
        post_logout_redirect_uris: [process.env.POST_LOGOUT_REDIRECT_URI],
    },
});
```

4. Add command to start

```diff title="package.json"
// ...
        "dev": "npm run create-site-configs-env && dev-pm start",
+       "dev:auth-provider": "dotenv -- dev-oidc-provider",
);
```

5. Add process to dev-process-manager

```diff dev-pm.config.ts
        },
+       {
+           name: "auth-provider",
+           script: "npm run dev:auth-provider",
+           group: "login",
+       },
    ],
});
```

## Add Auth-Proxy

1. Add command to install OAuth2-Proxy (we will set $OAUTH2_PROXY_VERSION in the next step)

```diff package.json
       "setup:ci": "npm run setup-project-files",
+      "setup:download-oauth2-proxy": "dotenv -- sh -c 'npx @dextinity/cli download-oauth2-proxy -v $OAUTH2_PROXY_VERSION'"
```

```diff install.sh
mkdir -p ./api/uploads

+npm run setup:download-oauth2-proxy
```

2. Add configuration variables to `.env` (we will set the missing variables in a later step)

```env
# oauth2-proxy
OAUTH2_PROXY_VERSION="v7.13.0"
OAUTH2_PROXY_OIDC_ISSUER_URL=$IDP_SSO_URL
OAUTH2_PROXY_CLIENT_ID=$IDP_CLIENT_ID
OAUTH2_PROXY_CLIENT_SECRET=$IDP_CLIENT_SECRET
OAUTH2_PROXY_UPSTREAMS=${ADMIN_URL_INTERNAL},${API_URL_INTERNAL}/
OAUTH2_PROXY_REDIRECT_URL=${ADMIN_URL}/oauth2/callback
OAUTH2_PROXY_HTTP_ADDRESS=${SERVER_HOST}:${AUTHPROXY_PORT}
OAUTH2_PROXY_PROVIDER=oidc
OAUTH2_PROXY_SKIP_PROVIDER_BUTTON=true
OAUTH2_PROXY_EMAIL_DOMAINS="*"
OAUTH2_PROXY_SCOPE=openid offline_access email profile
OAUTH2_PROXY_PASS_AUTHORIZATION_HEADER=true
OAUTH2_PROXY_COOKIE_REFRESH=55m
OAUTH2_PROXY_SHOW_DEBUG_ON_ERROR=true
OAUTH2_PROXY_API_ROUTES=/api
OAUTH2_PROXY_SKIP_AUTH_PREFLIGHT=true
```

3. Add command to start

```diff title="package.json"
// ...
        "dev": "npm run create-site-configs-env && dev-pm start",
+       "dev:auth-proxy": "dotenv -- ./node_modules/.bin/oauth2-proxy --cookie-secret=$(head -c 16 /dev/random | base64)",
);
```

4. Add process to dev-process-manager

```diff dev-pm.config.ts
        },
+       {
+           name: "auth-proxy",
+           script: "npm run dev:auth-proxy",
+           group: "login",
+           waitOn: ["tcp:$IDP_PORT", "tcp:$ADMIN_PORT"],
+       },
    ],
});
```

## Make Admin port using Auth-Proxy

```diff .env
-USE_AUTHPROXY=false

+# authproxy
+AUTHPROXY_PORT=8000
+AUTHPROXY_URL=http://${DEV_DOMAIN:-localhost}:${AUTHPROXY_PORT}

#api
-BASIC_AUTH_SYSTEM_USER_PASSWORD=secret
+BASIC_AUTH_SYSTEM_USER_PASSWORD=aPasswordWith16Characters

+POST_LOGOUT_REDIRECT_URI=${AUTHPROXY_URL}/oauth2/sign_out?rd=%2F

#admin
-ADMIN_PORT=8000
+ADMIN_PORT=8001
-ADMIN_URL=http://${DEV_DOMAIN:-localhost}:${ADMIN_PORT}
+ADMIN_URL=$AUTHPROXY_URL
+ADMIN_URL_INTERNAL=http://localhost:$ADMIN_PORT
```

## Remove `useAuthProxy` from API

Remove all instances of `USE_AUTHPROXY`/`useAuthProxy` so that local dev and deployed instances just work the same.

The only exception is the `UserService`:

```diff app/src/app.module.ts
-   userService: config.auth.useAuthProxy ? myUserService : staticUsersUserService,
+   userService: process.env.NODE_ENV !== "development" ? myUserService : staticUsersUserService,
```
