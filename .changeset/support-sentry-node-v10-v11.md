---
"@dextinity/cms-api": patch
---

Support `@sentry/node` v10 and v11

The peer dependency now allows `^9.0.0 || ^10.0.0 || ^11.0.0`.

**Upgrading to v11**

Review the [Sentry v10 to v11 migration guide](https://github.com/getsentry/sentry-javascript/blob/master/MIGRATION.md) before upgrading. Changes that affect projects using `SentryModule`:

- `sendDefaultPii` was replaced by `dataCollection`, which collects more data by default (user info, cookies, request/response bodies and headers, database queries). Pass `dataCollection` to `SentryModule.forRootAsync()` to restrict it.
- `skipOpenTelemetrySetup` was replaced by `enableOpenTelemetrySetup` with inverted meaning.
- `Sentry.setupExpressErrorHandler(app)` is deprecated, but keep calling it. Sentry's automatic Express error capturing only works when Sentry is initialized before Express is loaded, and `SentryModule` initializes it afterwards.
- v11 supports self-hosted Sentry 26.4.2 or later.
