import { gql, useApolloClient, useQuery } from "@apollo/client";
import { Alert, Button } from "@dextinity/admin";
import { Search } from "@dextinity/admin-icons";
import { ClickAwayListener, InputBase, LinearProgress, Paper, Popper, Skeleton, Stack, Typography } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { unstable_useId as useId } from "@mui/material/utils";
import { type FocusEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
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

interface ActiveResult {
    key: string;
    scrollIntoView: boolean;
}

type ArrowStep = 1 | -1;

function getResultKey(result: GQLFullTextSearchResultItemFragment) {
    return `${result.entityName}:${result.id}`;
}

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
    const [activeResult, setActiveResult] = useState<ActiveResult | null>(null);
    // An arrow key pressed before the first results arrive activates a result once they're loaded
    const [pendingArrowStep, setPendingArrowStep] = useState<ArrowStep | null>(null);
    const anchorRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listboxId = useId();

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

    const loadedResults = data?.fullTextSearch.nodes;
    useEffect(() => {
        if (pendingArrowStep === null || !loadedResults) {
            return;
        }
        if (loadedResults.length > 0) {
            const result = pendingArrowStep === 1 ? loadedResults[0] : loadedResults[loadedResults.length - 1];
            setActiveResult({ key: getResultKey(result), scrollIntoView: true });
        }
        setPendingArrowStep(null);
    }, [pendingArrowStep, loadedResults]);

    if (!isAllowed("fullTextSearch")) {
        return null;
    }

    const searchLabel = intl.formatMessage({ id: "dextinity.fullTextSearch.searchLabel", defaultMessage: "Search" });
    const resultsLabel = intl.formatMessage({ id: "dextinity.fullTextSearch.resultsLabel", defaultMessage: "Search results" });
    const results = (data ?? previousData)?.fullTextSearch;
    const showResultsHeader = results && !error && (results.totalCount > 0 || selectedTypes.length > 0);

    const closeResults = () => {
        setOpen(false);
        setActiveResult(null);
        setPendingArrowStep(null);
    };

    const changeSelectedTypes = (types: string[]) => {
        setSelectedTypes(types);
        setLimit(pageSize);
        setActiveResult(null);
    };

    const navigateToResult = async (result: GQLFullTextSearchResultItemFragment) => {
        const dependency = entityDependencyMap[result.entityName] as DependencyInterface | undefined;
        if (!dependency) {
            return;
        }

        try {
            const path = await dependency.resolvePath({ apolloClient, id: result.id });
            closeResults();
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
    const popperOpen = open && search.trim().length >= minimumSearchLength;
    const options = !content && results ? results.nodes : [];
    const listboxOpen = popperOpen && options.length > 0;
    const activeIndex = activeResult ? options.findIndex((result) => getResultKey(result) === activeResult.key) : -1;
    const getOptionId = (index: number) => `${listboxId}-option-${index}`;

    const moveActiveResult = (step: ArrowStep) => {
        let nextIndex: number;
        if (listboxOpen && activeIndex !== -1) {
            nextIndex = (activeIndex + step + options.length) % options.length;
        } else {
            nextIndex = step === 1 ? 0 : options.length - 1;
        }
        setOpen(true);
        setActiveResult({ key: getResultKey(options[nextIndex]), scrollIntoView: true });
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            if (search.trim().length < minimumSearchLength) {
                return;
            }
            event.preventDefault();
            const step = event.key === "ArrowDown" ? 1 : -1;
            if (options.length > 0) {
                moveActiveResult(step);
            } else if (!results && !error) {
                setOpen(true);
                setPendingArrowStep(step);
            }
        } else if (event.key === "Enter") {
            if (!listboxOpen || activeIndex === -1) {
                return;
            }
            event.preventDefault();
            navigateToResult(options[activeIndex]);
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape" && popperOpen) {
            // Focusing the input opens the results, so it must happen before closing them
            inputRef.current?.focus();
            closeResults();
        }
    };

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
        // relatedTarget is null when clicking a non-focusable part of the results, which must keep them open
        if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) {
            closeResults();
        }
    };

    return (
        <ClickAwayListener onClickAway={closeResults}>
            <div ref={anchorRef} onKeyDown={handleKeyDown} onBlur={handleBlur}>
                <HeaderSearchInput
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setLimit(pageSize);
                        setActiveResult(null);
                        setPendingArrowStep(null);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onClick={() => setOpen(true)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={searchLabel}
                    inputRef={inputRef}
                    autoComplete="off"
                    inputProps={{
                        "aria-label": searchLabel,
                        maxLength: maximumSearchLength,
                        role: "combobox",
                        "aria-autocomplete": "list",
                        "aria-expanded": listboxOpen,
                        "aria-controls": listboxId,
                        "aria-activedescendant": listboxOpen && activeIndex !== -1 ? getOptionId(activeIndex) : undefined,
                    }}
                    startAdornment={<Search />}
                />
                <VisuallyHidden role="status">
                    {popperOpen && results && !error && (
                        <FormattedMessage
                            id="dextinity.fullTextSearch.resultCount"
                            defaultMessage="{count, plural, one {# result} other {# results}}"
                            values={{ count: results.totalCount }}
                        />
                    )}
                </VisuallyHidden>
                <Popper
                    open={popperOpen}
                    anchorEl={anchorRef.current}
                    placement="bottom-end"
                    // Rendered next to the input so that Tab moves from the input to the type chips
                    disablePortal
                    role="presentation"
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
                                    <ResultsList
                                        id={listboxId}
                                        role="listbox"
                                        aria-label={resultsLabel}
                                        // Chrome makes a scroll container without tabbable children a Tab stop, which would take the focus out of the input
                                        tabIndex={-1}
                                    >
                                        {results.nodes.map((result, index) => {
                                            const resultKey = getResultKey(result);
                                            return (
                                                <FullTextSearchResultItem
                                                    key={resultKey}
                                                    id={getOptionId(index)}
                                                    result={result}
                                                    linkable={entityDependencyMap[result.entityName] !== undefined}
                                                    active={index === activeIndex}
                                                    scrollIntoViewWhenActive={activeResult?.scrollIntoView}
                                                    onClick={() => navigateToResult(result)}
                                                    onHover={() => {
                                                        if (activeResult?.key !== resultKey) {
                                                            setActiveResult({ key: resultKey, scrollIntoView: false });
                                                        }
                                                    }}
                                                />
                                            );
                                        })}
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
                                                onClick={() => {
                                                    // Disabling the button while loading, or removing it after the last page, would drop the focus to the body
                                                    inputRef.current?.focus();
                                                    setLimit(Math.min(limit + pageSize, maximumLimit));
                                                }}
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

const LoadingBar = styled(LinearProgress)`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    height: 2px;
`;

const SkeletonList = styled("div")`
    flex-grow: 1;
    overflow: hidden;
`;

const SkeletonRow = styled(Stack)`
    padding: ${({ theme }) => theme.spacing(1.5, 2)};
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const ResultsHeader = styled(Stack)`
    flex-shrink: 0;
    padding: ${({ theme }) => theme.spacing(2)};
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const ResultsList = styled("div")`
    flex-grow: 1;
    overflow-y: auto;
`;

const ResultsFooter = styled(Stack)`
    flex-shrink: 0;
    padding: ${({ theme }) => theme.spacing(1, 2)};
    border-top: 1px solid ${({ theme }) => theme.palette.divider};
`;

const VisuallyHidden = styled("div")`
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
`;

const StatusContainer = styled("div")`
    position: relative;
    min-height: 60px;
    padding: ${({ theme }) => theme.spacing(2)};
`;
