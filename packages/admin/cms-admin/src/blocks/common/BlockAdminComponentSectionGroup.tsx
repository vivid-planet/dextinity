import { Typography } from "@dextinity/ui";
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
                    <Title variant="title" element="h3">
                        {title}
                    </Title>
                </HiddenInSubroute>
            )}
            {children}
        </Root>
    );
};

const Root = styled("div")`
    &:not(:last-child) {
        margin-block-end: var(--dextinity-space-8);
    }
`;

const Title = styled(Typography)`
    margin-block-end: var(--dextinity-space-3);
`;
