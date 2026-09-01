---
"@dextinity/cms-admin": patch
---

Fix the block list not marking the block that is hovered in a block preview

`HoverPreviewComponent` built the block's route from `useRouteMatch`, which does not see the path of a `SubRoute`. Below a `SaveBoundary` the route therefore missed that segment and never matched the route the preview reports, so hovering a block in the preview left its list entry unmarked, and hovering a list entry left the block in the preview unmarked. The route is now built from `useSubRoutePrefix`, the prefix the block routes in `BlockPreviewContext` already use.
