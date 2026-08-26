import type { ComponentsOverrides } from "@mui/material";
import { css, type Theme, useThemeProps } from "@mui/material/styles";
import MuiTab, { type TabProps as MuiTabProps } from "@mui/material/Tab";
import MuiTabs, { type TabsProps as MuiTabsProps } from "@mui/material/Tabs";
import { type ChangeEvent, Children, type ComponentType, isValidElement, type ReactElement, type ReactNode, useState } from "react";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";
import { TabScrollButton } from "./TabScrollButton";

export type TabsClassKey = "root" | "tabs" | "content" | "contentHidden";

type OwnerState = { contentHidden?: boolean };

const Root = createComponentSlot("div")<TabsClassKey>({
    componentName: "Tabs",
    slotName: "root",
})();

const StyledTabs = createComponentSlot(MuiTabs)<TabsClassKey>({
    componentName: "Tabs",
    slotName: "tabs",
})();

const Content = createComponentSlot("div")<TabsClassKey, OwnerState>({
    componentName: "Tabs",
    slotName: "content",
    classesResolver(ownerState) {
        return [ownerState.contentHidden && "contentHidden"];
    },
})(
    ({ ownerState }) => css`
        ${ownerState.contentHidden &&
        css`
            display: none;
        `}
    `,
);

interface TabProps extends Omit<MuiTabProps, "children"> {
    label: ReactNode;
    forceRender?: boolean;
    children: ReactNode;
}

export const Tab = (props: TabProps) => null;

interface ITabsState {
    value: number;
    setValue: (value: number) => void;
}

type TabsChild = ReactElement<TabProps> | boolean | null | undefined;
type TabsChildren = TabsChild | Array<TabsChild | Array<TabsChild>>;

type BaseProps = ThemedComponentBaseProps<{
    root: "div";
    tabs: typeof MuiTabs;
    content: "div";
}>;

interface SlotProps {
    slotProps?: MuiTabsProps["slotProps"] & BaseProps["slotProps"];
}

export interface TabsProps extends Omit<MuiTabsProps, "slotProps">, Omit<BaseProps, "slotProps">, SlotProps {
    children: TabsChildren;
    tabComponent?: ComponentType<MuiTabProps>;
    defaultIndex?: number;
    tabsState?: ITabsState;
}

export function Tabs(inProps: TabsProps) {
    const {
        children,
        tabComponent: TabComponent = MuiTab,
        defaultIndex,
        tabsState,
        ScrollButtonComponent = TabScrollButton,
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminTabs" });

    let value: ITabsState["value"];
    let setValue: ITabsState["setValue"];

    const state = useState(defaultIndex !== undefined ? defaultIndex : 0);
    if (tabsState === undefined) {
        value = state[0];
        setValue = state[1];
    } else {
        value = tabsState.value;
        setValue = tabsState.setValue;
    }

    const handleChange = (event: ChangeEvent, newValue: number) => {
        setValue(newValue);
    };

    Children.forEach(children, (child: ReactElement<TabProps>) => {
        // as seen in https://github.com/mui-org/material-ui/blob/v4.11.0/packages/material-ui/src/Tabs/Tabs.js#L390
        if (!isValidElement<TabProps>(child)) {
            return null;
        }

        if (child.type !== Tab) {
            throw new Error("Tabs must contain only Tab children");
        }
    });

    return (
        <Root {...slotProps?.root}>
            <StyledTabs
                value={value}
                onChange={handleChange}
                ScrollButtonComponent={ScrollButtonComponent}
                scrollButtons="auto"
                variant="scrollable"
                {...slotProps?.tabs}
                {...restProps}
            >
                {Children.map(children, (child: ReactElement<TabProps>) => {
                    if (!isValidElement<TabProps>(child)) {
                        return null;
                    }

                    const { children, label, ...restTabProps } = child.props;
                    return <TabComponent label={label} {...restTabProps} />;
                })}
            </StyledTabs>
            {Children.map(children, (child: ReactElement<TabProps>, index) => {
                if (!isValidElement<TabProps>(child)) {
                    return null;
                }

                if (index === value || child.props.forceRender) {
                    const ownerState: OwnerState = {
                        contentHidden: index !== value && child.props.forceRender,
                    };
                    return (
                        <Content ownerState={ownerState} {...slotProps?.content}>
                            {child.props.children}
                        </Content>
                    );
                }
            })}
        </Root>
    );
}

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminTabs: TabsClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminTabs: TabsProps;
    }

    interface Components {
        DextinityAdminTabs?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminTabs"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminTabs"];
        };
    }
}
