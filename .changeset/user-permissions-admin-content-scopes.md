---
"@dextinity/cms-api": minor
"@dextinity/cms-admin": minor
---

Rework the content scopes management in the user permissions panel

The user permissions panel now renders a consistent set of content scope columns for every user based on the content scope dimensions declared in the API (`userPermissionsAvailableContentScopeDimensions`). A dimension whose value is the `"*"` wildcard is shown as "All".

- Content scopes are assigned through an "Add scope" dialog that builds a scope from one dropdown per enumerable dimension, cascading so that only existing combinations can be selected. Dimensions that are not part of `availableContentScopes` are entered as a free text value (`*` grants all values).
- The assigned content scopes and the permission-specific content scopes (override dialog) use the same paginated grid and add dialog, and show manually assigned scopes first.
- Removing a content scope asks for confirmation, consistent with removing a permission.
- The assignment type is shown in a consistent way across the permissions and content scopes grids.
