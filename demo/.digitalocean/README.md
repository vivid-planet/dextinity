# Demo on DigitalOcean App Platform

Deploys the demo for internal use, the same way the [Starter](https://github.com/vivid-planet/dextinity-starter/tree/main/.digitalocean) is deployed. It runs in its own DigitalOcean project with its own Spaces bucket and imgproxy. Its database `demo` is on the team's existing DigitalOcean database cluster, which the Starter uses as well.

| App                       | Components                     | Domains                                                                                                                   |
| ------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `dextinity-demo-cms`      | `api`, `admin`, `oauth2-proxy` | `admin.demo.digitalocean.dextinity.com`                                                                                   |
| `dextinity-demo-site`     | `site`                         | `demo.digitalocean.dextinity.com`, `secondary.demo.digitalocean.dextinity.com`, `preview.demo.digitalocean.dextinity.com` |
| `dextinity-demo-imgproxy` | `darthsim-imgproxy`            | `imgproxy.demo.digitalocean.dextinity.com`                                                                                |

The admin requires a login with a `vivid-planet.com` account. The site is public, as in the Starter.

At the end of its build, the site uploads its `.next/static` files to the bucket under `site/_next/static` with [rclone](https://rclone.org). The storage keeps the files of every deployed build. The access key is only available while building.

Like the Starter's, the components are built with App Platform's Node.js buildpack. Unlike the Starter's, they build from the repository root, because the demo depends on the packages in this repository rather than on released versions.

## One-time setup

1. On the existing DigitalOcean database cluster, create the database `demo` and the user `demo`, and grant the user access to the database. The cluster's CA certificate is committed as `digitalocean-postgresql-ca.crt`, the API trusts it through `NODE_EXTRA_CA_CERTS`.
2. Create the DigitalOcean project `dextinity-demo` in the team that hosts the Starter. In that project, create the Spaces bucket `dextinity-demo` in `fra1` and a Spaces access key for it.
3. Create an OIDC client on `login.vivid-planet.cloud` with the redirect URI `https://admin.demo.digitalocean.dextinity.com/oauth2/callback` and the post logout URI `https://admin.demo.digitalocean.dextinity.com/oauth2/sign_out?rd=%2F`.
4. Add the variables and secrets below to this repository's GitHub Actions settings, and store the secrets in 1Password. The workflow passes them into the app specs.
5. Run the "Update DigitalOcean Demo Deployment" workflow, or merge into `main`. The first run creates the apps in the `dextinity-demo` project.
6. Add the app `dextinity-demo-cms` to the trusted sources of the database cluster, like the Starter's app. Point the DNS records of the domains above to the apps, as shown in the DigitalOcean console.

| Name                                                                                                                           | Kind     | Value                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `DIGITALOCEAN_API_KEY`                                                                                                         | secret   | DigitalOcean API token of the team. Creating the apps on the first run requires a token of a user who has linked GitHub in DigitalOcean |
| `DEMO_DIGITALOCEAN_PROJECT_ID`                                                                                                 | variable | ID of the `dextinity-demo` project                                                                                                      |
| `DEMO_IDP_CLIENT_ID`                                                                                                           | variable | Client ID of the OIDC client                                                                                                            |
| `DEMO_OAUTH2_PROXY_CLIENT_SECRET`                                                                                              | secret   | Client secret of the OIDC client                                                                                                        |
| `DEMO_OAUTH2_PROXY_COOKIE_SECRET`                                                                                              | secret   | `openssl rand -base64 32 \| tr -- '+/' '-_'`                                                                                            |
| `DEMO_POSTGRESQL_PWD_BASE64`                                                                                                   | secret   | Password of the `demo` database user, base64-encoded                                                                                    |
| `DEMO_S3_ACCESS_KEY_ID`, `DEMO_S3_SECRET_ACCESS_KEY`                                                                           | secrets  | The Spaces access key                                                                                                                   |
| `DEMO_STATIC_ASSETS_S3_ACCESS_KEY_ID`, `DEMO_STATIC_ASSETS_S3_SECRET_ACCESS_KEY`                                               | secrets  | A Spaces access key for the bucket's static assets, used by the site build to upload them                                               |
| `DEMO_IMGPROXY_KEY`, `DEMO_IMGPROXY_SALT`                                                                                      | secrets  | `openssl rand -hex 32` each                                                                                                             |
| `DEMO_API_BASIC_AUTH_SYSTEM_USER_PASSWORD`, `DEMO_DAM_SECRET`, `DEMO_FILE_UPLOADS_DOWNLOAD_SECRET`, `DEMO_SITE_PREVIEW_SECRET` | secrets  | At least 16 characters each, e.g. `openssl rand -hex 16`                                                                                |

## Deploying

The [Update DigitalOcean Demo Deployment](../../.github/workflows/update-digital-ocean-demo-deployment.yml) workflow deploys every push to `main`, like the Starter's. It can also be started manually.

## Limitations

- The Builds and Cron Jobs pages in the admin don't work, because they need Kubernetes.
- The Brevo features and the contact form (reCAPTCHA) aren't configured.
- Users are admins only if the IDP sends an `isAdmin` claim. Otherwise they can only edit the "main" domain.
