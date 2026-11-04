import { css, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { PropsWithChildren, ReactNode } from "react";

import { HiddenInSubroute } from "./HiddenInSubroute";

interface Props {
    title?: ReactNode;
    variant?: "normal" | "dense";
    disableBottomMargin?: boolean;
}

export const BlockAdminComponentSection = ({ children, title, disableBottomMargin }: PropsWithChildren<Props>) => {
    if (title) {
        return (
            <Root disableBottomMargin={disableBottomMargin}>
                <HiddenInSubroute>
                    <Title variant="subtitle1">{title}</Title>
                </HiddenInSubroute>
                {children}
            </Root>
        );
    }

    return <Root disableBottomMargin={disableBottomMargin}>{children}</Root>;
};

const Root = styled("div", { shouldForwardProp: (prop) => prop !== "disableBottomMargin" })<Pick<Props, "variant" | "disableBottomMargin">>`
    ${({ disableBottomMargin, variant, theme }) =>
        !disableBottomMargin &&
        css`
            &:not(:last-child) {
                margin-bottom: ${theme.spacing(variant === "dense" ? 3 : 4)};
            }
        `}
`;

const Title = styled(Typography)`
    margin-bottom: ${({ theme }) => theme.spacing(2)};
`;
