---
title: Naming conventions
sidebar_position: -5
---

## Azure Naming Conventions

[Naming rules and restrictions for Azure resources - Azure Resource Manager](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/resource-name-rules)

## Kubernetes Naming Conventions

myproject-prod  
myproject-test  
myproject-dev

## Database Naming Conventions

Database: `db_myproject_dev`  
User: `myproject_dev`  
Entities: Always singular starting with a capital letter (e.g., Product)

## Git Naming Conventions

**Standard branches:**

- main
- test (optional)
- staging

**Feature branches:** `feature/…`, protected and long-lived, see [Feature Branches](./04-git-guidelines.md#feature-branches). The prefix is reserved for them. Never use it for a normal branch.

## File/Folder Naming Conventions

|        | API (TLDR: like Nest)                                                                            | ADMIN (TLDR: like MUI/React)                                                                                   | SITE (TLDR: like Next)                                                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Folder | kebab-case<br/><br/>page-tree                                                                    | camelCase<br/><br/>pageTree                                                                                    | camelCase<br/>contentScope                                                                                                                                |
| File   | kebab-case with dot structure for components<br/><br/>page-tree.service.ts / page-tree.module.ts | PascalCase for components; camelCase otherwise (z.B: hooks, functions)<br/><br/>DashboardPage.tsx / useUser.ts | PascalCase for components;<br/>camelCase otherwise (e.g., hooks, functions), exception: Page in lowercasepage<br/><br/>page.tsx / Layout.tsx / useUser.ts |
