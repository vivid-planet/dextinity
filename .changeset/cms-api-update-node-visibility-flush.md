---
"@dextinity/cms-api": major
---

Stop flushing the entity manager in `PageTreeService#updateNodeVisibility`

Flush the entity manager yourself after calling `updateNodeVisibility` directly, for instance in a custom resolver or a fixture:

```diff
  await this.pageTreeService.updateNodeVisibility(node.id, PageTreeNodeVisibility.Published);
+ await this.entityManager.flush();
```

The `updatePageTreeNodeVisibility` mutation still persists the change.
