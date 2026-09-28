import { gql, useApolloClient, useQuery } from "@apollo/client";
import { Search } from "@dextinity/admin-icons";
import { Box, CircularProgress, ClickAwayListener, InputBase, List, ListItemButton, ListItemText, Paper, Popper, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";
import { useDebounce } from "use-debounce";

import { useContentScope } from "../contentScope/Provider";
import { useDependenciesConfig } from "../dependencies/dependenciesConfig";
import type { DependencyInterface } from "../dependencies/types";
import { useUserPermissionCheck } from "../userPermissions/hooks/currentUser";
import type { GQLSearchHeaderItemQuery, GQLSearchHeaderItemQueryVariables } from "./SearchHeaderItem.generated";

const searchQuery = gql`
    query SearchHeaderItem($search: String!, $scope: JSONObject) {
        myFullTextSearch(search: $search, scope: $scope, limit: 10) {
            nodes {
                id
                entityName
                name
                secondaryInformation
            }
            totalCount
        }
    }
`;

export function SearchHeaderItem() {
    const history = useHistory();
    const apolloClient = useApolloClient();
    const contentScope = useContentScope();
    const { entityDependencyMap } = useDependenciesConfig();
    const isAllowed = useUserPermissionCheck();

    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);

    const [debouncedSearch] = useDebounce(search, 250);

    const { data, loading } = useQuery<GQLSearchHeaderItemQuery, GQLSearchHeaderItemQueryVariables>(searchQuery, {
        variables: { search: debouncedSearch, scope: contentScope.scope },
        skip: debouncedSearch.length === 0 || !isAllowed("fullTextSearch"),
    });

    if (!isAllowed("fullTextSearch")) {
        return null;
    }

    const results = data?.myFullTextSearch.nodes ?? [];

    const navigateToResult = async (result: { id: string; entityName: string }) => {
        const dependency = entityDependencyMap[result.entityName] as DependencyInterface | undefined;
        if (!dependency) {
            return;
        }
        const path = await dependency.resolvePath({ apolloClient, id: result.id });
        setOpen(false);
        history.push(contentScope.match.url + path);
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
                    <Paper elevation={4} sx={{ mt: 1, width: 360, maxHeight: 400, overflowY: "auto" }}>
                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                                <CircularProgress size={20} />
                            </Box>
                        ) : results.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                                <FormattedMessage id="dextinity.fullTextSearch.noResults" defaultMessage="No results found" />
                            </Typography>
                        ) : (
                            <List disablePadding>
                                {results.map((result) => {
                                    const isLinkable = entityDependencyMap[result.entityName] !== undefined;
                                    return (
                                        <ListItemButton
                                            key={`${result.entityName}:${result.id}`}
                                            disabled={!isLinkable}
                                            onClick={() => navigateToResult(result)}
                                        >
                                            <ListItemText primary={result.name} secondary={result.secondaryInformation} />
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        )}
                    </Paper>
                </Popper>
            </Box>
        </ClickAwayListener>
    );
}
