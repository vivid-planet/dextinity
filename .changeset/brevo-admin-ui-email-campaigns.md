---
"@dextinity/brevo-admin": major
---

Rebuild the email campaigns with `@dextinity/ui`

The list filters by status, and duplicates and deletes campaigns from a row menu. The editor shows the live preview next to the tabs Content, Settings, and Sending, which holds the target groups, the schedule, sending now, and test emails. It saves with Ctrl/Cmd+S and asks before leaving with unsaved changes. Sent campaigns open in a read-only view, and their statistics show the delivery and engagement as shares of the sent emails.

**Breaking changes**

- The page no longer uses a `Stack`. A new campaign is created at `<path>/add` instead of `<path>/add/add`; the edit, view, and statistics URLs (`<path>/<id>/edit`, `…/view`, `…/statistics`) stay.
- Copying a campaign to the clipboard and pasting it is replaced by "Duplicate".
