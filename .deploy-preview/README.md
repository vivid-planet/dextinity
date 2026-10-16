# Deploy Preview Environment

Runs the complete demo (api, admin, site and everything they need) in Docker.
It is meant for deploy preview environments, for example to look at a pull request before it is merged.

Dependencies are installed and everything is built inside the images, so neither `./install.sh` nor a
build has to run on the host. The one thing prepared outside is the site-configs env file, which needs
the dextinity cli: `start-deploy-preview.sh` installs and builds it when the repository has not been set up.

It is **not** a development environment: there is no hot reloading and no watch mode.
Everything is built once, production style, and then started. For development use `pnpm run dev:demo`.

## Quick start

```bash
./start-deploy-preview.sh
```

The script renders `demo/site-configs/*.ts` for `DEPLOY_PREVIEW_HOST` into
`demo/.env.site-configs.deploy-preview` - the images themselves do not know the deploy preview host - and then brings
the compose project up, blocking until api and site report healthy. Run it again whenever
`DEPLOY_PREVIEW_HOST` or anything in `demo/site-configs/` changes. The first build takes a while,
because every image builds the packages its application depends on.

| Application | URL                                       |
| ----------- | ----------------------------------------- |
| Site        | http://demo.preview.localhost:8080        |
| Admin       | http://admin--demo.preview.localhost:8080 |
| Mails       | http://mail--demo.preview.localhost:8080  |

Like in local development, the admin redirects to the login page of the dev OpenID Connect provider
(`idp--demo.preview.localhost:8080`), where you pick one of the users from `demo/api/src/auth/static-users.ts`.
Every mail the demo sends ends up in Mailpit.

Everything besides the site sits next to the base domain, not below it: `admin--<host>`, not
`admin.<host>`. See [Host names](#host-names).

Afterwards `docker compose -f .deploy-preview/docker-compose.yml --project-directory .` works directly,
for instance to follow the logs, stop the environment, or remove the database and uploads:

```bash
docker compose -f .deploy-preview/docker-compose.yml --project-directory . logs -f
docker compose -f .deploy-preview/docker-compose.yml --project-directory . down
docker compose -f .deploy-preview/docker-compose.yml --project-directory . down --volumes
```

To start or restart the environment, run the script again.

## Several environments at the same time

Only one port is published, so a second environment needs a different port and its own
compose project name:

```bash
DEPLOY_PREVIEW_PORT=8081 COMPOSE_PROJECT_NAME=pr-123 ./start-deploy-preview.sh
```

The project name keeps containers, networks and volumes of the environments apart.
`demo/.env.site-configs.deploy-preview` is not, so start one environment after the other, not both at once.

## Configuration

All variables are optional.

| Variable                   | Default                                       | Description                                                          |
| -------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| `COMPOSE_PROJECT_NAME`     | `dextinity-demo-deploy-preview`               | Compose project to create                                            |
| `DEPLOY_PREVIEW_PORT`      | `8080`                                        | Host port the environment is published on                            |
| `DEPLOY_PREVIEW_HOST`      | `demo.preview.localhost:$DEPLOY_PREVIEW_PORT` | Public host used in all urls, see [Host names](#host-names)          |
| `DEPLOY_PREVIEW_SCHEME`    | `http`                                        | Set to `https` when TLS is terminated by an upstream proxy           |
| `DEPLOY_PREVIEW_URLS_FILE` |                                               | File `start-deploy-preview.sh` writes the urls of the environment to |

Everything else (imgproxy keys, `DAM_SECRET`, database credentials, ...) is taken from `.env`, which
docker compose loads automatically. The deploy preview environment therefore uses the same non-secret
development values as the local development setup.

### Host names

Every host of the environment is the base domain with a prefix in front of it rather than a
subdomain of it: `$DEPLOY_PREVIEW_HOST` serves the site, `admin--$DEPLOY_PREVIEW_HOST` the admin and
the api under `/api`, `idp--$DEPLOY_PREVIEW_HOST` the login and `mail--$DEPLOY_PREVIEW_HOST` Mailpit.

A wildcard certificate covers one dns label, so `*.example.com` matches `pr-123.example.com` but
not `admin.pr-123.example.com`. With the prefixes every host of every deploy preview stays one label
deep and a single `*.example.com` certificate is enough. `--` separates them because a host name
generated from a branch never contains it.

The site and the admin have to be on the same site (same registrable domain): the block preview in
the admin is served by the site and loads images through the admin's api, which only works when the
browser sends the login cookie along. `pr-123.example.com` and `admin--pr-123.example.com` share
`example.com`. Under `.localhost` however the registrable domain is the label in front of it, which is
why the default host is `demo.preview.localhost`: the admin at `admin--demo.preview.localhost` shares
`preview.localhost` with it, which `admin--preview.localhost` and `preview.localhost` would not.

`*.localhost` resolves to `127.0.0.1` in all current browsers, and browsers treat it as secure, which
the cookies of the site preview in the admin require. Any other host therefore needs https.

### Behind another reverse proxy

To serve a deploy preview under a real domain, point an upstream proxy at `DEPLOY_PREVIEW_PORT` and forward
`<domain>` and every `<prefix>--<domain>` to it, keeping the original `Host` header:

```bash
export DEPLOY_PREVIEW_PORT=30123
export DEPLOY_PREVIEW_HOST=pr-123.example.com
export DEPLOY_PREVIEW_SCHEME=https
export COMPOSE_PROJECT_NAME=pr-123

./start-deploy-preview.sh
```

## How it works

```
                                      ┌──────────────────────────────────────────┐
  :$DEPLOY_PREVIEW_PORT ──▶ caddy ──▶ │ admin--<host>    -> oauth2-proxy         │
                                      │                     ├─ /api/* -> api     │
                                      │                     └─ else   -> admin   │
                                      │ idp--<host>      -> idp (login)          │
                                      │ mail--<host>     -> mailpit              │
                                      │ everything else  -> site                 │
                                      └──────────────────────────────────────────┘

  api ──▶ postgres, imgproxy, mailpit         site ──▶ api (internal), valkey, mailpit
```

- **caddy** is the only container with a published port, which is what makes multiple parallel
  environments possible. It routes by how the host name starts, so it does not need to know the
  deploy preview host, see [Caddyfile](Caddyfile).
- **oauth2-proxy** and the **idp** (`dev-oidc-provider`) work like in local development. oauth2-proxy
  reaches the idp inside the network, while the browser is sent to its public host.
- The api loads the fixtures on its first start ([api-start.sh](api-start.sh)) and only migrates the
  database afterwards. The marker for that lives in the uploads volume, which has the same lifetime
  as the database volume.
- Postgres runs without `fsync` and tracing is disabled - deploy preview data is disposable and the
  environments should stay small.

### Images

One Dockerfile per application, each one installing and building only its own application and the
workspace packages it depends on:

| Dockerfile                           | Contains                                                     |
| ------------------------------------ | ------------------------------------------------------------ |
| [Api.Dockerfile](Api.Dockerfile)     | `demo/api` and its packages, served by `dist/main`           |
| [Admin.Dockerfile](Admin.Dockerfile) | `demo/admin` and its packages, served by `demo/admin/server` |
| [Site.Dockerfile](Site.Dockerfile)   | `demo/site` and its packages, served by `dist/server.js`     |
| [Idp.Dockerfile](Idp.Dockerfile)     | `dev-oidc-provider` with the users of `static-users.ts`      |

oauth2-proxy uses the official image, in the version of `OAUTH2_PROXY_VERSION` from `.env`.

All of them use the repository root as build context, because the demo applications need the
workspace packages and files of each other (`demo/api/schema.gql`, `demo/api/block-meta.json`,
`demo/site-configs/site-configs.d.ts`). The [.dockerignore](../.dockerignore) excludes everything that
install and build generate, so a build from a fresh clone and a build from a local working copy
produce the same image.

Each image is built and run in a single stage: the images never leave the machine that built them, so
their size does not matter. What does matter is the build time, which is why the manifests are copied before the
sources (a source change then does not invalidate `pnpm install`) and why the pnpm store and the
Next.js build cache are mounted.

## Limitations

- The contact form and the file upload of the site need reCAPTCHA credentials, which `.env` does not
  contain. Export `RECAPTCHA_SITE_KEY` and `RECAPTCHA_SERVICE_ACCOUNT` before starting the environment
  to use them.
- Brevo needs credentials that are only available to developers (`.env.local`). Export
  `BREVO_API_KEY` and friends before starting the environment to use the Brevo features.
- Anyone who can reach the admin host can log in: the idp lets you pick a user without a password.
  Do not expose an environment to the internet without putting authentication in front of it.
- Mailpit is not behind the login, so anyone who can reach `mail--<host>` can read the mails.
- The applications run as root inside their containers.
- `demo/.env.site-configs.deploy-preview` is a single file in the repository, so two environments with
  different hosts cannot be rendered at the same time - render, start, then render the next.
- `down --volumes` deletes the uploads together with the database. The fixtures are loaded again on
  the next start.
