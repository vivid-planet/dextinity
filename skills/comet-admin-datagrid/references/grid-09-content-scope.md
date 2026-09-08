# Grid Feature: Content Scope

Used when the entity's GraphQL query requires a `scope` argument (e.g. `scope: <EntityName>ScopeInput!`). Most Comet DXP entities are scoped.

## Template

```tsx
import { useContentScope } from "@comet/cms-admin";

export function EntitiesGrid() {
    const { scope } = useContentScope();
    // ... standard setup

    const { filter: gqlFilter, search: gqlSearch } = muiGridFilterToGql(columns, dataGridProps.filterModel);
    const { data, loading, error } = useQuery(entitiesQuery, {
        variables: {
            scope, // pass content scope to query
            filter: gqlFilter,
            search: gqlSearch,
            sort: muiGridSortToGql(dataGridProps.sortModel, columns) ?? [],
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
        },
    });
    // ...
}
```

## GQL

```graphql
query EntitiesGrid($scope: EntityScopeInput!, $offset: Int!, $limit: Int!, $sort: [EntitySort!]!, $search: String, $filter: EntityFilter) {
    entities(scope: $scope, offset: $offset, limit: $limit, sort: $sort, search: $search, filter: $filter) {
        nodes {
            ...EntitiesGridItem
        }
        totalCount
    }
}
```

## Rules

- Check the GraphQL schema for a `scope` argument on the entity's list query — if present, the grid must pass it
- Import `useContentScope` from `@comet/cms-admin`
- Pass `scope` to the query variables alongside filter/search/sort/pagination
- Also pass `scope` to `useDataGridExcelExport` variables if excel export is used
- The scope variable type (e.g. `<EntityName>ScopeInput!`) must match the schema exactly
