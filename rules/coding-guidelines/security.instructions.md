---
description: Security-by-design, privacy, authorization, defense-in-depth principles
applyTo: "**"
alwaysApply: false
---

# Secure Software Development Rules

Apply these when designing features, reviewing diffs, or writing validation/auth code. They are guidelines, not absolutes — reason about them explicitly rather than skipping them.

## Security by design

- Validate input as precisely as possible. Prefer `IsUrl`, `IsEmail`, `IsUUID`, etc. over `IsString`. Narrow validators limit the blast radius of downstream bugs (e.g. XSS).
- Canonicalize before comparing: lowercase emails, normalize URL trailing slashes / default ports, etc. — prevents duplicate accounts and Allow/Deny list bypasses.
- Generate random values only via crypto-secure APIs (`node:crypto`). Never use `Math.random` for tokens, IDs, secrets, or nonces.

## Privacy by design

- Only persist data that is actually needed. Plan deletion alongside creation (e.g. auto-delete contact requests after retention period).
- Default settings should be the privacy-friendly option.
- Avoid leaking account existence in flows like "forgot password": respond the same way whether the email is registered or not.

## Authorization

- **Least privilege**: users and services start with zero rights; grant only what is necessary. Never build an "allow everything then deny" model.
- **Complete mediation**: check authorization on every access, not once per session.
- **Fail-secure**: deny by default. If a rule does not explicitly grant access, access is denied. Use DB transactions to avoid partial writes on failure.
- ACL logic belongs in a dedicated ACL service or inline in the controller/resolver — never in shared services (which also run from console jobs without an authenticated user). See [api-nestjs.instructions.md](api-nestjs.instructions.md).

## Defense in depth

- Combine mechanisms (e.g. IP allow-list **and** auth **and** rate limiting). One layer is not enough.

## Keep it simple

- Security relies on understandability and testability. Simpler designs are more secure designs. Resist clever schemes.

## Don't roll your own crypto / auth

- Security-sensitive primitives (hashing, signing, auth flows, session handling) must use vetted libraries or Dextinity's built-in tools. No obscurity-based schemes.

## Admin / public separation

- Administrative interfaces must be separated from public ones. Site-to-API calls without user auth go through the BFF, not directly to the API.
