---
title: Deployment
---

Deploying a Dextinity application requires a couple of [microservices](/docs/#microservices). The following sections describe how to deploy them.

## IDP

Any OIDC-compliant identity provider can be used with Dextinity. You can either use an existing IDP as SaaS (such as [Auth0](https://auth0.com/)) or self-host your own IDP.

## Database

We recommend a managed PostgreSQL database such as [Azure Database for PostgreSQL](https://azure.microsoft.com/en-us/products/postgresql) or [PostgreSQL on Digital Ocean](https://www.digitalocean.com/pricing/managed-databases#postgresql). Managed databases are easier to maintain and scale as they provide automatic backups, monitoring, and scaling.

For those with budget constraints, the database can be included in the [Docker Compose setup for the API, Admin, and Site](#docker-compose).

## Asset Storage

We recommend using a managed object storage service like [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs) or [Digital Ocean Spaces](https://www.digitalocean.com/products/spaces). A list of supported storage backends can be found [here](/docs/features-modules/asset-management/#storage-backends).

For those with budget constraints, the asset storage can be included in the [Docker Compose setup for the API, Admin, and Site](#docker-compose), either as a mounted volume or as S3-compatible storage.

## API, Admin, Site, oauth2-proxy and imgproxy

There are several ways to deploy these microservices. The best deployment method depends on your budget and requirements.

### Deployment with Kubernetes

Dextinity is a cloud-native CMS, so Kubernetes is the preferred way to deploy a Dextinity application, as it provides the most flexibility and supports all enterprise requirements. However, it is usually the most expensive way.

We provide [Helm](https://helm.sh/) Charts, which are available on [GitHub](https://github.com/vivid-planet/comet-charts), for easy deployment.

### Deployment without Kubernetes

Dextinity applications can also be deployed without Kubernetes. Two possible options are serverless container platforms (e.g., [Azure Container Apps](https://azure.microsoft.com/en-us/products/container-apps) or [Digital Ocean App Platform](https://docs.digitalocean.com/products/app-platform/)) or [Docker Compose](https://docs.docker.com/compose/).

It's important to note that deploying without Kubernetes comes with its own set of limitations. You won't be able to use the `KubernetesModule`. Additionally, [CronJobs](/docs/features-modules/cron-jobs/) must be handled differently and might require an external service. Consequently, you won't be able to use the `CronJobModule`.

#### Serverless

Serverless container platforms are a good option for those who want to deploy Dextinity applications without the complexity of Kubernetes. They are usually cheaper than Kubernetes and provide automatic scaling. An example deployment for the Digital Ocean App Platform can be found [here](https://github.com/vivid-planet/dextinity-starter/tree/main/.digitalocean).

#### Docker Compose

For those with budget constraints, [Docker Compose](https://docs.docker.com/compose/) can be a viable option for deploying Dextinity applications. An example deployment can be found [here](https://github.com/vivid-planet/dextinity-starter/tree/main/.docker-compose). The deployment only requires Docker to be installed on a server and leverages the power of [Traefik](https://doc.traefik.io/traefik/) to manage the ingress traffic (including SSL certificates).
