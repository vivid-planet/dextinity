---
"@dextinity/cms-admin": patch
---

Prevent an endless autosave loop in `BlocksFinalForm`

`BlocksFinalForm` scheduled an autosave on every render while the form was dirty, and each autosave called the `onSubmit` of the render that scheduled it.
In large blocks, these outdated autosaves wrote old block states, which made other forms dirty again, and the admin stopped responding.
Now each form has at most one pending autosave, which calls the latest `onSubmit` and only runs when the form values changed since the last autosave.
