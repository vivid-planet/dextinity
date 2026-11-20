import { Search } from "@dextinity/admin-icons";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

export const optionId = (key: string) => `full-text-search-option-${key.replace(/[^a-zA-Z0-9-_]/g, "-")}`;

export function EmptyState({ search }: { search: string }) {
    return (
        <EmptyStateRoot>
            <Search color="disabled" />
            <Typography variant="body2">
                <FormattedMessage
                    id="fullTextSearchPrototype.noResults"
                    defaultMessage="No results for “{search}”"
                    values={{ search: <strong key="search">{search}</strong> }}
                />
            </Typography>
            <Typography variant="caption" color="text.secondary">
                <FormattedMessage id="fullTextSearchPrototype.noResults.hint" defaultMessage="Check the spelling or try a shorter search term." />
            </Typography>
        </EmptyStateRoot>
    );
}

export const Kbd = styled("kbd")`
    display: inline-block;
    min-width: 18px;
    margin-right: 2px;
    padding: 0 ${({ theme }) => theme.spacing(0.75)};
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    background-color: ${({ theme }) => theme.palette.grey[50]};
    color: ${({ theme }) => theme.palette.text.secondary};
    font-family: inherit;
    font-size: 11px;
    line-height: 18px;
    text-align: center;
`;

const EmptyStateRoot = styled("div")`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1)};
    padding: ${({ theme }) => theme.spacing(5, 3)};
    text-align: center;
`;
