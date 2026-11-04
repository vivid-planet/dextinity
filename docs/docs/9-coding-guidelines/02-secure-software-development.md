---
title: Basic principles of secure software development
sidebar_position: -5
---

:::caution
Not all principles are always applicable. They should be regarded as fundamental guidelines and serve as a basis for reasoning when designing features.
:::

:::caution
This document is not a complete documentation but highlights points relevant to our products and workflows. Detailed documentation on secure software development is provided as links at the end of this document.
:::

## Security by Design

Security must be considered from the very beginning by all project participants. Features should be questioned with respect to security.

**Technical measures (examples):**

- Input validation: The more precise, the better, e.g. use `IsUrl` instead of just `IsString`. This also helps limit further attacks (e.g., in XSS, where a URL allows much less exploitation than free text).
- Canonicalization:
    - For email addresses (A@b.com vs. a@b.com) to prevent duplicate accounts and thereby prevent many other attacks (email spoofing or exploiting bugs where email addresses are compared canonically).
    - For URLs (https://www.a.com vs. https://www.a.com/ vs. https://www.a.com:443/) e.g., to prevent bypassing Allow or Deny lists.
- Generate random numbers only with cryptographically secure means (e.g., [Node.js v24.2.0 Crypto Documentation](https://nodejs.org/api/crypto.html)).

## Privacy by Design

Privacy must be considered from the very beginning by all project participants. Features should be questioned with respect to data privacy.

**Example:** When developing a "Forgot Password" function, after entering the email address it shows: "If an account exists for this email address, a link with instructions to reset your password has been sent to your inbox." This does not reveal whether an account exists for the entered address.

**Technical measures (examples):**

- Store data only when necessary.
- Privacy-friendly default settings.
- Delete data after processing (e.g., delete contact requests after one year).

## Least Privilege

The software or user must not request or use more system permissions than absolutely necessary.

**Technical measures (examples):**

- User authorization always starts with no rights and only grants what is necessary — not the other way around.

## Defense in Depth

Many mechanisms — on many levels — provide good protection against threats.

**Technical measures (examples):**

- Combination of IP blocking + authentication.
- Rate limiting.

## Fail-Secure / Fail-Safe

It should be defined how the software reacts in case of failure. Forced failure cases can pose security risks if, for example, stack traces become visible.

**Technical measures (examples):**

- Deny-Access-By-Default (if a request is not specifically allowed, it is denied; e.g., ACLs query the positive case and deny access by default).
- Database transactions to avoid partial updates (A bank transfer is only successful if both account balances have been updated. If only one balance could be changed, it must be rolled back).

## Keep it Simple

The software design should be kept as simple as possible to facilitate understanding and testing. Understandability and testability are important foundations of software security. See also the [KISS principle](https://en.wikipedia.org/wiki/KISS_principle).

## Complete Mediation

Access control should be enforced on every access.

## Least Common Mechanisms

Administrative interfaces should be separated from non-administrative ones as much as possible.

**Technical measures (examples):**

- Access to the API from the site (without authentication) should only occur via BFF (Backend for Frontend).

## Psychological Acceptability

User acceptance should be considered in the development of security mechanisms.

**Example:** If a user is asked too often to change their password, they might circumvent this by appending a running number to their password.

## Weakest Link

The security of software or a process is measured by its weakest link.

## Open Design / Leveraging Existing Components

[Security through obscurity](https://en.wikipedia.org/wiki/Security_through_obscurity) concepts are not allowed.

Security components should ideally be developed only once, well tested, maintained, and reused. See also [Don’t roll your own crypto.](https://www.oreilly.com/library/view/practical-security/9781680506679/f_0028.xhtml)

**Technical measures (examples):**

- Use libraries or proven technologies.
- Dextinity offers all necessary tools for authentication / authorization.
