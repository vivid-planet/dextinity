---
"@dextinity/cms-api": major
---

Require `@opentelemetry/api` as a peer dependency

`@dextinity/cms-api` now uses the same copy of `@opentelemetry/api` as your API's OpenTelemetry SDK. Previously, it could resolve its own copy, and if that copy was a newer minor version than the one the SDK registered, the API ignored the registered tracer and the spans of `@dextinity/cms-api` were dropped.

Add `@opentelemetry/api` to your API's dependencies if it isn't there yet.
