import { MoreVertical } from "@dextinity/admin-icons";
import {
    Chip,
    type ComponentsOverrides,
    css,
    Divider,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    type MenuItemProps,
    MenuList,
    type MenuListProps,
    type Theme,
    Typography,
    useTheme,
} from "@mui/material";
import type { Maybe } from "graphql/jsutils/Maybe";
import {
    type ComponentProps,
    createContext,
    isValidElement,
    type MouseEvent,
    type PropsWithChildren,
    type ReactElement,
    type ReactNode,
    useContext,
    useState,
} from "react";
import { FormattedMessage } from "react-intl";

import { Button } from "../common/buttons/Button";
import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";

export type CrudMoreActionsMenuClassKey = "root" | "group" | "divider" | "button" | "chip" | "menuItem";

interface ActionItem extends ComponentProps<typeof MenuItem> {
    label: ReactNode;
    icon?: ReactNode;
}

export interface CrudMoreActionsMenuProps extends ThemedComponentBaseProps<{
    menu: typeof Menu;
    menuItem: typeof MenuItem;
    button: typeof Button;
    group: typeof CrudMoreActionsGroup;
    divider: typeof Divider;
    chip: typeof Chip;
}> {
    selectionSize?: number;
    overallActions?: Maybe<ActionItem | ReactElement>[];
    selectiveActions?: Maybe<ActionItem | ReactElement>[];
}

interface CrudMoreActionsGroupProps {
    groupTitle?: ReactNode;
    menuListProps?: MenuListProps;
    typographyProps?: ComponentProps<typeof Typography>;
}

function CrudMoreActionsGroup({ groupTitle, children, menuListProps, typographyProps }: PropsWithChildren<CrudMoreActionsGroupProps>) {
    const { palette } = useTheme();
    return (
        <>
            {groupTitle && (
                <Typography variant="overline" color={palette.grey[500]} sx={{ padding: "20px 15px 0 15px" }} {...typographyProps}>
                    {groupTitle}
                </Typography>
            )}
            <MenuList {...menuListProps}>{children}</MenuList>
        </>
    );
}

const CrudMoreActionsDivider = createComponentSlot(Divider)<CrudMoreActionsMenuClassKey>({
    componentName: "CrudMoreActions",
    slotName: "divider",
})();

const MoreActionsSelectedItemsChip = createComponentSlot(Chip)<CrudMoreActionsMenuClassKey>({
    componentName: "CrudMoreActions",
    slotName: "chip",
})(css`
    height: 20px;
    flex-shrink: 0;
    border-radius: 20px;
    margin-left: 6px;
`);

const MoreActionsButton = createComponentSlot(Button)<CrudMoreActionsMenuClassKey>({
    componentName: "CrudMoreActions",
    slotName: "button",
})(css`
    margin: 0 10px;
    min-height: 44px;
`);

const MoreActionsMenuItem = createComponentSlot(MenuItem)<CrudMoreActionsMenuClassKey>({
    componentName: "CrudMoreActions",
    slotName: "menuItem",
})();

type CrudMoreActionsMenuContext = {
    closeMenu: () => void;
};

export const CrudMoreActionsMenuContext = createContext<CrudMoreActionsMenuContext>({
    closeMenu: () => {
        throw new Error("`CrudMoreActionsMenuContext` cannot be used outside of `CrudMoreActionsMenu`");
    },
});

export function CrudMoreActionsMenuItem({ onClick, ...props }: MenuItemProps) {
    const { closeMenu } = useContext(CrudMoreActionsMenuContext);

    const handleClick: typeof onClick = (event) => {
        onClick?.(event);
        closeMenu();
    };

    return <MoreActionsMenuItem onClick={handleClick} {...props} />;
}

export function CrudMoreActionsMenu({ slotProps, overallActions, selectiveActions, selectionSize }: CrudMoreActionsMenuProps) {
    const {
        menu: menuProps,
        button: buttonProps,
        group: groupProps,
        divider: dividerProps,
        chip: chipProps,
    } = slotProps ?? { menu: {}, button: {}, group: {}, divider: {}, chip: {} };

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);

    const handleClose = () => setAnchorEl(null);
    const hasOverallActions = !!overallActions?.length;
    const hasSelectiveActions = !!selectiveActions?.length;

    return (
        <CrudMoreActionsMenuContext.Provider value={{ closeMenu: handleClose }}>
            <MoreActionsButton variant="textDark" endIcon={<MoreVertical />} {...buttonProps} onClick={handleClick} responsive>
                <FormattedMessage id="dextinity.crudMoreActions.title" defaultMessage="More" />
                {!!selectionSize && <MoreActionsSelectedItemsChip size="small" color="primary" {...chipProps} label={selectionSize} />}
            </MoreActionsButton>
            <Menu
                keepMounted={false}
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                {...menuProps}
                onClose={(event, reason) => {
                    handleClose();
                    menuProps?.onClose?.(event, reason);
                }}
            >
                {hasOverallActions && (
                    <CrudMoreActionsGroup
                        groupTitle={
                            hasSelectiveActions ? (
                                <FormattedMessage id="dextinity.crudMoreActions.overallActions" defaultMessage="Overall actions" />
                            ) : undefined
                        }
                        {...groupProps}
                    >
                        {overallActions.map((item, index) => {
                            if (!item) {
                                return null;
                            }

                            if (isValidElement(item)) {
                                return item;
                            }

                            const { divider, label, icon, ...rest } = item as ActionItem;

                            return (
                                <div key={index}>
                                    <CrudMoreActionsMenuItem key={index} disabled={!!selectionSize} {...rest}>
                                        {!!icon && <ListItemIcon>{icon}</ListItemIcon>}
                                        <ListItemText primary={label} />
                                    </CrudMoreActionsMenuItem>
                                    {!!divider && <CrudMoreActionsDivider {...dividerProps} />}
                                </div>
                            );
                        })}
                    </CrudMoreActionsGroup>
                )}

                {hasOverallActions && hasSelectiveActions && <CrudMoreActionsDivider {...dividerProps} />}

                {hasSelectiveActions && (
                    <CrudMoreActionsGroup
                        groupTitle={
                            hasOverallActions ? (
                                <FormattedMessage id="dextinity.crudMoreActions.selectiveActions" defaultMessage="Selective actions" />
                            ) : undefined
                        }
                        {...groupProps}
                    >
                        {selectiveActions.map((item, index) => {
                            if (!item) {
                                return;
                            }

                            if (isValidElement(item)) {
                                return item;
                            }

                            const { divider, label, icon, ...rest } = item as ActionItem;

                            return (
                                <div key={index}>
                                    <CrudMoreActionsMenuItem key={index} disabled={!selectionSize} {...rest}>
                                        {!!icon && <ListItemIcon>{icon}</ListItemIcon>}
                                        <ListItemText primary={label} />
                                        {!!selectionSize && (
                                            <MoreActionsSelectedItemsChip size="small" color="primary" {...chipProps} label={selectionSize} />
                                        )}
                                    </CrudMoreActionsMenuItem>
                                    {!!divider && <CrudMoreActionsDivider {...dividerProps} />}
                                </div>
                            );
                        })}
                    </CrudMoreActionsGroup>
                )}
            </Menu>
        </CrudMoreActionsMenuContext.Provider>
    );
}

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminCrudMoreActionsMenu: CrudMoreActionsMenuProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminCrudMoreActionsMenu: CrudMoreActionsMenuClassKey;
    }

    interface Components {
        DextinityAdminCrudMoreActionsMenu?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminCrudMoreActionsMenu"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminCrudMoreActionsMenu"];
        };
    }
}
