import { gql } from "@apollo/client";
import { ListItemButton, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { MarkedMatches, type TextMatch } from "../common/MarkedMatches";
import type { GQLFullTextSearchResultItemFragment } from "./FullTextSearchResultItem.generated";

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
    result: GQLFullTextSearchResultItemFragment;
    linkable?: boolean;
    onClick: () => void;
}

export function FullTextSearchResultItem({ result, linkable, onClick }: FullTextSearchResultItemProps) {
    const { name, titleHighlights, secondaryInformation, snippet } = result;

    return (
        <Root aria-disabled={!linkable} onClick={linkable ? onClick : undefined}>
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

const Root = styled(ListItemButton)`
    &[aria-disabled="true"] {
        cursor: default;
        opacity: ${({ theme }) => theme.palette.action.disabledOpacity};
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
