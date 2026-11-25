import { gql, useApolloClient, useQuery } from "@apollo/client";
import { Alert, Button } from "@dextinity/admin";
import { Search } from "@dextinity/admin-icons";
import { InputBase, inputBaseClasses, LinearProgress, Link, Skeleton, Stack, Typography } from "@mui/material";
import { orange } from "@mui/material/colors";
// eslint-disable-next-line no-restricted-imports -- the Dextinity Dialog always renders a title bar, the search input replaces it here
import Dialog from "@mui/material/Dialog";
import { styled } from "@mui/material/styles";
import { type KeyboardEvent, type RefObject, useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router";
import { useDebounce } from "use-debounce";

import { useContentScope } from "../contentScope/Provider";
import { useDependenciesConfig } from "../dependencies/dependenciesConfig";
import type { DependencyInterface } from "../dependencies/types";
import type { GQLFullTextSearchDialogQuery, GQLFullTextSearchDialogQueryVariables } from "./FullTextSearchDialog.generated";
import { FullTextSearchKeyHints } from "./FullTextSearchKeyHints";
import { FullTextSearchResultGroup } from "./FullTextSearchResultGroup";
import { FullTextSearchResultItem, fullTextSearchResultItemFragment } from "./FullTextSearchResultItem";
import type { GQLFullTextSearchResultItemFragment } from "./FullTextSearchResultItem.generated";
import { FullTextSearchTypeSettings } from "./FullTextSearchTypeSettings";
import { type FullTextSearchTypeTab, FullTextSearchTypeTabs } from "./FullTextSearchTypeTabs";
import { KeyboardKey } from "./KeyboardKey";
import { useFullTextSearchTypeLabel } from "./useFullTextSearchTypeLabel";
import { useFullTextSearchTypeSettings } from "./useFullTextSearchTypeSettings";

const searchQuery = gql`
    query FullTextSearchDialog($search: String!, $scope: JSONObject, $types: [String!], $limit: Int!) {
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

interface FullTextSearchDialogProps {
    open: boolean;
    onClose: () => void;
}

export function FullTextSearchDialog({ open, onClose }: FullTextSearchDialogProps) {
    const intl = useIntl();
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <SearchDialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            fullWidth
            slotProps={{
                paper: { "aria-label": intl.formatMessage({ id: "dextinity.fullTextSearch.searchLabel", defaultMessage: "Search" }) },
                // The focus trap moves the focus away from the autofocused input when its effect runs twice (React Strict Mode)
                transition: { onEntered: () => inputRef.current?.focus() },
            }}
        >
            <FullTextSearchDialogContent inputRef={inputRef} onClose={onClose} />
        </SearchDialog>
    );
}

interface FullTextSearchDialogContentProps {
    inputRef: RefObject<HTMLInputElement | null>;
    onClose: () => void;
}

function FullTextSearchDialogContent({ inputRef, onClose }: FullTextSearchDialogContentProps) {
    const intl = useIntl();
    const history = useHistory();
    const apolloClient = useApolloClient();
    const contentScope = useContentScope();
    const { entityDependencyMap } = useDependenciesConfig();
    const getTypeLabel = useFullTextSearchTypeLabel();
    const { knownTypes, disabledTypes, enabledTypes, addKnownTypes, setTypeEnabled } = useFullTextSearchTypeSettings();

    const [search, setSearch] = useState("");
    const [activeType, setActiveType] = useState<string>();
    const [showMore, setShowMore] = useState({ resultsKey: "", limit: pageSize });

    const [debouncedSearch] = useDebounce(search.trim(), 250);
    const hasSearch = search.trim().length >= minimumSearchLength;
    // A tab whose type was disabled in the settings falls back to all types
    const enabledActiveType = activeType !== undefined && !disabledTypes.includes(activeType) ? activeType : undefined;

    const getSearchedTypes = () => {
        if (enabledActiveType) {
            return [enabledActiveType];
        }

        if (disabledTypes.length > 0) {
            return enabledTypes.map(({ type }) => type);
        }

        return undefined;
    };
    const searchedTypes = getSearchedTypes();
    const resultsKey = `${debouncedSearch}:${enabledActiveType}:${disabledTypes.join(",")}`;
    // Stored together with the results it belongs to, so a new search starts with one page without an extra request for the previous search
    const limit = showMore.resultsKey === resultsKey ? showMore.limit : pageSize;

    const { data, previousData, loading, error } = useQuery<GQLFullTextSearchDialogQuery, GQLFullTextSearchDialogQueryVariables>(searchQuery, {
        variables: {
            search: debouncedSearch,
            scope: contentScope.scope,
            types: searchedTypes,
            limit,
        },
        skip: debouncedSearch.length < minimumSearchLength,
        // Search results are never reused, and ids of different entities may collide in the cache
        fetchPolicy: "no-cache",
    });

    const results = hasSearch ? (data ?? previousData)?.fullTextSearch : undefined;
    // Only types seen in earlier searches can be passed to the API, so the results may lack a type the user has never switched off
    const lacksEnabledType =
        searchedTypes !== undefined &&
        enabledActiveType === undefined &&
        results?.types.some(({ type, count }) => count > 0 && !disabledTypes.includes(type) && !searchedTypes.includes(type));
    const isSearchPending = loading || debouncedSearch !== search.trim() || Boolean(lacksEnabledType);

    useEffect(() => {
        if (data) {
            addKnownTypes(data.fullTextSearch.types);
        }
    }, [data, addKnownTypes]);

    const clearSearch = () => {
        setSearch("");
        inputRef.current?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape" && search.length > 0) {
            // Escape closes the dialog only when there's nothing to clear
            event.stopPropagation();
            clearSearch();
        }
    };

    const navigateToResult = async (result: GQLFullTextSearchResultItemFragment) => {
        const dependency = entityDependencyMap[result.entityName] as DependencyInterface | undefined;
        if (!dependency) {
            return;
        }

        try {
            const path = await dependency.resolvePath({ apolloClient, id: result.id });
            onClose();
            history.push(contentScope.match.url + path);
        } catch (error) {
            console.error(`Failed to resolve the path of ${result.entityName} ${result.id}`, error);
        }
    };

    const tabs: FullTextSearchTypeTab[] = results
        ? results.types.filter(({ type, count }) => !disabledTypes.includes(type) && (count > 0 || type === enabledActiveType))
        : enabledTypes;
    if (results && enabledActiveType && !tabs.some(({ type }) => type === enabledActiveType)) {
        // The active tab must stay visible when it has no results
        const activeKnownType = knownTypes.find(({ type }) => type === enabledActiveType);
        tabs.push({ type: enabledActiveType, entityName: activeKnownType?.entityName ?? enabledActiveType, count: 0 });
    }
    const totalCountOfEnabledTypes = results?.types.filter(({ type }) => !disabledTypes.includes(type)).reduce((sum, { count }) => sum + count, 0);

    const renderBody = () => {
        if (!hasSearch) {
            return null;
        }

        if (error) {
            return (
                <StatusContainer>
                    <Alert severity="error">
                        <FormattedMessage id="dextinity.fullTextSearch.error" defaultMessage="The search failed. Please try again." />
                    </Alert>
                </StatusContainer>
            );
        }

        // Shows the placeholder rows instead of an empty state that doesn't belong to the current search
        if (!results || (results.nodes.length === 0 && isSearchPending)) {
            return (
                <ResultsContainer aria-hidden>
                    {Array.from({ length: skeletonRowCount }, (_, index) => (
                        <SkeletonRow key={index} direction="row" spacing={3}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <Stack sx={{ flexGrow: 1 }}>
                                <Skeleton variant="text" width="40%" />
                                <Skeleton variant="text" width="70%" />
                            </Stack>
                        </SkeletonRow>
                    ))}
                </ResultsContainer>
            );
        }

        if (results.nodes.length === 0) {
            return (
                <EmptyState spacing={1} alignItems="center">
                    <Search color="disabled" fontSize="large" />
                    <Typography variant="body1">
                        <FormattedMessage
                            id="dextinity.fullTextSearch.noResultsFor"
                            defaultMessage="No results for “{search}”"
                            values={{ search: <strong key="search">{search.trim()}</strong> }}
                        />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <FormattedMessage
                            id="dextinity.fullTextSearch.noResultsHint"
                            defaultMessage="Check the spelling or try a shorter search term."
                        />
                    </Typography>
                </EmptyState>
            );
        }

        return (
            // A new list starts at the top instead of keeping the scroll position of the previous one
            <ResultsContainer key={resultsKey}>
                {groupByType(results.nodes).map((group) => (
                    <FullTextSearchResultGroup
                        key={group.type}
                        label={getTypeLabel(group.nodes[0])}
                        count={results.types.find(({ type }) => type === group.type)?.count ?? group.nodes.length}
                    >
                        {group.nodes.map((result) => (
                            <FullTextSearchResultItem
                                key={`${result.entityName}:${result.id}`}
                                result={result}
                                linkable={entityDependencyMap[result.entityName] !== undefined}
                                onClick={() => navigateToResult(result)}
                            />
                        ))}
                    </FullTextSearchResultGroup>
                ))}
                {results.nodes.length < results.totalCount && limit < maximumLimit && (
                    <ShowMoreContainer>
                        <Button
                            variant="textDark"
                            disabled={loading}
                            onClick={() => setShowMore({ resultsKey, limit: Math.min(limit + pageSize, maximumLimit) })}
                        >
                            <FormattedMessage id="dextinity.fullTextSearch.showMore" defaultMessage="Show more" />
                        </Button>
                    </ShowMoreContainer>
                )}
            </ResultsContainer>
        );
    };

    const body = renderBody();

    return (
        <Root onKeyDown={handleKeyDown}>
            <SearchRow direction="row" spacing={3} alignItems="center">
                <Search fontSize="large" />
                <SearchInput
                    inputRef={inputRef}
                    autoFocus
                    fullWidth
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={intl.formatMessage({ id: "dextinity.fullTextSearch.placeholder", defaultMessage: "Search…" })}
                    inputProps={{
                        "aria-label": intl.formatMessage({ id: "dextinity.fullTextSearch.searchLabel", defaultMessage: "Search" }),
                        maxLength: maximumSearchLength,
                    }}
                />
                {search.length > 0 ? (
                    <ClearButton component="button" type="button" variant="body1" color="text.primary" underline="always" onClick={clearSearch}>
                        <FormattedMessage id="dextinity.fullTextSearch.clear" defaultMessage="Clear" />
                    </ClearButton>
                ) : (
                    <KeyboardKey aria-hidden>
                        <FormattedMessage id="dextinity.fullTextSearch.escapeKey" defaultMessage="Esc" />
                    </KeyboardKey>
                )}
                <FullTextSearchTypeSettings knownTypes={knownTypes} disabledTypes={disabledTypes} onTypeEnabledChange={setTypeEnabled} />
            </SearchRow>
            {(tabs.length > 0 || hasSearch) && (
                <FullTextSearchTypeTabs tabs={tabs} totalCount={totalCountOfEnabledTypes} activeType={enabledActiveType} onChange={setActiveType} />
            )}
            {body && (
                <Body>
                    {isSearchPending && <LoadingBar />}
                    {body}
                </Body>
            )}
            <FullTextSearchKeyHints hasSearch={search.length > 0} />
        </Root>
    );
}

function groupByType(nodes: GQLFullTextSearchResultItemFragment[]) {
    const groups: Array<{ type: string; nodes: GQLFullTextSearchResultItemFragment[] }> = [];

    for (const node of nodes) {
        const group = groups.find(({ type }) => type === node.type);
        if (group) {
            group.nodes.push(node);
        } else {
            groups.push({ type: node.type, nodes: [node] });
        }
    }

    return groups;
}

const SearchDialog = styled(Dialog)`
    .MuiDialog-container {
        align-items: flex-start;
    }

    .MuiDialog-paper {
        max-width: ${({ theme }) => theme.spacing(144)};
        margin: ${({ theme }) => theme.spacing(4, 2)};
        width: calc(100% - ${({ theme }) => theme.spacing(4)});
        max-height: calc(100% - ${({ theme }) => theme.spacing(8)});
        border-radius: ${({ theme }) => Number(theme.shape.borderRadius) * 8}px;

        ${({ theme }) => theme.breakpoints.up("sm")} {
            margin: ${({ theme }) => theme.spacing(18, 8, 8)};
            width: calc(100% - ${({ theme }) => theme.spacing(16)});
            max-height: calc(100% - ${({ theme }) => theme.spacing(24)});
        }
    }
`;

const Root = styled("div")`
    display: flex;
    flex-direction: column;
    min-height: 0;
    max-height: ${({ theme }) => theme.spacing(144)};
    overflow: hidden;

    mark {
        color: inherit;
        background-color: ${orange[100]};
    }
`;

const SearchRow = styled(Stack)`
    flex-shrink: 0;
    padding: ${({ theme }) => theme.spacing(3, 4)};
    color: ${({ theme }) => theme.palette.text.secondary};
`;

const SearchInput = styled(InputBase)(({ theme }) => ({
    ...theme.typography.h3,
    fontWeight: theme.typography.fontWeightRegular,
    color: theme.palette.text.primary,
    border: "none",
    backgroundColor: "transparent",

    [`& .${inputBaseClasses.input}`]: {
        padding: 0,
        lineHeight: "inherit",
    },
}));

const ClearButton = styled(Link)`
    flex-shrink: 0;
` as typeof Link;

const Body = styled("div")`
    position: relative;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;
`;

const LoadingBar = styled(LinearProgress)`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    height: 2px;
`;

const ResultsContainer = styled("div")`
    flex-grow: 1;
    min-height: 0;
    overflow-y: auto;
`;

const SkeletonRow = styled(Stack)`
    padding: ${({ theme }) => theme.spacing(2, 4)};
`;

const ShowMoreContainer = styled("div")`
    display: flex;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing(0, 4, 3)};
`;

const EmptyState = styled(Stack)`
    padding: ${({ theme }) => theme.spacing(8, 4)};
    text-align: center;
`;

const StatusContainer = styled("div")`
    padding: ${({ theme }) => theme.spacing(4)};
`;
