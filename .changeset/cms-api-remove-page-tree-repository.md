---
"@dextinity/cms-api": major
---

Remove `PAGE_TREE_REPOSITORY` and the repository fields of the page tree services

The page tree now uses the `EntityManager` instead of entity repositories.
This removes the `PAGE_TREE_REPOSITORY` injection token and the public `pageTreeRepository` and `attachedDocumentsRepository` fields of `PageTreeService`, `PageTreeReadApiService` and `AttachedDocumentLoaderService`.
Use the `EntityManager` instead:

```ts
// Before
@Inject(PAGE_TREE_REPOSITORY) private readonly pageTreeRepository: EntityRepository<PageTreeNodeInterface>

const node = await this.pageTreeRepository.findOne({ id });

// After
private readonly entityManager: EntityManager

const node = await this.entityManager.findOne(PageTreeNode, { id });
```
