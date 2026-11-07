import { useApolloClient } from "@apollo/client";
import { Icon, IconButton, Menu, MenuItem, type MenuItemProps } from "@dextinity/ui";
import { Fragment, isValidElement, type ReactElement, useState } from "react";
import { useIntl } from "react-intl";

import { useContentScope } from "../../contentScope/Provider";
import { useDependenciesConfig } from "../../dependencies/dependenciesConfig";

/** An entry of the file's menu, e.g. "Crop image": the props of a `MenuItem` from `@dextinity/ui`. */
type ActionItem = MenuItemProps;

export type FileFieldMenuActions = Array<ActionItem | ReactElement | null | undefined>;

interface FileFieldMenuProps {
    fileId: string;
    menuActions?: FileFieldMenuActions;
}

export const FileFieldMenu = ({ fileId, menuActions }: FileFieldMenuProps) => {
    const intl = useIntl();
    const [open, setOpen] = useState(false);
    const contentScope = useContentScope();
    const apolloClient = useApolloClient();
    const { entityDependencyMap } = useDependenciesConfig();
    const damDependency = entityDependencyMap["DamFile"];

    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            trigger={
                <IconButton
                    variant="text"
                    color="secondary"
                    size="small"
                    aria-label={intl.formatMessage({ id: "dextinity.form.file.moreActions", defaultMessage: "More actions" })}
                >
                    <Icon name="more-vertical" />
                </IconButton>
            }
        >
            {damDependency && (
                <MenuItem
                    label={intl.formatMessage({ id: "dextinity.form.file.openInDam", defaultMessage: "Open in DAM" })}
                    icon={<Icon name="open-new-tab" />}
                    onClick={async () => {
                        const path = await damDependency.resolvePath({ apolloClient, id: fileId });
                        window.open(contentScope.match.url + path, "_blank");
                    }}
                />
            )}
            {menuActions?.map((item, index) => {
                if (!item) {
                    return null;
                }
                if (isValidElement(item)) {
                    return <Fragment key={item.key ?? index}>{item}</Fragment>;
                }
                const actionItem = item as ActionItem;
                return <MenuItem key={actionItem.label} {...actionItem} />;
            })}
        </Menu>
    );
};

export const useHasFileFieldMenu = (menuActions: FileFieldMenuActions | undefined): boolean => {
    const { entityDependencyMap } = useDependenciesConfig();
    return Boolean(entityDependencyMap["DamFile"]) || (menuActions !== undefined && menuActions.some((item) => item != null));
};
