import { Button } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import type { MouseEventHandler, PropsWithChildren, ReactNode } from "react";

import { BlockAdminComponentPaper } from "./BlockAdminComponentPaper";

interface Props {
    variant?: "primary" | "default";
    size?: "medium" | "large";
    startIcon?: ReactNode;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
}

export const BlockAdminComponentButton = ({ variant = "default", size = "medium", ...buttonProps }: PropsWithChildren<Props>) => {
    return (
        <BlockAdminComponentPaper disablePadding>
            <ButtonContainer data-size={size}>
                <Button variant="text" color={variant === "primary" ? "primary" : "secondary"} {...buttonProps} />
            </ButtonContainer>
        </BlockAdminComponentPaper>
    );
};

const ButtonContainer = styled("div")`
    display: flex;

    > * {
        flex: 1;
    }

    &[data-size="large"] {
        --dextinity-button-height: 64px;
    }
`;
