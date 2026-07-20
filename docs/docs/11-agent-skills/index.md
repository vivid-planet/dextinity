---
title: Agent Skills
---

Agent Skills are reusable prompt-based instructions that teach AI coding assistants (like Claude Code) how to generate code following Comet DXP conventions. Each skill encodes project-specific patterns, best practices, and code examples so the AI can produce consistent, high-quality output.

For installation instructions, see the [Installing agent skills](../4-guides/5-installing-agent-features.md) guide.

## Agent Skills vs. CRUD Generator

Comet offers two complementary ways to scaffold CRUD features. Both produce code in the same style — the skills are deliberately aligned with the output of the [CRUD Generator](../1-getting-started/4-crud-generator/index.md) — so they can be mixed within one project.

**Use the [CRUD Generator](../1-getting-started/4-crud-generator/index.md)** when you want deterministic, regenerable output driven by entity decorators (`@CrudGenerator`) and `*.cometGen.tsx` config files. Changes to the entity are picked up by rerunning the generator, and generator improvements arrive automatically. Files inside `generated/` folders must not be edited by hand — including by AI assistants.

**Use Agent Skills** when working with an AI coding assistant, especially for code the generator cannot express: custom business logic, non-standard grid or form layouts, bespoke navigation, or one-off scaffolding you intend to own and modify by hand afterwards. The skills produce ordinary source files that you maintain like any hand-written code — they are not regenerable.

If an entity is already managed by the CRUD Generator, prefer extending it through the generator's mechanisms (decorators, hooks services, config) over hand-writing parallel code with skills.

### Available Skills

| Skill                                                          | Description                                                                    |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [comet-crud](2-comet-crud/index.md)                            | Full-stack CRUD orchestrator — chains all skills to scaffold a complete entity |
| [comet-api-graphql](2-comet-crud/1-comet-api-graphql.md)       | NestJS/GraphQL API: entity, service, resolver, DTOs, module                    |
| [comet-admin-enum](2-comet-crud/2-comet-admin-enum.md)         | Translatable enum components, chips, and form fields                           |
| [comet-admin-datagrid](2-comet-crud/3-comet-admin-datagrid.md) | Server-side MUI DataGrid with filtering, sorting, and pagination               |
| [comet-admin-form](2-comet-crud/4-comet-admin-form.md)         | Final Form components with create/edit modes and save conflict detection       |
| [comet-admin-pages](2-comet-crud/5-comet-admin-pages.md)       | Page navigation, layouts, toolbars, and routing patterns                       |
