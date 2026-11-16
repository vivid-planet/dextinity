---
"@dextinity/brevo-admin": major
---

Upgrade React Router to v8

`@dextinity/brevo-admin` requires `react-router` v8 and React 19.2.7 or later. `react-router-dom` is no longer needed.

Register the Brevo pages with the new master menu route shape of `@dextinity/cms-admin`:

```diff
- route: { path: "/newsletter/email-campaigns", component: CampaignsPage },
+ route: { path: "/newsletter/email-campaigns", element: <CampaignsPage /> },
```

See the [migration guide](https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11) for all required changes.
