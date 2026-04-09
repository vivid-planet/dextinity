# Entity Toolbar (with Query)

Generate a dedicated toolbar component per entity that fetches its own data (title, status, etc.) and handles loading/error states inline. Each entity gets its own self-contained toolbar in its own file.

## Files

Each entity toolbar consists of two files:

### `{Entity}Toolbar.gql.ts`

```tsx
import { gql } from "@apollo/client";

export const productToolbarQuery = gql`
    query ProductToolbar($id: ID!) {
        product(id: $id) {
            id
            name
            slug
            status
        }
    }
`;
```

Adjust the query name, operation name, and fields to the entity. Include fields needed for the toolbar display (e.g. `name` for title, `status` for chip, a secondary identifier like `slug` or `code` for support text).

### `{Entity}Toolbar.tsx`

```tsx
import { useQuery } from "@apollo/client";
import {
    FillSpace,
    Loading,
    LocalErrorScopeApolloContext,
    SaveBoundarySaveButton,
    StackPageTitle,
    StackToolbar,
    ToolbarActions,
    ToolbarAutomaticTitleItem,
    ToolbarBackButton,
    ToolbarItem,
    Tooltip,
} from "@comet/admin";
import { Error } from "@comet/admin-icons";
import { ContentScopeIndicator } from "@comet/cms-admin";
import { Box, Typography, useTheme } from "@mui/material";
import { type FunctionComponent, type ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { productToolbarQuery } from "./ProductToolbar.gql";
import { type GQLProductToolbarQuery, type GQLProductToolbarQueryVariables } from "./ProductToolbar.gql.generated";

interface ProductToolbarProps {
    id?: string;
    additionalActions?: ReactNode;
}

export const ProductToolbar: FunctionComponent<ProductToolbarProps> = ({ id, additionalActions }) => {
    const theme = useTheme();

    const { data, loading, error } = useQuery<GQLProductToolbarQuery, GQLProductToolbarQueryVariables>(
        productToolbarQuery,
        id != null
            ? {
                  variables: { id },
                  context: LocalErrorScopeApolloContext,
              }
            : { skip: true },
    );

    if (loading) {
        return (
            <StackToolbar scopeIndicator={<ContentScopeIndicator />}>
                <Box sx={{ display: "flex", width: "100%", justifyContent: "center", alignItems: "center" }}>
                    <Loading />
                </Box>
            </StackToolbar>
        );
    }

    const title = data?.product.name;
    const supportText = data?.product.slug;

    return (
        <StackPageTitle title={title}>
            <StackToolbar scopeIndicator={<ContentScopeIndicator />}>
                <ToolbarBackButton />

                {title ? (
                    <ToolbarItem>
                        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <Typography variant="h5">{title}</Typography>
                            {supportText && (
                                <Typography color={theme.palette.grey["400"]} variant="body2">
                                    {supportText}
                                </Typography>
                            )}
                        </Box>
                    </ToolbarItem>
                ) : (
                    <ToolbarAutomaticTitleItem />
                )}

                {data?.product.status && (
                    <ToolbarItem>
                        <ProductStatusChip status={data.product.status} />
                    </ToolbarItem>
                )}

                {error != null && (
                    <ToolbarItem>
                        <Tooltip
                            title={
                                <>
                                    <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
                                        <FormattedMessage id="product.toolbar.error.title" defaultMessage="Data could not be loaded." />
                                    </Typography>
                                    <Typography variant="body2" sx={{ textAlign: "center" }}>
                                        <FormattedMessage
                                            id="product.toolbar.error.description"
                                            defaultMessage="There was a problem loading the requested data."
                                        />
                                    </Typography>
                                </>
                            }
                        >
                            <Box sx={{ display: "flex" }}>
                                <Error htmlColor={theme.palette.error.main} />
                            </Box>
                        </Tooltip>
                    </ToolbarItem>
                )}

                <FillSpace />

                <ToolbarActions>
                    {additionalActions}
                    <SaveBoundarySaveButton />
                </ToolbarActions>
            </StackToolbar>
        </StackPageTitle>
    );
};
```

## Title and Support Text

- When `title` is available (from query data), render it with `<Typography variant="h5">` inside a `ToolbarItem`.
- **Support text** should show a meaningful secondary identifier below the title — e.g. a `slug`, `code`, `email`, `sku`, or other human-readable field. Do NOT use the entity `id` (UUID) as support text — it provides no value to the user. If the entity has no meaningful secondary identifier, omit the support text block entirely (remove the `supportText` variable and the `<Typography variant="body2">` element).
- When `title` is not available (e.g. on the "add" page where `id` is undefined and query is skipped), fall back to `<ToolbarAutomaticTitleItem />` which uses the breadcrumb title from `StackPage`.

## Status Chip

- When the entity has a status or type enum, display a chip next to the title using the entity's chip component (e.g. `<ProductStatusChip />`).
- Render the chip in a separate `<ToolbarItem>` after the title block.
- Only render the chip when data is available (`data?.entity.status && ...`).
- If no chip component exists yet, use the `comet-admin-enum` skill to create one first.

## Adaptation Rules

- Replace `product` / `Product` with the actual entity name throughout (query, types, component name, message IDs).
- Use `<ContentScopeIndicator global />` for global/unscoped entities, `<ContentScopeIndicator />` for scoped entities.
- Add entity-specific fields to the query: a meaningful secondary identifier for support text (e.g. `slug`, `code`, `email`) and an enum field for the status chip (e.g. `status`, `type`).
- The `additionalActions` prop allows pages to pass extra buttons (e.g. "Save as Draft") alongside `SaveBoundarySaveButton`.
- For the "add" page (no `id`), the query is skipped and the toolbar renders with `ToolbarAutomaticTitleItem` (no title, no support text).
- Error messages should use entity-specific intl IDs but can share the same default text pattern.
- Do NOT extract a shared Toolbar wrapper — each entity toolbar is self-contained.

## Usage in Pages

```tsx
<StackPage name="edit">
    {(id) => (
        <SaveBoundary>
            <ProductToolbar id={id} />
            <StackMainContent>
                <ProductForm id={id} />
            </StackMainContent>
        </SaveBoundary>
    )}
</StackPage>
<StackPage name="add">
    <SaveBoundary>
        <ProductToolbar />
        <StackMainContent>
            <ProductForm />
        </StackMainContent>
    </SaveBoundary>
</StackPage>
```
