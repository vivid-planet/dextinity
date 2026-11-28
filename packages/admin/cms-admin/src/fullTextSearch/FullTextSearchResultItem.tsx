import { gql } from "@apollo/client";
import { Tooltip } from "@dextinity/admin";
import { ListItemButton, listItemButtonClasses, Stack, Typography } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { type MouseEvent, useEffect, useRef } from "react";
import { FormattedMessage } from "react-intl";

import { MarkedMatches } from "../common/MarkedMatches";
import type { GQLFullTextSearchResultItemFragment } from "./FullTextSearchResultItem.generated";
import { FullTextSearchTypeIcon } from "./FullTextSearchTypeIcon";
import { toTextMatches } from "./toTextMatches";

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
            <TypeIconCircle colorVariant={getIconColorVariant(result.entityName)}>
                <FullTextSearchTypeIcon searchType={result} />
            </TypeIconCircle>
            <Stack spacing={1} sx={{ minWidth: 0, flexGrow: 1 }}>
                <div>
                    <Title variant="body1">
                        <MarkedMatches text={title.text} matches={toTextMatches(title.highlights)} />
                    </Title>
                    {result.secondaryInformation && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {result.secondaryInformation}
                        </Typography>
                    )}
                </div>
                {snippet && (
                    <Snippet className={snippetClassName}>
                        <SnippetText variant="body1">
                            {snippet.truncatedStart && "… "}
                            <MarkedMatches text={snippet.text} matches={toTextMatches(snippet.highlights)} />
                            {snippet.truncatedEnd && " …"}
                        </SnippetText>
                    </Snippet>
                )}
            </Stack>
        </ResultOption>
    );

    if (linkable) {
        return item;
    }

    // The focus stays in the search input, so the tooltip is shown for the active result instead of on focus
    return (
        <Tooltip
            open={active}
            title={<FormattedMessage id="dextinity.fullTextSearch.notLinkable" defaultMessage="This result can't be opened" />}
            placement="left"
            slotProps={{ popper: { sx: hideWhenResultIsScrolledOutOfView } }}
        >
            {item}
        </Tooltip>
    );
}

// Popper's hide modifier marks the tooltip when the result is outside the visible area of the scrolled list
const hideWhenResultIsScrolledOutOfView = {
    "&[data-popper-reference-hidden]": {
        visibility: "hidden",
    },
};

function keepFocusInSearchInput(event: MouseEvent) {
    event.preventDefault();
}

const snippetClassName = "FullTextSearchResultItem-snippet";

type IconColorVariant = "primary" | "success" | "default";

function getIconColorVariant(entityName: string): IconColorVariant {
    if (entityName === "PageTreeNode") {
        return "primary";
    }

    if (entityName === "News") {
        return "success";
    }

    return "default";
}

const ResultOption = styled(ListItemButton)`
    gap: ${({ theme }) => theme.spacing(3)};
    margin: ${({ theme }) => theme.spacing(0, 2)};
    padding: ${({ theme }) => theme.spacing(2, 2)};
    border-radius: ${({ theme }) => Number(theme.shape.borderRadius) * 6}px;

    & + &::before {
        content: "";
        position: absolute;
        top: 0;
        right: ${({ theme }) => theme.spacing(2)};
        left: ${({ theme }) => theme.spacing(2)};
        border-top: 1px solid ${({ theme }) => theme.palette.divider};
    }

    /* Hovering makes a result the active one, so a hovered result that isn't active anymore isn't highlighted */
    &:hover {
        background-color: transparent;
    }

    &.${listItemButtonClasses.selected}, &.${listItemButtonClasses.selected}:hover {
        background-color: ${({ theme }) => theme.palette.grey[50]};
    }

    &.${listItemButtonClasses.selected}::before, &.${listItemButtonClasses.selected} + &::before {
        border-top-color: transparent;
    }

    &.${listItemButtonClasses.selected} .${snippetClassName} {
        background-color: ${({ theme }) => theme.palette.background.paper};
    }
`;

const TypeIconCircle = styled("div", { shouldForwardProp: (prop) => prop !== "colorVariant" })<{ colorVariant: IconColorVariant }>`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: ${({ theme, colorVariant }) => (colorVariant === "default" ? theme.palette.grey[600] : theme.palette[colorVariant].main)};
    background-color: ${({ theme, colorVariant }) =>
        colorVariant === "default" ? theme.palette.grey[50] : alpha(theme.palette[colorVariant].main, 0.1)};

    .${listItemButtonClasses.selected} & {
        background-color: ${({ theme, colorVariant }) =>
            colorVariant === "default" ? theme.palette.grey[100] : alpha(theme.palette[colorVariant].main, 0.2)};
    }
`;

const Title = styled(Typography)`
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    overflow-wrap: anywhere;
`;

// The padding is on a wrapper because the clamped text overflows into its own padding
const Snippet = styled("div")`
    padding: ${({ theme }) => theme.spacing(1.5, 2)};
    border-radius: ${({ theme }) => Number(theme.shape.borderRadius) * 6}px;
    background-color: ${({ theme }) => theme.palette.grey[50]};
`;

const SnippetText = styled(Typography)`
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
`;
