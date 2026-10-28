---
"@dextinity/eslint-config": major
---

Remove the deprecated `@calm/eslint-plugin-react-intl` plugin

The `@calm/eslint-plugin-react-intl` package is deprecated. Its `missing-formatted-message` rule enforced that user-facing strings are masked with `FormattedMessage`. This is now sufficiently covered by the `react/jsx-no-literals` rule, which is already part of the config.
