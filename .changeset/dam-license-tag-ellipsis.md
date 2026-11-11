---
"@dextinity/cms-admin": patch
---

Use `Chip` for the DAM license and archived tags to prevent clipping them on both sides

Previously, the "License expires in …" tag in the DAM data grid was clipped on the left and right when the license column was narrower than the tag.
The tags now keep the icon visible and truncate the text with an ellipsis. They also match the look of the other chips in the admin.
