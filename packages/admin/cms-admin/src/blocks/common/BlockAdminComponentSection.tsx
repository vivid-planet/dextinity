import { Typography } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import type { PropsWithChildren, ReactNode } from "react";

import { HiddenInSubroute } from "./HiddenInSubroute";

interface Props {
    title?: ReactNode;
    variant?: "normal" | "dense";
    disableBottomMargin?: boolean;
}

export const BlockAdminComponentSection = ({ children, title, variant = "normal", disableBottomMargin }: PropsWithChildren<Props>) => {
    return (
        <Root data-variant={variant} data-bottom-margin={disableBottomMargin ? "none" : "default"}>
            {title && (
                <HiddenInSubroute>
                    <Title variant="section" element="h4">
                        {title}
                    </Title>
                </HiddenInSubroute>
            )}
            {children}
        </Root>
    );
};

const Root = styled("div")`
    &[data-bottom-margin="default"]:not(:last-child) {
        margin-block-end: var(--dextinity-density-form-gap);
    }

    &[data-bottom-margin="default"][data-variant="dense"]:not(:last-child) {
        margin-block-end: var(--dextinity-space-3);
    }
`;

const Title = styled(Typography)`
    margin-block-end: var(--dextinity-space-2);
`;
