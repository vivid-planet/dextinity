import { AppHeaderDropdown, type AppHeaderDropdownProps } from "@dextinity/admin";
import { Account, ImpersonateUser } from "@dextinity/admin-icons";
import { Avatar, AvatarGroup, type AvatarProps, Box, Divider, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import { css, styled } from "@mui/material/styles";
import { type PropsWithChildren, type ReactElement, useState } from "react";
import { FormattedMessage } from "react-intl";

import { version } from "../..";
import { useCurrentUser } from "../../userPermissions/hooks/currentUser";
import { SignOutButton } from "../signOutButton/SignOutButton";
import { AboutModal } from "./about/AboutModal";
import { ImpersonationInlay } from "./ImpersonationInlay";

interface UserHeaderItemProps {
    aboutModalLogo?: ReactElement;
    buttonChildren?: AppHeaderDropdownProps["buttonChildren"];
}

export function UserHeaderItem(props: PropsWithChildren<UserHeaderItemProps>) {
    const { aboutModalLogo, buttonChildren, children } = props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const user = useCurrentUser();

    const [showAboutModal, setShowAboutModal] = useState(false);

    const accountIcon = user.impersonated ? (
        <AvatarGroup>
            <StyledAvatar inactive>
                <Account />
            </StyledAvatar>
            <StyledAvatar active>
                <ImpersonateUser />
            </StyledAvatar>
        </AvatarGroup>
    ) : (
        <StyledAvatar>
            <Account />
        </StyledAvatar>
    );

    return (
        <AppHeaderDropdown
            buttonChildren={buttonChildren ?? (isMobile ? accountIcon : user.name)}
            startIcon={isMobile ? undefined : accountIcon}
            dropdownArrow={isMobile ? null : undefined}
        >
            <Box width={300} padding={0}>
                <Box padding={4}>
                    <LoggedInInfo variant="caption">
                        <FormattedMessage id="dextinity.logged.in" defaultMessage="Logged in as" />
                    </LoggedInInfo>
                    <SingleLineTypography variant="h4">{user.authenticatedUser ? user.authenticatedUser.name : user.name}</SingleLineTypography>
                    <SingleLineTypography variant="body2">{user.authenticatedUser ? user.authenticatedUser.email : user.email}</SingleLineTypography>
                    {user.accountUrl && (
                        <MyAccountLink href={user.accountUrl} target="_blank" rel="noopener noreferrer">
                            <SingleLineTypography variant="body2">
                                <FormattedMessage id="dextinity.myAccount" defaultMessage="My Account" />
                            </SingleLineTypography>
                        </MyAccountLink>
                    )}
                </Box>
                <Divider />
                {user.impersonated && (
                    <>
                        <ImpersonationInlay />
                        <Divider />
                    </>
                )}
                {children && (
                    <>
                        <Box padding={4}>{children}</Box>
                        <Divider />
                    </>
                )}
                <Box padding={4}>
                    <SignOutButton fullWidth variant="contained" />
                    <MenuFooter>
                        <Typography variant="caption" color={theme.palette.grey[400]}>{`Version: v${version}`}</Typography>
                        <Typography variant="caption">
                            <AboutLink
                                onClick={() => {
                                    setShowAboutModal(true);
                                }}
                            >
                                <FormattedMessage id="dextinity.about" defaultMessage="About/Copyright" />
                            </AboutLink>
                        </Typography>
                    </MenuFooter>
                </Box>
            </Box>
            <AboutModal
                open={showAboutModal}
                onClose={() => {
                    setShowAboutModal(false);
                }}
                logo={aboutModalLogo}
            />
        </AppHeaderDropdown>
    );
}

interface StyledAvatarProps extends AvatarProps {
    active?: boolean;
    inactive?: boolean;
}

const StyledAvatar = styled(Avatar)<StyledAvatarProps>`
    width: 32px;
    height: 32px;
    background-color: ${({ theme }) => theme.palette.grey[900]};

    && {
        border: 1px solid ${({ theme }) => theme.palette.grey[400]};
    }

    ${({ active, theme }) =>
        active &&
        css`
            margin-left: -10px;
            z-index: 1;

            && {
                border: 2px solid ${theme.palette.primary.main};
            }
        `}

    ${({ inactive }) =>
        inactive &&
        css`
            opacity: 50%;
        `}
`;

const LoggedInInfo = styled(Typography)(
    ({ theme }) => css`
        padding-bottom: ${theme.spacing(2)};
        display: block;
        color: ${theme.palette.grey[400]};
    `,
);

const SingleLineTypography = styled(Typography)`
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`;

const MenuFooter = styled(Box)`
    display: flex;
    padding-top: 10px;
    justify-content: space-between;
    align-items: center;
`;

const MyAccountLink = styled(Link)`
    padding-top: 10px;
`;

const AboutLink = styled(Link)(
    ({ theme }) => css`
        text-decoration: none;
        cursor: pointer;
        color: ${theme.palette.primary.main};
        font-size: inherit;
        line-height: inherit;
        font-weight: inherit;
    `,
);
