import { AppHeader, AppHeaderDropdown, AppHeaderMenuButton, Button, FillSpace } from "@dextinity/admin";
import { Account, DextinityLogo, Domain, Logout } from "@dextinity/admin-icons";
import { type ContentScope, useCurrentUser } from "@dextinity/serverless/client";
import { List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

interface MasterHeaderProps {
    scope: ContentScope | undefined;
    scopes: ContentScope[];
    onScopeChange: (scope: ContentScope) => void;
}

export function MasterHeader({ scope, scopes, onScopeChange }: MasterHeaderProps) {
    const currentUser = useCurrentUser();

    return (
        <AppHeader>
            <AppHeaderMenuButton />
            <LogoWrapper>
                <DextinityLogo variant="light" fontSize="large" />
            </LogoWrapper>
            <FillSpace />
            {scope && (
                <AppHeaderDropdown
                    startIcon={<Domain />}
                    buttonChildren={<FormattedMessage id="header.domain" defaultMessage="Domain: {domain}" values={{ domain: scope.domain }} />}
                >
                    {(closeDropdown) => (
                        <List>
                            {scopes.map((option) => (
                                <ListItemButton
                                    key={option.domain}
                                    selected={option.domain === scope.domain}
                                    onClick={() => {
                                        onScopeChange(option);
                                        closeDropdown();
                                    }}
                                >
                                    <ListItemText primary={option.domain} />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </AppHeaderDropdown>
            )}
            <AppHeaderDropdown startIcon={<Account />} buttonChildren={currentUser.name}>
                <UserDetails>
                    <Typography variant="subtitle2">{currentUser.email}</Typography>
                    <Typography variant="body2">
                        <FormattedMessage
                            id="header.groups"
                            defaultMessage="Groups: {groups}"
                            values={{ groups: currentUser.groups.length > 0 ? currentUser.groups.join(", ") : "–" }}
                        />
                    </Typography>
                    <Typography variant="body2">
                        <FormattedMessage
                            id="header.permissions"
                            defaultMessage="Permissions: {permissions}"
                            values={{
                                permissions: currentUser.grants
                                    .map(({ permission, contentScopes }) => `${permission} (${contentScopes.map(({ domain }) => domain).join(", ")})`)
                                    .join("; "),
                            }}
                        />
                    </Typography>
                    {/* Access ends the session at the identity provider and in Access */}
                    <Button variant="secondary" startIcon={<Logout />} href="/cdn-cgi/access/logout">
                        <FormattedMessage id="header.logout" defaultMessage="Logout" />
                    </Button>
                </UserDetails>
            </AppHeaderDropdown>
        </AppHeader>
    );
}

const LogoWrapper = styled("div")`
    display: flex;
    align-items: center;
    margin-left: ${({ theme }) => theme.spacing(3)};
`;

const UserDetails = styled("div")`
    display: grid;
    gap: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(4)};
    min-width: 280px;
`;
