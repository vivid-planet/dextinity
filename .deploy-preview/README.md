# Deploy Preview Environment

Runs the complete demo (api, admin, both sites, login and mails) in Docker, built production style,
for example to look at a pull request before it is merged. For development use `pnpm run dev:demo`.

## Quick start

```bash
./start-deploy-preview.sh
```

| Application     | URL                                               |
| --------------- | ------------------------------------------------- |
| Site            | http://demo.preview.localhost:8080                |
| Site (Vite RSC) | http://site-vite-rsc--demo.preview.localhost:8080 |
| Admin           | http://admin--demo.preview.localhost:8080         |
| Mailpit         | http://mail--demo.preview.localhost:8080          |

The admin login offers the users of `demo/api/src/auth/static-users.ts`, like in local development.

Run the script again to restart the environment, also after changing `DEPLOY_PREVIEW_HOST` or
`demo/site-configs/`. To stop it, or to also remove the database and uploads:

```bash
docker compose -p dextinity-demo-deploy-preview down [--volumes]
```

## Sites

`site` is the Next.js demo site (`demo/site`, `Site.Dockerfile`), `site-vite-rsc` the same demo
built with `@dextinity/site-vite-rsc` (`demo/site-vite-rsc`, `SiteViteRsc.Dockerfile`, started with
`node dist/server.js`). Both render the same content from the same api with the same environment,
except that `site-vite-rsc` prefixes its Valkey keys with `site-vite-rsc:`.

A site finds its site config by its host, so `start-deploy-preview.sh` renders the site configs twice:
`demo/.env.site-configs.deploy-preview` for `DEPLOY_PREVIEW_HOST`, used by api, admin and `site`, and
`demo/.env.site-configs.deploy-preview-site-vite-rsc` for `site-vite-rsc--DEPLOY_PREVIEW_HOST`, used
by `site-vite-rsc`. The admin only knows the first, so its site preview, block preview and links to
pages open the Next.js site. To preview in the Vite site instead, set `PREVIEW_URL` of `admin` to the
url of `site-vite-rsc`, and give api and admin its site configs.

## Configuration

All variables are optional. Everything else is taken from `.env`.

| Variable                   | Default                                       | Description                                                          |
| -------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| `COMPOSE_PROJECT_NAME`     | `dextinity-demo-deploy-preview`               | Compose project to create                                            |
| `DEPLOY_PREVIEW_PORT`      | `8080`                                        | Host port the environment is published on                            |
| `DEPLOY_PREVIEW_HOST`      | `demo.preview.localhost:$DEPLOY_PREVIEW_PORT` | Public host used in all urls                                         |
| `DEPLOY_PREVIEW_SCHEME`    | `http`                                        | Set to `https` when TLS is terminated by an upstream proxy           |
| `DEPLOY_PREVIEW_URLS_FILE` |                                               | File `start-deploy-preview.sh` writes the urls of the environment to |

A second environment needs its own port and project name. Start one after the other, as they share
the site configs rendered to `demo/.env.site-configs.deploy-preview*`:

```bash
DEPLOY_PREVIEW_PORT=8081 COMPOSE_PROJECT_NAME=pr-123 ./start-deploy-preview.sh
```

## Host names

Admin, login, mails and the Vite site are served under `admin--<host>`, `idp--<host>`, `mail--<host>`
and `site-vite-rsc--<host>`: next to the base domain instead of below it, so that a single wildcard
certificate (`*.example.com`) covers every host of every deploy preview. Behind an upstream proxy, forward all of them to
`DEPLOY_PREVIEW_PORT` and keep the `Host` header.

Site and admin must share their registrable domain, otherwise the block preview in the admin cannot
load images. Under `.localhost` that is the label in front of it, hence the default
`demo.preview.localhost`. Hosts other than `*.localhost` need https, which the site preview cookies
require.

## Limitations

- Anyone who can reach the admin can log in without a password, and Mailpit has no login at all. Do
  not expose an environment without putting authentication in front of it.
- The contact form and the file upload of the site need `RECAPTCHA_SITE_KEY` and
  `RECAPTCHA_SERVICE_ACCOUNT`, Brevo needs `BREVO_API_KEY` and friends. Export them before starting
  the environment.
