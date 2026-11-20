import { gql } from "@apollo/client";
import { Tooltip } from "@dextinity/admin";
import { ListItemButton, Stack, Typography } from "@mui/material";
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
        <ResultOption alignItems="flex-start" aria-disabled={!linkable} onClick={linkable ? onClick : undefined}>
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

    return (
        <Tooltip title={<FormattedMessage id="dextinity.fullTextSearch.notLinkable" defaultMessage="This result can't be opened" />} placement="left">
            {item}
        </Tooltip>
    );
}

const ResultOption = styled(ListItemButton)`
    padding: ${({ theme }) => theme.spacing(1.5, 2)};
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};

    &:last-of-type {
        border-bottom: none;
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
