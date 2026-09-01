import { ChevronRight } from "@comet/admin-icons";
import { Typography } from "@mui/material";
import { type ReactNode, type Ref, useEffect, useRef, useState } from "react";

import type { Breadcrumb, BreadcrumbsProps, BreadcrumbsSlotProps } from "./Breadcrumbs";
import {
    ActiveItem,
    Ellipsis,
    ellipsisLabel,
    Item,
    MeasureLayer,
    MenuContainer,
    OverflowButton,
    OverflowMenu,
    OverflowMenuItem,
    Root,
    Separator,
    ToolbarContainer,
} from "./Breadcrumbs.slots";
import { useBreadcrumbsOverflow } from "./useBreadcrumbsOverflow";

interface DesktopBreadcrumbsProps extends Omit<BreadcrumbsProps, "iconMapping"> {
    separatorIcon: ReactNode;
}

const BreadcrumbItemLink = ({ item, separatorIcon, slotProps }: { item: Breadcrumb; separatorIcon: ReactNode; slotProps?: BreadcrumbsSlotProps }) => (
    <MenuContainer ownerState={{ isCurrentItem: false }} {...slotProps?.menuContainer}>
        {/* @ts-expect-error The component prop does not work properly with MUIs `styled()`, see: https://mui.com/material-ui/guides/typescript/#complications-with-the-component-prop */}
        <Item component="a" href={item.url} {...slotProps?.item}>
            {item.title}
        </Item>
        <Separator {...slotProps?.separator}>{separatorIcon}</Separator>
    </MenuContainer>
);

const CurrentBreadcrumbItem = ({ item, slotProps }: { item: Breadcrumb; slotProps?: BreadcrumbsSlotProps }) => (
    <MenuContainer ownerState={{ isCurrentItem: true }} {...slotProps?.menuContainer}>
        <ActiveItem {...slotProps?.activeItem}>{item.title}</ActiveItem>
    </MenuContainer>
);

const OverflowEllipsis = ({
    separatorIcon,
    slotProps,
    onClick,
    buttonRef,
}: {
    separatorIcon: ReactNode;
    slotProps?: BreadcrumbsSlotProps;
    onClick?: () => void;
    buttonRef?: Ref<HTMLButtonElement>;
}) => (
    <MenuContainer ownerState={{ isCurrentItem: false }} {...slotProps?.menuContainer}>
        <OverflowButton ref={buttonRef} onClick={onClick} {...slotProps?.overflowButton}>
            <Ellipsis {...slotProps?.ellipsis}>{ellipsisLabel}</Ellipsis>
        </OverflowButton>
        <Separator {...slotProps?.separator}>{separatorIcon}</Separator>
    </MenuContainer>
);

export const DesktopBreadcrumbs = ({ items, separatorIcon, slotProps, ...restProps }: DesktopBreadcrumbsProps) => {
    const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);
    const overflowButtonRef = useRef<HTMLButtonElement>(null);

    const { leadingItem, hiddenItems, trailingItems } = useBreadcrumbsOverflow({ items, containerRef: toolbarRef, measureRef });
    const hasHiddenItems = hiddenItems.length > 0;

    useEffect(() => {
        if (!hasHiddenItems) {
            setIsOverflowMenuOpen(false);
        }
    }, [hasHiddenItems]);

    return (
        <Root {...slotProps?.root} {...restProps}>
            <ToolbarContainer ref={toolbarRef} {...slotProps?.toolbarContainer}>
                {leadingItem && <BreadcrumbItemLink item={leadingItem} separatorIcon={separatorIcon} slotProps={slotProps} />}
                {hasHiddenItems && (
                    <OverflowEllipsis
                        separatorIcon={separatorIcon}
                        slotProps={slotProps}
                        onClick={() => setIsOverflowMenuOpen((prev) => !prev)}
                        buttonRef={overflowButtonRef}
                    />
                )}
                {trailingItems.map((item, index) =>
                    index === trailingItems.length - 1 ? (
                        <CurrentBreadcrumbItem key={item.url} item={item} slotProps={slotProps} />
                    ) : (
                        <BreadcrumbItemLink key={item.url} item={item} separatorIcon={separatorIcon} slotProps={slotProps} />
                    ),
                )}
            </ToolbarContainer>

            <MeasureLayer ref={measureRef} aria-hidden>
                {items.map((item, index) =>
                    index === items.length - 1 ? (
                        <CurrentBreadcrumbItem key={item.url} item={item} slotProps={slotProps} />
                    ) : (
                        <BreadcrumbItemLink key={item.url} item={item} separatorIcon={separatorIcon} slotProps={slotProps} />
                    ),
                )}
                <OverflowEllipsis separatorIcon={separatorIcon} slotProps={slotProps} />
            </MeasureLayer>

            {hasHiddenItems && (
                <OverflowMenu
                    open={isOverflowMenuOpen}
                    anchorEl={overflowButtonRef.current}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                    marginThreshold={0}
                    onClose={() => setIsOverflowMenuOpen(false)}
                    {...slotProps?.overflowMenu}
                >
                    {hiddenItems.map((item) => (
                        <OverflowMenuItem key={item.url} href={item.url} {...slotProps?.overflowMenuItem}>
                            <ChevronRight />
                            <Typography variant="body2">{item.title}</Typography>
                        </OverflowMenuItem>
                    ))}
                </OverflowMenu>
            )}
        </Root>
    );
};
