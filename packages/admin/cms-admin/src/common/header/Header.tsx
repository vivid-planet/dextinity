import { AppHeader, AppHeaderMenuButton, FillSpace } from "@dextinity/admin";
import { DextinityLogo } from "@dextinity/admin-icons";
import { useMediaQuery, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { PropsWithChildren, ReactNode } from "react";

const LogoWrapper = styled("div")`
    /* Flex rather than block: the logo is an inline-block SVG, so a block wrapper would add baseline
       descender space below it and the wrapper would no longer be centered on the logo itself. */
    display: flex;
    align-items: center;

    ${({ theme }) => theme.breakpoints.up("md")} {
        margin-left: 14px;
    }
`;

interface Props {
    logo?: ReactNode;
}

function Header({ children, logo }: PropsWithChildren<Props>) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    return (
        <AppHeader>
            <AppHeaderMenuButton />
            {!isMobile && <LogoWrapper>{logo || <DextinityLogo variant="light" sx={{ fontSize: 34 }} />}</LogoWrapper>}
            {!isMobile && <FillSpace />}
            {children}
        </AppHeader>
    );
}

export { Header };
