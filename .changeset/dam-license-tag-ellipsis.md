---
"@dextinity/cms-admin": patch
---

Truncate DAM license and archived tags with an ellipsis instead of clipping them on both sides

Previously, the "License expires in …" tag in the DAM data grid was clipped on the left and right when the license column was narrower than the tag.
The tags now shrink to their content, keep the icon visible and truncate the text with an ellipsis.
