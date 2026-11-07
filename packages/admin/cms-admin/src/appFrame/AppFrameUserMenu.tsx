import { gql, useMutation } from "@apollo/client";
import {
    Icon,
    MenuGroup,
    MenuItem,
    MenuRadioGroup,
    MenuRadioItem,
    MenuSeparator,
    type ThemeColorScheme,
    type ThemeDensity,
    UserMenu,
} from "@dextinity/ui";
import { type ReactNode, useState } from "react";
import { useIntl } from "react-intl";

import { useCurrentUser } from "../userPermissions/hooks/currentUser";
import { stopImpersonation } from "../userPermissions/utils/handleImpersonation";
import type { GQLAppFrameSignOutMutation, GQLAppFrameSignOutMutationVariables } from "./AppFrameUserMenu.generated";

const signOutMutation = gql`
    mutation AppFrameSignOut {
        currentUserSignOut
    }
`;

const colorSchemes: ThemeColorScheme[] = ["light", "dark", "high-contrast"];
const densities: ThemeDensity[] = ["comfortable", "standard", "compact"];

interface AppFrameUserMenuProps {
    colorScheme: ThemeColorScheme;
    onColorSchemeChange: (colorScheme: ThemeColorScheme) => void;
    density: ThemeDensity;
    onDensityChange: (density: ThemeDensity) => void;
    onAboutClick: () => void;
    children?: ReactNode;
}

export function AppFrameUserMenu({ colorScheme, onColorSchemeChange, density, onDensityChange, onAboutClick, children }: AppFrameUserMenuProps) {
    const intl = useIntl();
    const user = useCurrentUser();
    const [open, setOpen] = useState(false);
    const [signOut] = useMutation<GQLAppFrameSignOutMutation, GQLAppFrameSignOutMutationVariables>(signOutMutation);

    const colorSchemeLabels: Record<ThemeColorScheme, string> = {
        light: intl.formatMessage({ id: "dextinity.appFrame.userMenu.colorScheme.light", defaultMessage: "Light" }),
        dark: intl.formatMessage({ id: "dextinity.appFrame.userMenu.colorScheme.dark", defaultMessage: "Dark" }),
        "high-contrast": intl.formatMessage({ id: "dextinity.appFrame.userMenu.colorScheme.highContrast", defaultMessage: "High contrast" }),
    };
    const colorSchemeIcons: Record<ThemeColorScheme, ReactNode> = {
        light: <Icon name="light-mode" />,
        dark: <Icon name="dark-mode" />,
        "high-contrast": <Icon name="high-contrast-mode" />,
    };
    const densityLabels: Record<ThemeDensity, string> = {
        comfortable: intl.formatMessage({ id: "dextinity.appFrame.userMenu.density.comfortable", defaultMessage: "Comfortable" }),
        standard: intl.formatMessage({ id: "dextinity.appFrame.userMenu.density.standard", defaultMessage: "Standard" }),
        compact: intl.formatMessage({ id: "dextinity.appFrame.userMenu.density.compact", defaultMessage: "Compact" }),
    };
    const displayedUser = user.authenticatedUser ?? user;

    return (
        <UserMenu
            name={displayedUser.name}
            role={displayedUser.email}
            open={open}
            onOpenChange={setOpen}
            onLogout={async () => {
                const result = await signOut();
                if (result.data) {
                    location.href = result.data.currentUserSignOut;
                }
            }}
            labels={{
                trigger: intl.formatMessage({ id: "dextinity.appFrame.userMenu.trigger", defaultMessage: "Account" }),
                logout: intl.formatMessage({ id: "dextinity.appFrame.userMenu.logout", defaultMessage: "Log out" }),
            }}
        >
            {user.impersonated && (
                <>
                    <MenuGroup
                        label={intl.formatMessage(
                            { id: "dextinity.appFrame.userMenu.impersonating", defaultMessage: "Impersonating {name}" },
                            { name: user.name },
                        )}
                    >
                        <MenuItem
                            label={intl.formatMessage({ id: "dextinity.generic.stopImpersonation", defaultMessage: "Regain original identity" })}
                            icon={<Icon name="reload" />}
                            onClick={() => void stopImpersonation()}
                        />
                    </MenuGroup>
                    <MenuSeparator />
                </>
            )}
            {user.accountUrl && (
                <>
                    <MenuItem
                        label={intl.formatMessage({ id: "dextinity.appFrame.userMenu.myAccount", defaultMessage: "My account" })}
                        icon={<Icon name="account" />}
                        onClick={() => window.open(user.accountUrl, "_blank", "noopener,noreferrer")}
                    />
                    <MenuSeparator />
                </>
            )}
            <MenuGroup label={intl.formatMessage({ id: "dextinity.appFrame.userMenu.colorScheme", defaultMessage: "Theme" })}>
                <MenuRadioGroup value={colorScheme} onChange={(value) => onColorSchemeChange(value as ThemeColorScheme)}>
                    {colorSchemes.map((value) => (
                        <MenuRadioItem
                            key={value}
                            closeOnClick={false}
                            value={value}
                            label={colorSchemeLabels[value]}
                            icon={colorSchemeIcons[value]}
                        />
                    ))}
                </MenuRadioGroup>
            </MenuGroup>
            <MenuSeparator />
            <MenuGroup label={intl.formatMessage({ id: "dextinity.appFrame.userMenu.density", defaultMessage: "Density" })}>
                <MenuRadioGroup value={density} onChange={(value) => onDensityChange(value as ThemeDensity)}>
                    {densities.map((value) => (
                        <MenuRadioItem key={value} closeOnClick={false} value={value} label={densityLabels[value]} />
                    ))}
                </MenuRadioGroup>
            </MenuGroup>
            <MenuSeparator />
            {children}
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.appFrame.userMenu.about", defaultMessage: "About" })}
                icon={<Icon name="info" />}
                onClick={onAboutClick}
            />
        </UserMenu>
    );
}
