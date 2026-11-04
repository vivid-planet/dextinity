import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { PropsWithChildren } from "react";

const FooterBar = styled(Paper)`
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);

    min-height: 60px;
    border-radius: 4px;

    ${({ theme }) => theme.breakpoints.up(1024)} {
        z-index: ${({ theme }) => theme.zIndex.snackbar};
    }

    background-color: ${({ theme }) => theme.palette.grey.A400};
    color: ${({ theme }) => theme.palette.common.white};

    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 30px;

    padding-left: 20px;
    padding-right: 20px;
`;

interface DamFooterProps {
    open: boolean;
}

export const DamFooter = ({ children, open }: PropsWithChildren<DamFooterProps>) => {
    if (!open) {
        return null;
    }

    return <FooterBar>{children}</FooterBar>;
};
