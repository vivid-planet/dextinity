import { useApolloClient } from "@apollo/client";
import { OpenNewTab } from "@dextinity/admin-icons";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { type ComponentProps, isValidElement, type ReactElement, type ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { useContentScope } from "../../contentScope/Provider";
import { useDependenciesConfig } from "../../dependencies/dependenciesConfig";

export interface ActionItem extends ComponentProps<typeof MenuItem> {
    label: ReactNode;
    icon?: ReactNode;
}

interface FileFieldMenuProps {
    fileId: string;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    menuActions?: Array<ActionItem | ReactElement | null | undefined>;
    keepMounted?: boolean;
}

export const FileFieldMenu = ({ fileId, anchorEl, onClose, menuActions, keepMounted }: FileFieldMenuProps) => {
    const contentScope = useContentScope();
    const apolloClient = useApolloClient();
    const { entityDependencyMap } = useDependenciesConfig();
    const damDependency = entityDependencyMap["DamFile"];

    return (
        <Menu anchorEl={anchorEl} keepMounted={keepMounted} open={Boolean(anchorEl)} onClose={onClose}>
            {damDependency && (
                <MenuItem
                    onClick={async () => {
                        onClose();
                        const path = await damDependency.resolvePath({ apolloClient, id: fileId });
                        window.open(contentScope.match.url + path, "_blank");
                    }}
                >
                    <ListItemIcon>
                        <OpenNewTab />
                    </ListItemIcon>
                    <ListItemText primary={<FormattedMessage id="dextinity.form.file.openInDam" defaultMessage="Open in DAM" />} />
                </MenuItem>
            )}
            {menuActions?.map((item, index) => {
                if (!item) {
                    return null;
                }
                if (isValidElement(item)) {
                    return item;
                }
                const { label, icon, ...rest } = item as ActionItem;
                return (
                    <MenuItem key={index} {...rest}>
                        {!!icon && <ListItemIcon>{icon}</ListItemIcon>}
                        <ListItemText primary={label} />
                    </MenuItem>
                );
            })}
        </Menu>
    );
};

export const useHasFileFieldMenu = (menuActions: FileFieldMenuProps["menuActions"]): boolean => {
    const { entityDependencyMap } = useDependenciesConfig();
    return Boolean(entityDependencyMap["DamFile"]) || (menuActions !== undefined && menuActions.length > 0);
};
