import { gql } from "@apollo/client";
import { ListItemButton, listItemButtonClasses, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { type MouseEvent, useEffect, useRef } from "react";

import { MarkedMatches, type TextMatch } from "../common/MarkedMatches";
import type { GQLFullTextSearchResultItemFragment } from "./FullTextSearchResultItem.generated";
import { FullTextSearchTypeIcon } from "./FullTextSearchTypeIcon";

export const fullTextSearchResultItemFragment = gql`
    fragment FullTextSearchResultItem on FullTextSearchResult {
        id
        entityName
        type
        name
        titleHighlights {
            start
            end
        }
        secondaryInformation
        snippet {
            text
            highlights {
                start
                end
            }
            truncatedStart
            truncatedEnd
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
    const itemRef = useRef<HTMLDivElement>(null);
    const { name, titleHighlights, secondaryInformation, snippet } = result;

    useEffect(() => {
        if (active && scrollIntoViewWhenActive) {
            itemRef.current?.scrollIntoView({ block: "nearest" });
        }
    }, [active, scrollIntoViewWhenActive]);

    return (
        <Root
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
            <TypeIconCircle>
                <FullTextSearchTypeIcon searchType={result} />
            </TypeIconCircle>
            <Stack spacing={1} sx={{ minWidth: 0 }}>
                <div>
                    <Title variant="body1">
                        <MarkedMatches text={name} matches={toTextMatches(titleHighlights)} />
                    </Title>
                    {secondaryInformation && (
                        <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
                            {secondaryInformation}
                        </Typography>
                    )}
                </div>
                {snippet && (
                    <Snippet variant="body2" sx={{ color: "text.secondary" }}>
                        {snippet.truncatedStart && "…\u00A0"}
                        <MarkedMatches text={snippet.text} matches={toTextMatches(snippet.highlights)} />
                        {snippet.truncatedEnd && "\u00A0…"}
                    </Snippet>
                )}
            </Stack>
        </Root>
    );
}

// The API returns an exclusive end offset, MarkedMatches expects an inclusive one
function toTextMatches(highlights: Array<{ start: number; end: number }>): TextMatch[] {
    return highlights.map(({ start, end }) => ({ start, end: end - 1, focused: false }));
}

function keepFocusInSearchInput(event: MouseEvent) {
    event.preventDefault();
}

const Root = styled(ListItemButton)`
    gap: ${({ theme }) => theme.spacing(3)};
    padding: ${({ theme }) => theme.spacing(2, 4)};

    /* Hovering makes a result the active one, so only the active result is highlighted */
    &:hover {
        background-color: transparent;
    }

    &.${listItemButtonClasses.selected}, &.${listItemButtonClasses.selected}:hover {
        background-color: ${({ theme }) => theme.palette.grey[50]};
    }

    &[aria-disabled="true"] {
        cursor: default;
        opacity: ${({ theme }) => theme.palette.action.disabledOpacity};
    }
`;

const TypeIconCircle = styled("div")`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: ${({ theme }) => theme.palette.grey[600]};
    background-color: ${({ theme }) => theme.palette.grey[50]};

    .${listItemButtonClasses.selected} & {
        background-color: ${({ theme }) => theme.palette.common.white};
    }
`;

const Title = styled(Typography)`
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    overflow-wrap: anywhere;
`;

const Snippet = styled(Typography)`
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
`;
