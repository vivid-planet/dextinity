---
description: Security-by-design, privacy, authorization, defense-in-depth principles
applyTo: "**"
alwaysApply: false
---

# Secure Software Development Rules

## Input

- Validate input as precisely as possible. Prefer `IsUrl`, `IsEmail`, `IsUUID`, etc. over `IsString`. Narrow validators limit the damage of downstream bugs (e.g. XSS).
- Canonicalize before comparing: lowercase emails, normalize URL trailing slashes and default ports. This prevents duplicate accounts and Allow/Deny list bypasses.
- Generate random values only via `node:crypto`. Never use `Math.random` for tokens, IDs, secrets, or nonces.

## Privacy

- Only persist data that is actually needed, and plan its deletion when you add it (e.g. delete contact requests after the retention period).
- Make the privacy-friendly option the default setting.
- Don't leak whether an account exists, e.g. in "forgot password": respond the same way whether the email is registered or not.

## Authorization

- Deny by default: grant only what a rule explicitly allows, and check on every access. Never build an "allow everything, then deny" model.
- Use DB transactions so a failure doesn't leave partial writes.
- ACL logic belongs in a dedicated ACL service or inline in the controller/resolver, never in shared services, which also run from console jobs without an authenticated user. See [api-nestjs.instructions.md](api-nestjs.instructions.md#access-control-acl).
- Use Dextinity's built-in auth tools or vetted libraries for hashing, signing, auth flows, and sessions. Never write your own.

## Admin / public separation

- Keep administrative interfaces separate from public ones.
- The site never calls the API directly without user auth. It goes through a BFF (Backend for Frontend) in the site, e.g. the GraphQL route built with `persistedQueryRoute` from `@dextinity/site-nextjs`, which only forwards known persisted queries and adds the system user's credentials on the server.
