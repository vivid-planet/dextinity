# Deploy Preview Environment

Runs the complete demo (api, admin, site, login and mails) in Docker, built production style, for
example to look at a pull request before it is merged. For development use `pnpm run dev:demo`.

## Quick start

```bash
./start-deploy-preview.sh
```

| Application | URL                                       |
| ----------- | ----------------------------------------- |
| Site        | http://demo.preview.localhost:8080        |
| Admin       | http://admin--demo.preview.localhost:8080 |
| Mailpit     | http://mail--demo.preview.localhost:8080  |

The admin login offers the users of `demo/api/src/auth/static-users.ts`, like in local development.

Run the script again to restart the environment, also after changing `DEPLOY_PREVIEW_HOST` or
`demo/site-configs/`. To stop it, or to also remove the database and uploads:

```bash
docker compose -p dextinity-demo-deploy-preview down [--volumes]
```

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
`demo/.env.site-configs.deploy-preview`:

```bash
DEPLOY_PREVIEW_PORT=8081 COMPOSE_PROJECT_NAME=pr-123 ./start-deploy-preview.sh
```

## Host names

Admin, login and mails are served under `admin--<host>`, `idp--<host>` and `mail--<host>`: next to
the base domain instead of below it, so that a single wildcard certificate (`*.example.com`) covers
every host of every deploy preview. Behind an upstream proxy, forward all of them to
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
