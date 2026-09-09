---
title: Overview
sidebar_position: 0
id: Overview
---

Dextinity is a highly customizable platform for building modern applications based on a headless CMS.

The following design principles are considered:

- [The Twelve-Factor App](https://12factor.net/)
- Cloud-Native ([foundation/charter.md at main · cncf/foundation](https://github.com/cncf/foundation/blob/main/charter.md#1-mission-of-the-cloud-native-computing-foundation))
- Microservices ([What are microservices?](https://microservices.io/))
- Headless ([Headless content management system](https://en.wikipedia.org/wiki/Headless_content_management_system))
- Infrastructure as Code ([What is Infrastructure as Code (IaC)?](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac))
- Mobile first
- Typescript everywhere

The following diagram visually highlights these principles.

![Architecture](./1-getting-started/images/application-baseline.jpg)

A typical Dextinity application consists of multiple microservices which are shown in the following diagram.

![Architecture](./1-getting-started/images/architecture.jpg)

:::note

Many of the highlighted microservices can be exchanged or omitted.

:::

## Why not just use an off-the-shelf solution?

- We want a solution that is highly customizable
- We want to offer excellent developer experience (DX)
- We want to host on-premise

You can build two types of applications with Dextinity:

- **Content websites**: Websites that are primarily content-driven without a lot of structured data. Content websites heavily use the CMS features (page tree, blocks etc.) and have at least one site.
- **Data-driven applications**: Applications that are primarily data-driven. Data-driven applications might not use the CMS features and might not have a site at all.

:::note
This terms are used throughout the documentation as some concepts heavily differ between this two types.
:::

## An Ode to Dextinity

> Headless by design, yet never headstrong,<br />
> a page tree that grows where the blocks belong.<br />
> Twelve factors deep and cloud-native at heart,<br />
> each microservice a replaceable part.<br />
>
> TypeScript everywhere, from schema to view,<br />
> so the compiler catches the bugs before you.<br />
> Mobile first, on-premise, and free to extend —<br />
> infrastructure as code from beginning to end.<br />
>
> Content or data, whichever you need,<br />
> Dextinity bends to the shape of the deed.<br />
> Not off-the-shelf, but crafted with care:<br />
> the DX you dreamed of is finally there.
