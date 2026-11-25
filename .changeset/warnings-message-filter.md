---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
---

Make warnings searchable and filterable by their translated message

The search in the warnings grid now also finds warnings by the message as it is displayed, for instance "File license expires soon", and the message column offers the translated messages as filter options.
Previously, warnings could only be found by message when the search term was part of the message's translation key, for instance "soon" for `fileLicenseSoonToExpire`.

The `warnings` query has a new optional `messageLabels` argument for this: the translated label of each message key, which the search matches in addition to the stored keys.
