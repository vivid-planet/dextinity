import { List, ListSubheader, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { PropsWithChildren, ReactNode } from "react";
import { FormattedNumber } from "react-intl";

interface FullTextSearchResultGroupProps {
    label: ReactNode;
    count: number;
}

export function FullTextSearchResultGroup({ label, count, children }: PropsWithChildren<FullTextSearchResultGroupProps>) {
    return (
        <GroupList
            disablePadding
            subheader={
                <GroupHeader disableSticky>
                    <Typography variant="subtitle2" component="span" color="text.secondary">
                        {label}
                    </Typography>
                    <Typography variant="body2" component="span" color="text.secondary">
                        <FormattedNumber value={count} />
                    </Typography>
                </GroupHeader>
            }
        >
            {children}
        </GroupList>
    );
}

const GroupList = styled(List)`
    padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const GroupHeader = styled(ListSubheader)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({ theme }) => theme.spacing(3, 4, 1)};
    line-height: inherit;
`;
