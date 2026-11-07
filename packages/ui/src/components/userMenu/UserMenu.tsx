import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { Avatar } from "../avatar/Avatar";
import { Icon } from "../icon/Icon";
import { Menu, type MenuPlacement } from "../menu/Menu";
import { MenuItem } from "../menu/MenuItem";
import { MenuSeparator } from "../menu/MenuSeparator";
import styles from "./UserMenu.module.scss";

export interface UserMenuLabels {
    /** Accessible name of the avatar button, followed by the person's name. */
    trigger: string;
    /** The logout item. */
    logout: string;
}

const defaultLabels: UserMenuLabels = {
    trigger: "Account",
    logout: "Log out",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type UserMenuOwnerState = {
    placement: MenuPlacement;
};

export interface UserMenuProps extends Omit<HTMLAttributes<HTMLButtonElement>, "className" | "children"> {
    /** The signed-in person's name, shown in the menu header and as initials on the avatar. */
    name: string;
    /** The person's role or e-mail address, shown below the name. */
    role?: string;
    /** URL of the person's picture; without it, the avatar shows the initials. */
    avatarSrc?: string;
    /** Whether the menu is open. */
    open: boolean;
    /** Called when the menu opens or closes. */
    onOpenChange: (open: boolean) => void;
    /** The user settings, e.g. theme, density, and interface language as `MenuRadioGroup`s, or a link to the keyboard shortcuts. */
    children?: ReactNode;
    /** Shows the logout item at the end. */
    onLogout?: () => void;
    /** @defaultValue `"bottom-end"` */
    placement?: MenuPlacement;
    /** The built-in texts. */
    labels?: Partial<UserMenuLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * The menu at the person's avatar in the top bar: who is signed in, the user settings, and logout.
 */
export const UserMenu = forwardRef<HTMLButtonElement, UserMenuProps>(function UserMenu(
    { name, role, avatarSrc, open, onOpenChange, children, onLogout, placement = "bottom-end", labels: labelsProp, className, ...restProps },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const ownerState: UserMenuOwnerState = { placement };

    return (
        <Menu
            open={open}
            onOpenChange={onOpenChange}
            placement={ownerState.placement}
            className={styles.popup}
            trigger={
                <button
                    type="button"
                    aria-label={`${labels.trigger}: ${name}`}
                    {...restProps}
                    ref={ref}
                    data-placement={ownerState.placement}
                    className={clsx(styles.root, className)}
                >
                    <Avatar name={name} src={avatarSrc} className={styles.avatar} />
                </button>
            }
        >
            <div className={styles.header}>
                <Avatar name={name} src={avatarSrc} size="large" />
                <span className={styles.identity}>
                    <span className={styles.name}>{name}</span>
                    {role != null && <span className={styles.role}>{role}</span>}
                </span>
            </div>
            {children != null && (
                <>
                    <MenuSeparator />
                    {children}
                </>
            )}
            {onLogout != null && (
                <>
                    <MenuSeparator />
                    <MenuItem label={labels.logout} icon={<Icon name="logout" />} onClick={onLogout} />
                </>
            )}
        </Menu>
    );
});
