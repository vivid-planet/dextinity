import { gql } from "@apollo/client";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { Alert } from "@dextinity/admin";
import { Search } from "@dextinity/admin-icons";
import { InputBase, inputBaseClasses, LinearProgress, Link, Stack } from "@mui/material";
// eslint-disable-next-line no-restricted-imports -- the Dextinity Dialog always renders a title bar, the search input replaces it here
import Dialog from "@mui/material/Dialog";
import { styled } from "@mui/material/styles";
import { type RefObject, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { useDebounce } from "use-debounce";

import { useContentScope } from "../contentScope/Provider";
import { useEntitiesConfig } from "../entities/entitiesConfig";
import type { EntityInterface } from "../entities/types";
import type { GQLFullTextSearchDialogQuery, GQLFullTextSearchDialogQueryVariables } from "./FullTextSearchDialog.generated";
import { FullTextSearchMessage } from "./FullTextSearchMessage";
import { FullTextSearchResultGroup } from "./FullTextSearchResultGroup";
import { FullTextSearchResultItem, fullTextSearchResultItemFragment } from "./FullTextSearchResultItem";
import type { GQLFullTextSearchResultItemFragment } from "./FullTextSearchResultItem.generated";
import { type FullTextSearchTypeTab, FullTextSearchTypeTabs } from "./FullTextSearchTypeTabs";
import { useFullTextSearchTypeLabel } from "./useFullTextSearchTypeLabel";
import { useFullTextSearchTypes } from "./useFullTextSearchTypes";

const searchQuery = gql`
    query FullTextSearchDialog($search: String!, $scope: JSONObject, $types: [String!]) {
        myFullTextSearch(search: $search, scope: $scope, types: $types, limit: 20) {
            types {
                type
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
// The API rejects longer searches
const maximumSearchLength = 200;

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
    const navigate = useNavigate();
    const apolloClient = useApolloClient();
    const contentScope = useContentScope();
    const entities = useEntitiesConfig();
    const getTypeLabel = useFullTextSearchTypeLabel();
    const { types = [], error: typesError } = useFullTextSearchTypes();

    const [search, setSearch] = useState("");
    const [activeType, setActiveType] = useState<string>();

    const [debouncedSearch] = useDebounce(search.trim(), 250);
    const hasSearch = search.trim().length >= minimumSearchLength;

    const { data, previousData, loading, error } = useQuery<GQLFullTextSearchDialogQuery, GQLFullTextSearchDialogQueryVariables>(searchQuery, {
        variables: { search: debouncedSearch, scope: contentScope.scope, types: activeType ? [activeType] : undefined },
        skip: debouncedSearch.length < minimumSearchLength,
        // Ids are only unique per entity, so results of different entities would be merged in the cache
        fetchPolicy: "no-cache",
    });

    const results = hasSearch ? (data ?? previousData)?.myFullTextSearch : undefined;
    const isSearchPending = loading || debouncedSearch !== search.trim();

    const clearSearch = () => {
        setSearch("");
        inputRef.current?.focus();
    };

    const navigateToResult = async (result: GQLFullTextSearchResultItemFragment) => {
        const entity = entities[result.entityName] as EntityInterface | undefined;
        if (!entity) {
            return;
        }

        try {
            const path = await entity.resolvePath({ apolloClient, id: result.id });
            onClose();
            navigate(contentScope.match.url + path);
        } catch (error) {
            console.error(`Failed to resolve the path of ${result.entityName} ${result.id}`, error);
        }
    };

    const tabs: FullTextSearchTypeTab[] = types.map(({ type, entityName }) => ({
        type,
        entityName,
        count: results ? (results.types.find((typeCount) => typeCount.type === type)?.count ?? 0) : undefined,
    }));
    const totalCount = results ? results.types.reduce((sum, { count }) => sum + count, 0) : undefined;

    const renderBody = () => {
        if (!hasSearch) {
            return (
                <FullTextSearchMessage
                    title={<FormattedMessage id="dextinity.fullTextSearch.startTyping" defaultMessage="Start typing to search" />}
                    hint={
                        <FormattedMessage
                            id="dextinity.fullTextSearch.prefixMatchHint"
                            defaultMessage="The last word also matches the beginning of a word."
                        />
                    }
                />
            );
        }

        if (error || typesError) {
            return (
                <StatusContainer>
                    <Alert severity="error">
                        <FormattedMessage id="dextinity.fullTextSearch.error" defaultMessage="The search failed. Please try again." />
                    </Alert>
                </StatusContainer>
            );
        }

        if (!results) {
            return null;
        }

        if (results.nodes.length === 0) {
            return (
                <FullTextSearchMessage
                    title={
                        <FormattedMessage
                            id="dextinity.fullTextSearch.noResultsFor"
                            defaultMessage="No results for “{search}”"
                            values={{ search: <strong key="search">{search.trim()}</strong> }}
                        />
                    }
                    hint={
                        <FormattedMessage
                            id="dextinity.fullTextSearch.noResultsHint"
                            defaultMessage="Check the spelling or try a shorter search term."
                        />
                    }
                />
            );
        }

        return (
            <ResultsContainer>
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
                                linkable={entities[result.entityName] !== undefined}
                                onClick={() => navigateToResult(result)}
                            />
                        ))}
                    </FullTextSearchResultGroup>
                ))}
            </ResultsContainer>
        );
    };

    return (
        <Root>
            <SearchRow direction="row" spacing={3}>
                <Search fontSize="large" />
                <SearchInput
                    inputRef={inputRef}
                    autoFocus
                    fullWidth
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={intl.formatMessage({ id: "dextinity.fullTextSearch.placeholder", defaultMessage: "Search…" })}
                    autoComplete="off"
                    inputProps={{
                        "aria-label": intl.formatMessage({ id: "dextinity.fullTextSearch.searchLabel", defaultMessage: "Search" }),
                        maxLength: maximumSearchLength,
                    }}
                />
                {search.length > 0 && (
                    <ClearButton component="button" type="button" variant="body1" color="text.primary" underline="always" onClick={clearSearch}>
                        <FormattedMessage id="dextinity.fullTextSearch.clear" defaultMessage="Clear" />
                    </ClearButton>
                )}
            </SearchRow>
            <FullTextSearchTypeTabs tabs={tabs} totalCount={totalCount} activeType={activeType} onChange={setActiveType} />
            <Body>
                {hasSearch && isSearchPending && <LoadingBar />}
                {renderBody()}
            </Body>
        </Root>
    );
}

// Groups keep the order of their best result, so the best matches stay on top
function groupByType(nodes: GQLFullTextSearchResultItemFragment[]) {
    const groups = new Map<string, GQLFullTextSearchResultItemFragment[]>();
    for (const node of nodes) {
        groups.set(node.type, [...(groups.get(node.type) ?? []), node]);
    }
    return Array.from(groups, ([type, nodes]) => ({ type, nodes }));
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
`;

const SearchRow = styled(Stack)`
    flex-shrink: 0;
    align-items: center;
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

// The empty state and the no results state have the same height, so the dialog doesn't jump between them
const Body = styled("div")`
    position: relative;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: ${({ theme }) => theme.spacing(56)};
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

const StatusContainer = styled("div")`
    padding: ${({ theme }) => theme.spacing(4)};
`;
