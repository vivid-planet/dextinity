---
title: Agent Skills
---

Agent Skills are reusable prompt-based instructions that teach AI coding assistants (like Claude Code) how to generate code following Comet DXP conventions. Each skill encodes project-specific patterns, best practices, and code examples so the AI can produce consistent, high-quality output.

For installation instructions, see the [Installing agent skills](../4-guides/5-installing-agent-features.md) guide.

## Agent Skills vs. CRUD Generator

Agent Skills are the recommended way to scaffold CRUD features. The [CRUD Generator](../1-getting-started/4-crud-generator/index.md) will be deprecated in a future version — use Agent Skills instead where possible.

The skills are deliberately aligned with the output style of the CRUD Generator, so code produced by skills fits seamlessly next to previously generated code. Unlike generator output, skill-produced files are ordinary source files that you own and maintain like any hand-written code — there is no regeneration step and no `generated/` folder.

For existing entities still managed by the CRUD Generator, the generator workflow keeps working: files inside `generated/` folders must not be edited by hand — including by AI assistants — and are updated by rerunning the generator. When such an entity needs changes the generator cannot express, consider migrating it to skill-maintained source files instead of extending the generator setup.

### Available Skills

| Skill                                                          | Description                                                                    |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [comet-crud](2-comet-crud/index.md)                            | Full-stack CRUD orchestrator — chains all skills to scaffold a complete entity |
| [comet-api-graphql](2-comet-crud/1-comet-api-graphql.md)       | NestJS/GraphQL API: entity, service, resolver, DTOs, module                    |
| [comet-admin-enum](2-comet-crud/2-comet-admin-enum.md)         | Translatable enum components, chips, and form fields                           |
| [comet-admin-datagrid](2-comet-crud/3-comet-admin-datagrid.md) | Server-side MUI DataGrid with filtering, sorting, and pagination               |
| [comet-admin-form](2-comet-crud/4-comet-admin-form.md)         | Final Form components with create/edit modes and save conflict detection       |
| [comet-admin-pages](2-comet-crud/5-comet-admin-pages.md)       | Page navigation, layouts, toolbars, and routing patterns                       |
