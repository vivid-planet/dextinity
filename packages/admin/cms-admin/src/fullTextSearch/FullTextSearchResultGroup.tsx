import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { type PropsWithChildren, type ReactNode, useId } from "react";
import { FormattedNumber } from "react-intl";

interface FullTextSearchResultGroupProps {
    label: ReactNode;
    count: number;
}

export function FullTextSearchResultGroup({ label, count, children }: PropsWithChildren<FullTextSearchResultGroupProps>) {
    const labelId = useId();

    // A listbox group may only contain options, so the header is placed next to the group and labels it
    return (
        <Root role="presentation">
            <GroupHeader aria-hidden>
                <Typography id={labelId} variant="subtitle2" component="span" sx={{ color: "text.secondary" }}>
                    {label}
                </Typography>
                <Typography variant="body2" component="span" sx={{ color: "text.secondary" }}>
                    <FormattedNumber value={count} />
                </Typography>
            </GroupHeader>
            <Group role="group" aria-labelledby={labelId}>
                {children}
            </Group>
        </Root>
    );
}

const Root = styled("div")`
    padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const GroupHeader = styled("div")`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({ theme }) => theme.spacing(3, 4, 1)};
    line-height: ${({ theme }) => theme.typography.subtitle2.lineHeight};
`;

const Group = styled("div")`
    /* Scrolling the first result into view also shows the group header above it */
    & > :first-of-type {
        scroll-margin-top: calc(${({ theme }) => theme.spacing(4)} + ${({ theme }) => theme.typography.subtitle2.lineHeight});
    }
`;
