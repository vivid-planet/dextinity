---
"@dextinity/api-generator": major
"@dextinity/brevo-api": major
"@dextinity/cms-api": major
---

Expose only the package root through an `exports` map

Deep imports such as `@dextinity/cms-api/lib/...` no longer resolve. Import from the package root instead.
