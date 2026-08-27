# Dextinity

![npm (scoped with tag)](https://img.shields.io/npm/v/%40dextinity/admin/latest)
![npm (scoped with tag)](https://img.shields.io/npm/v/%40dextinity/admin/canary)
![npm (scoped with tag)](https://img.shields.io/npm/v/%40dextinity/admin/next-canary)

![main](https://github.com/vivid-planet/dextinity/actions/workflows/lint.yml/badge.svg?branch=main)
![next](https://github.com/vivid-planet/dextinity/actions/workflows/lint.yml/badge.svg?branch=next)

## Docs

Visit https://cms-docs.dextinity.com/ to view the documentation.

## Create a new Dextinity project

Use `@dextinity/create-app` to create a new Dextinity project. More information can be found in the [docs](https://cms-docs.dextinity.com/docs/getting-started/).

## Development

### Prerequisites

The following tools need to be installed on your local machine.

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [nvm](https://github.com/nvm-sh/nvm)

### Setup workspace

Run the `install.sh` script to install dependencies and setup needed symlinks.

```bash
# Optionally set domain to use instead of localhost (add to e.g. ~/.bashrc)
export DEV_DOMAIN=myname.dev.vivid-planet.cloud # Vivid Planet network

sh install.sh
```

_It is recommended to run `install.sh` every time you switch to the `main` branch._

### MUI X Data Grid Pro License

If you want to use features from `@mui/x-data-grid-pro`, you need to configure your MUI license key. Create a `.env.local` file in your project root and add your license key:

`.env.local`:

```
MUI_LICENSE_KEY=your_license_key_here
```

### Build packages

Before starting individual development processes, build all Dextinity packages at least once.

```bash
pnpm run build:packages
```

_It is recommended to build all packages every time you switch to the `main` branch._

### Start development processes

[dev-process-manager](https://dev-process-manager.com/) is used for local development.
We recommend only running the development process you will need.
Typically, you will need a subset of the available development processes.

Here are a few examples:

1. You want to add a new component to `@dextinity/admin`

    Start the development process for `@dextinity/admin`:

    ```bash
    pnpm exec dev-pm start @dextinity-admin
    ```

    Create a development story in Storybook:

    ```bash
    pnpm run storybook
    ```

2. You want to add a CMS feature to the API

    Start the development process for `@dextinity/cms-api`:

    ```bash
    pnpm exec dev-pm start @cms-api
    ```

    Start Demo API:

    ```bash
    pnpm exec dev-pm start @demo-api
    ```

    The Demo API will be available at [http://localhost:4000/](http://localhost:4000/)

3. You want to add a CMS feature to the Admin

    Start the development process for `@dextinity/cms-admin`:

    ```bash
    pnpm exec dev-pm start @cms-admin
    ```

    Start Demo API and Admin:

    ```bash
    pnpm exec dev-pm start @demo-api @demo-admin
    ```

    The Demo Admin will be available at [http://localhost:8000/](http://localhost:8000/)

See [dev-pm.config.js](/dev-pm.config.js) for a list of all available processes and process groups.

#### Start Demo

```bash
pnpm exec dev-pm start @demo
```

Demo will be available at

- Admin: [http://localhost:8000/](http://localhost:8000/)
- API: [http://localhost:4000/](http://localhost:4000/)
- Site: [http://localhost:3000/](http://localhost:3000/)

It is also possible to start specific microservices

```bash
pnpm exec dev-pm start @demo-api # (@demo-api|@demo-admin|@demo-site)
```

#### Start Storybook

```bash
pnpm run storybook
```

Storybook will be available at [http://localhost:26638/](http://localhost:26638/)

#### Start Docs

```bash
pnpm exec dev-pm start @docs
```

The docs will be available at [http://localhost:3300/](http://localhost:3300/)  
_This will also start Storybook, due to some docs-pages being generated from storybook stories._

### Stop processes

```bash
pnpm exec dev-pm shutdown
```

### Dev scripts

We provide `dev:*` scripts for the most common use cases.
For example, to start the Demo, you can also run:

```bash
pnpm run dev:demo
```

However, we recommend directly using dev-process-manager for greater control over which development processes to start.

See [package.json](/package.json) for a list of all available dev scripts.

## Developing in an external project

### Requirements

- [watchman](https://facebook.github.io/watchman/)
- [wml](https://github.com/wix/wml)

### Setup

Configure `wml` to sync the Dextinity `node_modules` to the external project:

```bash
./wml-add.sh /path/to/my-project
```

It may be necessary to configure `watchman` to watch your globally installed `wml`:

```bash
watchman watch $(dirname "$(dirname "$(which node)")")/lib/node_modules/wml/src
```

Start syncing the Dextinity `node_modules` to the external project:

```bash
wml start
```

## Contributing

Please read our [Contributing](CONTRIBUTING.md) file.
