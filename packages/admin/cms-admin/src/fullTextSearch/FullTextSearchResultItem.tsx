import { gql } from "@apollo/client";
import { Tooltip } from "@dextinity/admin";
import { Chip, ListItemButton, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
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
        titleMatch
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
    result: GQLFullTextSearchResultItemFragment;
    linkable: boolean;
    onClick: () => void;
}

export function FullTextSearchResultItem({ result, linkable, onClick }: FullTextSearchResultItemProps) {
    const getTypeLabel = useFullTextSearchTypeLabel();
    const { title, snippet } = result;

    const item = (
        <ListItemButton alignItems="flex-start" aria-disabled={!linkable} onClick={linkable ? onClick : undefined}>
            <Stack spacing={0.5} sx={{ minWidth: 0, flexGrow: 1 }}>
                <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
                    <Title variant="body1" titleMatch={result.titleMatch}>
                        <MarkedMatches text={title.text} matches={toTextMatches(title.highlights)} />
                    </Title>
                    <Chip size="small" variant="outlined" label={getTypeLabel(result)} />
                </Stack>
                {result.secondaryInformation && (
                    <Typography variant="caption" color="text.secondary">
                        {result.secondaryInformation}
                    </Typography>
                )}
                {snippet && (
                    <SnippetText variant="body2" color="text.secondary">
                        {snippet.truncatedStart && "… "}
                        <MarkedMatches text={snippet.text} matches={toTextMatches(snippet.highlights)} />
                        {snippet.truncatedEnd && " …"}
                    </SnippetText>
                )}
            </Stack>
        </ListItemButton>
    );

    if (linkable) {
        return item;
    }

    return (
        <Tooltip title={<FormattedMessage id="dextinity.fullTextSearch.notLinkable" defaultMessage="This result can't be opened" />} placement="left">
            {item}
        </Tooltip>
    );
}

const Title = styled(Typography, { shouldForwardProp: (prop) => prop !== "titleMatch" })<{ titleMatch: boolean }>`
    font-weight: ${({ titleMatch, theme }) => (titleMatch ? theme.typography.fontWeightBold : undefined)};
    overflow-wrap: anywhere;
`;

const SnippetText = styled(Typography)`
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
`;
