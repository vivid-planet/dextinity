import { gql } from "@apollo/client";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { Search } from "@dextinity/admin-icons";
import { Box, CircularProgress, ClickAwayListener, InputBase, List, Paper, Popper, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router";
import { useDebounce } from "use-debounce";

import { useContentScope } from "../contentScope/Provider";
import { useEntitiesConfig } from "../entities/entitiesConfig";
import type { EntityInterface } from "../entities/types";
import { useUserPermissionCheck } from "../userPermissions/hooks/currentUser";
import { FullTextSearchResultGroup } from "./FullTextSearchResultGroup";
import { FullTextSearchResultItem, fullTextSearchResultItemFragment } from "./FullTextSearchResultItem";
import type { GQLSearchHeaderItemQuery, GQLSearchHeaderItemQueryVariables } from "./SearchHeaderItem.generated";
import { useFullTextSearchTypeLabel } from "./useFullTextSearchTypeLabel";

const searchQuery = gql`
    query SearchHeaderItem($search: String!, $scope: JSONObject) {
        myFullTextSearch(search: $search, scope: $scope, limit: 20) {
            nodes {
                ...FullTextSearchResultItem
            }
            types {
                type
                count
            }
        }
    }
    ${fullTextSearchResultItemFragment}
`;

export function SearchHeaderItem() {
    const navigate = useNavigate();
    const apolloClient = useApolloClient();
    const contentScope = useContentScope();
    const entities = useEntitiesConfig();
    const isAllowed = useUserPermissionCheck();
    const getTypeLabel = useFullTextSearchTypeLabel();

    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);

    const [debouncedSearch] = useDebounce(search, 250);

    const { data, loading, error } = useQuery<GQLSearchHeaderItemQuery, GQLSearchHeaderItemQueryVariables>(searchQuery, {
        variables: { search: debouncedSearch, scope: contentScope.scope },
        skip: debouncedSearch.length === 0 || !isAllowed("fullTextSearch"),
        // Ids are only unique per entity, so results of different entities would be merged in the cache
        fetchPolicy: "no-cache",
    });

    if (!isAllowed("fullTextSearch")) {
        return null;
    }

    const results = data?.myFullTextSearch.nodes ?? [];
    const resultGroups = groupByType(results);
    const typeCounts = data?.myFullTextSearch.types ?? [];

    const navigateToResult = async (result: { id: string; entityName: string }) => {
        const entity = entities[result.entityName] as EntityInterface | undefined;
        if (!entity) {
            return;
        }
        const path = await entity.resolvePath({ apolloClient, id: result.id });
        setOpen(false);
        navigate(contentScope.match.url + path);
    };

    return (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
            <Box ref={anchorRef} sx={{ position: "relative" }}>
                <InputBase
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder=""
                    startAdornment={<Search sx={{ mr: 1 }} />}
                    sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        borderRadius: 1,
                        color: "white",
                        px: 2,
                        py: 0.5,
                        width: 240,
                    }}
                />
                <Popper open={open && search.length > 0} anchorEl={anchorRef.current} placement="bottom-end" sx={{ zIndex: "tooltip" }}>
                    <Paper elevation={4} sx={{ mt: 1, width: 560, maxHeight: 560, overflowY: "auto" }}>
                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                                <CircularProgress size={20} />
                            </Box>
                        ) : error ? (
                            <Typography variant="body2" color="error" sx={{ p: 2 }}>
                                <FormattedMessage id="dextinity.fullTextSearch.error" defaultMessage="The search failed. Please try again." />
                            </Typography>
                        ) : results.length === 0 ? (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "text.secondary",
                                    p: 2,
                                }}
                            >
                                <FormattedMessage id="dextinity.fullTextSearch.noResults" defaultMessage="No results found" />
                            </Typography>
                        ) : (
                            resultGroups.map(({ type, results }) => (
                                <FullTextSearchResultGroup
                                    key={type}
                                    label={getTypeLabel({ type, entityName: results[0].entityName })}
                                    count={typeCounts.find((typeCount) => typeCount.type === type)?.count ?? results.length}
                                >
                                    <List disablePadding>
                                        {results.map((result) => (
                                            <FullTextSearchResultItem
                                                key={`${result.entityName}:${result.id}`}
                                                result={result}
                                                linkable={entities[result.entityName] !== undefined}
                                                onClick={() => navigateToResult(result)}
                                            />
                                        ))}
                                    </List>
                                </FullTextSearchResultGroup>
                            ))
                        )}
                    </Paper>
                </Popper>
            </Box>
        </ClickAwayListener>
    );
}

type SearchResult = GQLSearchHeaderItemQuery["myFullTextSearch"]["nodes"][number];

// Groups keep the order of their best result, so the best matches stay on top
function groupByType(results: SearchResult[]): Array<{ type: string; results: SearchResult[] }> {
    const groups = new Map<string, SearchResult[]>();
    for (const result of results) {
        groups.set(result.type, [...(groups.get(result.type) ?? []), result]);
    }
    return Array.from(groups, ([type, results]) => ({ type, results }));
}
