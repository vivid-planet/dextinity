import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { PropsWithChildren, ReactNode } from "react";

import { HiddenInSubroute } from "./HiddenInSubroute";

interface Props {
    title?: ReactNode;
}

export const BlockAdminComponentSectionGroup = ({ children, title }: PropsWithChildren<Props>) => {
    return (
        <Root>
            {title && (
                <HiddenInSubroute>
                    <Typography variant="h4" gutterBottom>
                        {title}
                    </Typography>
                </HiddenInSubroute>
            )}
            {children}
        </Root>
    );
};

const Root = styled("div")`
    &:not(:last-child) {
        margin-bottom: ${({ theme }) => theme.spacing(4)};
    }
`;
