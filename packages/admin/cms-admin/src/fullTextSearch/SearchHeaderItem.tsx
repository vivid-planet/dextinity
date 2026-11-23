import { gql, useApolloClient, useQuery } from "@apollo/client";
import { Alert, Button } from "@dextinity/admin";
import { Search } from "@dextinity/admin-icons";
import { ClickAwayListener, InputBase, LinearProgress, List, Paper, Popper, Skeleton, Stack, Typography } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router";
import { useDebounce } from "use-debounce";

import { useContentScope } from "../contentScope/Provider";
import { useDependenciesConfig } from "../dependencies/dependenciesConfig";
import type { DependencyInterface } from "../dependencies/types";
import { useUserPermissionCheck } from "../userPermissions/hooks/currentUser";
import { FullTextSearchResultItem, fullTextSearchResultItemFragment } from "./FullTextSearchResultItem";
import type { GQLFullTextSearchResultItemFragment } from "./FullTextSearchResultItem.generated";
import { FullTextSearchTypeChips } from "./FullTextSearchTypeChips";
import type { GQLSearchHeaderItemQuery, GQLSearchHeaderItemQueryVariables } from "./SearchHeaderItem.generated";

const searchQuery = gql`
    query SearchHeaderItem($search: String!, $scope: JSONObject, $types: [String!], $limit: Int!) {
        fullTextSearch(search: $search, scope: $scope, types: $types, limit: $limit) {
            totalCount
            types {
                type
                entityName
                count
            }
            nodes {
                ...FullTextSearchResultItem
            }
        }
    }
    ${fullTextSearchResultItemFragment}
`;

const minimumSearchLength = 2;
// The API rejects longer searches.
const maximumSearchLength = 200;
const pageSize = 10;
const maximumLimit = 50;
const skeletonRowCount = 4;

export function SearchHeaderItem() {
    const intl = useIntl();
    const history = useHistory();
    const apolloClient = useApolloClient();
    const contentScope = useContentScope();
    const { entityDependencyMap } = useDependenciesConfig();
    const isAllowed = useUserPermissionCheck();

    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [limit, setLimit] = useState(pageSize);
    const anchorRef = useRef<HTMLDivElement>(null);

    const [debouncedSearch] = useDebounce(search.trim(), 250);

    const { data, previousData, loading, error } = useQuery<GQLSearchHeaderItemQuery, GQLSearchHeaderItemQueryVariables>(searchQuery, {
        variables: {
            search: debouncedSearch,
            scope: contentScope.scope,
            types: selectedTypes.length > 0 ? selectedTypes : undefined,
            limit,
        },
        skip: debouncedSearch.length < minimumSearchLength || !isAllowed("fullTextSearch"),
        // Search results are never reused, and ids of different entities may collide in the cache
        fetchPolicy: "no-cache",
    });

    if (!isAllowed("fullTextSearch")) {
        return null;
    }

    const searchLabel = intl.formatMessage({ id: "dextinity.fullTextSearch.searchLabel", defaultMessage: "Search" });
    const results = (data ?? previousData)?.fullTextSearch;
    const showResultsHeader = results && !error && (results.totalCount > 0 || selectedTypes.length > 0);

    const changeSelectedTypes = (types: string[]) => {
        setSelectedTypes(types);
        setLimit(pageSize);
    };

    const navigateToResult = async (result: GQLFullTextSearchResultItemFragment) => {
        const dependency = entityDependencyMap[result.entityName] as DependencyInterface | undefined;
        if (!dependency) {
            return;
        }

        try {
            const path = await dependency.resolvePath({ apolloClient, id: result.id });
            setOpen(false);
            history.push(contentScope.match.url + path);
        } catch (error) {
            console.error(`Failed to resolve the path of ${result.entityName} ${result.id}`, error);
        }
    };

    const renderContent = () => {
        if (error) {
            return (
                <Alert severity="error">
                    <FormattedMessage id="dextinity.fullTextSearch.error" defaultMessage="The search failed. Please try again." />
                </Alert>
            );
        }

        if (results?.nodes.length === 0) {
            if (selectedTypes.length > 0) {
                return (
                    <Stack spacing={1} alignItems="flex-start">
                        <Typography variant="body2" color="text.secondary">
                            <FormattedMessage
                                id="dextinity.fullTextSearch.noResultsInSelectedTypes"
                                defaultMessage="No results in the selected types"
                            />
                        </Typography>
                        <Button variant="textDark" onClick={() => changeSelectedTypes([])}>
                            <FormattedMessage id="dextinity.fullTextSearch.showAll" defaultMessage="Show all" />
                        </Button>
                    </Stack>
                );
            }

            return (
                <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="dextinity.fullTextSearch.noResults" defaultMessage="No results found" />
                </Typography>
            );
        }

        return null;
    };

    const content = renderContent();

    return (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
            <div ref={anchorRef}>
                <HeaderSearchInput
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setLimit(pageSize);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            setOpen(false);
                        }
                    }}
                    placeholder={searchLabel}
                    inputProps={{ "aria-label": searchLabel, maxLength: maximumSearchLength }}
                    startAdornment={<Search />}
                />
                <Popper
                    open={open && search.trim().length >= minimumSearchLength}
                    anchorEl={anchorRef.current}
                    placement="bottom-end"
                    sx={{ zIndex: "tooltip" }}
                >
                    <ResultsPaper elevation={4} fixedHeight={!content}>
                        {loading && <LoadingBar />}
                        {showResultsHeader && (
                            <ResultsHeader spacing={1}>
                                <FullTextSearchTypeChips typeCounts={results.types} selectedTypes={selectedTypes} onChange={changeSelectedTypes} />
                                <Typography variant="caption" color="text.secondary">
                                    <FormattedMessage
                                        id="dextinity.fullTextSearch.resultCount"
                                        defaultMessage="{count, plural, one {# result} other {# results}}"
                                        values={{ count: results.totalCount }}
                                    />
                                </Typography>
                            </ResultsHeader>
                        )}
                        {content ? (
                            <StatusContainer>{content}</StatusContainer>
                        ) : !results ? (
                            <SkeletonList aria-hidden>
                                {Array.from({ length: skeletonRowCount }, (_, index) => (
                                    <SkeletonRow key={index} spacing={0.5}>
                                        <Skeleton variant="text" width="30%" />
                                        <Skeleton variant="text" width="60%" />
                                        <Skeleton variant="text" width="90%" />
                                    </SkeletonRow>
                                ))}
                            </SkeletonList>
                        ) : (
                            results && (
                                <>
                                    <ResultsList disablePadding>
                                        {results.nodes.map((result) => (
                                            <FullTextSearchResultItem
                                                key={`${result.entityName}:${result.id}`}
                                                result={result}
                                                linkable={entityDependencyMap[result.entityName] !== undefined}
                                                onClick={() => navigateToResult(result)}
                                            />
                                        ))}
                                    </ResultsList>
                                    <ResultsFooter direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                        <Typography variant="caption" color="text.secondary">
                                            <FormattedMessage
                                                id="dextinity.fullTextSearch.showing"
                                                defaultMessage="Showing {shown, number} of {totalCount, number}"
                                                values={{ shown: results.nodes.length, totalCount: results.totalCount }}
                                            />
                                        </Typography>
                                        {results.nodes.length < results.totalCount && limit < maximumLimit && (
                                            <Button
                                                variant="textDark"
                                                disabled={loading}
                                                onClick={() => setLimit(Math.min(limit + pageSize, maximumLimit))}
                                            >
                                                <FormattedMessage id="dextinity.fullTextSearch.showMore" defaultMessage="Show more" />
                                            </Button>
                                        )}
                                    </ResultsFooter>
                                </>
                            )
                        )}
                    </ResultsPaper>
                </Popper>
            </div>
        </ClickAwayListener>
    );
}

const HeaderSearchInput = styled(InputBase)`
    width: 240px;
    gap: ${({ theme }) => theme.spacing(1)};
    padding: ${({ theme }) => theme.spacing(1, 2)};
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    color: ${({ theme }) => theme.palette.common.white};
    background-color: ${({ theme }) => alpha(theme.palette.common.white, 0.15)};
`;

// A fixed height keeps the results from jumping while they load or when a type is selected
const ResultsPaper = styled(Paper, { shouldForwardProp: (prop) => prop !== "fixedHeight" })<{ fixedHeight: boolean }>`
    position: relative;
    display: flex;
    flex-direction: column;
    width: min(480px, calc(100vw - ${({ theme }) => theme.spacing(4)}));
    height: ${({ fixedHeight }) => (fixedHeight ? "min(560px, calc(100vh - 80px))" : "auto")};
    max-height: calc(100vh - 80px);
    margin-top: ${({ theme }) => theme.spacing(1)};
    overflow: hidden;

    ${({ theme }) => theme.breakpoints.down("md")} {
        width: 100vw;
    }
`;

const ResultsHeader = styled(Stack)`
    flex-shrink: 0;
    padding: ${({ theme }) => theme.spacing(2)};
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const LoadingBar = styled(LinearProgress)`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    height: 2px;
`;

const ResultsList = styled(List)`
    flex-grow: 1;
    overflow-y: auto;
`;

const SkeletonList = styled("div")`
    flex-grow: 1;
    overflow: hidden;
`;

const SkeletonRow = styled(Stack)`
    padding: ${({ theme }) => theme.spacing(1.5, 2)};
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const ResultsFooter = styled(Stack)`
    flex-shrink: 0;
    padding: ${({ theme }) => theme.spacing(1, 2)};
    border-top: 1px solid ${({ theme }) => theme.palette.divider};
`;

const StatusContainer = styled("div")`
    position: relative;
    min-height: 60px;
    padding: ${({ theme }) => theme.spacing(2)};
`;
