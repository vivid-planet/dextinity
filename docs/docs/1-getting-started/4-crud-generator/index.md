---
title: CRUD Generator
sidebar_position: 4
---

To accelerate the development of a feature, the CRUD Generator can be used to generate the usual CRUD operations (in GraphQL) for the feature. The CRUD Generator is available for the API and for the Admin. The CRUD Generator can be used in two ways:

### "True" Generation

The code is regenerated when changes are made to the entity.

- :heavy_plus_sign: **Advantages**: Changes to the entity and improvements in the generator are directly adopted.
- :heavy_minus_sign: **Disadvantage**: Inflexible. Changes to the generated code are not possible.

### Scaffolding

The generated code is used as a starting point.

- :heavy_plus_sign: **Advantage**: Flexibility. Changes to the generated code are easily possible.
- :heavy_minus_sign: **Disadvantage**: Improvements in the generator must be manually incorporated.

## CRUD Generator vs. Agent Skills

Besides the CRUD Generator, Comet provides [Agent Skills](../../11-agent-skills/index.md) that teach AI coding assistants how to produce CRUD code in the same style the generator emits. See [Agent Skills](../../11-agent-skills/index.md) for guidance on when to use which approach.
