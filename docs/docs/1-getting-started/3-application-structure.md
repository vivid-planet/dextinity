---
title: Application structure
sidebar_position: 3
---

The application starts automatically when executing `npm run dev`.

## Services

Some microservices are used as existing solutions and only need to be configured. Others are custom-built for the application.

### Dextinity microservices

The following microservices are custom-built for the application.

#### API

Built with Typescript based on [NestJS](https://nestjs.com/). NestJS is an aggregator for a lot of well-known libraries. NestJS applications are structured in modules and rely heavily on [Dependency Injection](https://inversify.io/) (DI).

Interaction with the API is possible using [GraphQL](https://graphql.org/) except for uploading files where REST is used. We use [ApolloServer](https://www.apollographql.com/) for creating our GraphQL API. The GraphQL schema is generated using a code-first approach, where the schema is defined programmatically.

As a connector from our API to the database, we use [MikroORM](https://mikro-orm.io/).

#### Admin

The admin provides interfaces for managing data. It is built using [React](https://reactjs.org/) with Typescript. We create our admin applications using [MUI](https://mui.com/) design library. For interaction with the API we rely on [ApolloClient](https://www.apollographql.com/docs/react/), the counterpart to ApolloServer.

Other core libraries in use:

- [FinalForm](https://final-form.org/react) for creating Forms
- [ReactRouter](https://reactrouter.com/) for navigation

#### Site

Consumer for the data. This part is optional because we are headless. Also, multiple sites for different clients (e.g., website and mobile app) can coexist.

While any technology can be used, we focus on [NextJS](https://nextjs.org/). With NextJS we can use Typescript and React for building our sites. NextJS provides Server Side Rendering (SSR), Client Side Rendering (CSR), and [Static Generation](https://nextjs.org/docs/basic-features/pages#pre-rendering) (SG).

### Third-party microservices

The following microservices are existing solutions that are used as-is and only need to be configured.

#### Database

We persist our data in [PostgreSQL](https://www.postgresql.org/) database.

#### Asset Storage

DAM assets and resized images are stored in a storage backend.

#### oauth2-proxy and Identity Provider (IDP)

The [oauth2-proxy](https://oauth2-proxy.github.io/oauth2-proxy/) is a reverse proxy that authenticates requests using an OIDC-compliant Identity Provider.

#### imgproxy

[imgproxy](https://imgproxy.net/) is a fast and efficient image proxy service that can be used to optimize and resize images. It is used to optimize images for the DAM.

## How to reach the services

The Admin can be reached under http://localhost:8000. However, this port is connected with the `oauth2-proxy`, which handles the authorization with the `demo-oidc-provider` and then proxies the Admin and the API. This setup is very similar to a production setup as it requires a real authentication. The available users, however, are defined in `demo/api/src/auth/static-users.ts` and will be presented to choose from in the login process.

The site is available under http://localhost:3000. It does not have authentication.
