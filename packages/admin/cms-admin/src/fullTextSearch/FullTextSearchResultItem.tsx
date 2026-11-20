import { gql } from "@apollo/client";
import { Tooltip } from "@dextinity/admin";
import { ListItemButton, Stack, Typography } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { type MouseEvent, useEffect, useRef } from "react";
import { FormattedMessage } from "react-intl";

import { MarkedMatches } from "../common/MarkedMatches";
import type { GQLFullTextSearchResultItemFragment } from "./FullTextSearchResultItem.generated";
import { toTextMatches } from "./toTextMatches";
import { useFullTextSearchTypeLabel } from "./useFullTextSearchTypeLabel";

export const fullTextSearchResultItemFragment = gql`
    fragment FullTextSearchResultItem on FullTextSearchResult {
        id
        entityName
        type
        name
        secondaryInformation
        title {
            text
            highlights {
                start
                end
            }
        }
        snippet {
            text
            truncatedStart
            truncatedEnd
            highlights {
                start
                end
            }
        }
    }
`;

interface FullTextSearchResultItemProps {
    id: string;
    result: GQLFullTextSearchResultItemFragment;
    linkable: boolean;
    active: boolean;
    scrollIntoViewWhenActive?: boolean;
    onClick: () => void;
    onHover: () => void;
}

export function FullTextSearchResultItem({
    id,
    result,
    linkable,
    active,
    scrollIntoViewWhenActive,
    onClick,
    onHover,
}: FullTextSearchResultItemProps) {
    const getTypeLabel = useFullTextSearchTypeLabel();
    const itemRef = useRef<HTMLDivElement>(null);
    const { title, snippet } = result;

    useEffect(() => {
        if (active && scrollIntoViewWhenActive) {
            itemRef.current?.scrollIntoView({ block: "nearest" });
        }
    }, [active, scrollIntoViewWhenActive]);

    const item = (
        <ResultOption
            ref={itemRef}
            id={id}
            role="option"
            aria-selected={active}
            aria-disabled={!linkable}
            selected={active}
            tabIndex={-1}
            alignItems="flex-start"
            onMouseDown={keepFocusInSearchInput}
            onMouseMove={onHover}
            onClick={linkable ? onClick : undefined}
        >
            <Stack spacing={0.5} sx={{ minWidth: 0, flexGrow: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                    <TypeLabel variant="overline">{getTypeLabel(result)}</TypeLabel>
                    {result.secondaryInformation && (
                        <SecondaryInformation variant="caption" color="text.secondary" noWrap>
                            {result.secondaryInformation}
                        </SecondaryInformation>
                    )}
                </Stack>
                <Title variant="body1">
                    <MarkedMatches text={title.text} matches={toTextMatches(title.highlights)} />
                </Title>
                {snippet && (
                    <SnippetText variant="body2" color="text.secondary">
                        {snippet.truncatedStart && "… "}
                        <MarkedMatches text={snippet.text} matches={toTextMatches(snippet.highlights)} />
                        {snippet.truncatedEnd && " …"}
                    </SnippetText>
                )}
            </Stack>
        </ResultOption>
    );

    if (linkable) {
        return item;
    }

    // Focus stays in the search input, so the tooltip is opened for the active result instead of on focus
    return (
        <Tooltip
            open={active}
            title={<FormattedMessage id="dextinity.fullTextSearch.notLinkable" defaultMessage="This result can't be opened" />}
            placement="left"
        >
            {item}
        </Tooltip>
    );
}

function keepFocusInSearchInput(event: MouseEvent) {
    event.preventDefault();
}

const ResultOption = styled(ListItemButton)`
    padding: ${({ theme }) => theme.spacing(1.5, 2)};
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
    border-left: 3px solid transparent;

    &:last-of-type {
        border-bottom: none;
    }

    &.Mui-selected,
    &.Mui-selected:hover {
        border-left-color: ${({ theme }) => theme.palette.primary.main};
        background-color: ${({ theme }) => alpha(theme.palette.primary.main, 0.12)};
    }
`;

const TypeLabel = styled(Typography)`
    flex-shrink: 0;
    line-height: 1.5;
    color: ${({ theme }) => theme.palette.primary.dark};
    font-weight: ${({ theme }) => theme.typography.fontWeightBold};
`;

const SecondaryInformation = styled(Typography)`
    min-width: 0;
`;

const Title = styled(Typography)`
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    overflow-wrap: anywhere;
`;

const SnippetText = styled(Typography)`
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
`;
