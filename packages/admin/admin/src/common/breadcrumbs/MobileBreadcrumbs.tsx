import { type ReactNode, useState } from "react";

import type { Breadcrumb, BreadcrumbsProps, BreadcrumbsSlotProps } from "./Breadcrumbs";
import {
    ActiveItem,
    Ellipsis,
    ellipsisLabel,
    ExpandedMenu,
    ExpandedMenuActiveItem,
    ExpandedMenuActiveItemWrapper,
    ExpandedMenuItem,
    ExpandedMenuSubitemWrapper,
    MobileMenuIcon,
    MobileRootButton,
    PageTreeVerticalLine,
    Root,
    Separator,
    StartAdornment,
    ToolbarContainer,
} from "./Breadcrumbs.slots";

interface MobileBreadcrumbsProps extends Omit<BreadcrumbsProps, "iconMapping"> {
    separatorIcon: ReactNode;
    openMenuIcon: ReactNode;
    closeMenuIcon: ReactNode;
}

const ExpandedMenuEntry = ({
    item,
    indentation,
    isCurrentItem,
    onClick,
    slotProps,
}: {
    item: Breadcrumb;
    indentation: number;
    isCurrentItem: boolean;
    onClick: () => void;
    slotProps?: BreadcrumbsSlotProps;
}) => {
    const Wrapper = isCurrentItem ? ExpandedMenuActiveItemWrapper : ExpandedMenuSubitemWrapper;
    const wrapperSlotProps = isCurrentItem ? slotProps?.expandedMenuActiveItemWrapper : slotProps?.expandedMenuSubitemWrapper;

    return (
        <Wrapper ownerState={{ indentation }} to={item.url} onClick={onClick} {...wrapperSlotProps}>
            {indentation > 0 && <PageTreeVerticalLine {...slotProps?.pageTreeVerticalLine} />}
            {isCurrentItem ? (
                <ExpandedMenuActiveItem variant="subtitle2" {...slotProps?.expandedMenuActiveItem}>
                    {item.title}
                </ExpandedMenuActiveItem>
            ) : (
                <ExpandedMenuItem variant="body2" {...slotProps?.expandedMenuItem}>
                    {item.title}
                </ExpandedMenuItem>
            )}
        </Wrapper>
    );
};

export const MobileBreadcrumbs = ({
    items,
    startAdornment,
    separatorIcon,
    openMenuIcon,
    closeMenuIcon,
    slotProps,
    ...restProps
}: MobileBreadcrumbsProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const currentItem = items[items.length - 1];

    return (
        <Root {...slotProps?.root} {...restProps}>
            {Boolean(startAdornment) && <StartAdornment {...slotProps?.startAdornment}>{startAdornment}</StartAdornment>}

            <MobileRootButton onClick={() => setIsMenuOpen((prev) => !prev)} {...slotProps?.mobileRootButton}>
                <ToolbarContainer {...slotProps?.toolbarContainer}>
                    {items.length > 1 && (
                        <>
                            <Ellipsis {...slotProps?.ellipsis}>{ellipsisLabel}</Ellipsis>
                            <Separator {...slotProps?.separator}>{separatorIcon}</Separator>
                        </>
                    )}
                    <ActiveItem {...slotProps?.activeItem}>{currentItem.title}</ActiveItem>
                </ToolbarContainer>
                <MobileMenuIcon {...slotProps?.mobileMenuIcon}>{isMenuOpen ? closeMenuIcon : openMenuIcon}</MobileMenuIcon>
            </MobileRootButton>

            {isMenuOpen && (
                <ExpandedMenu {...slotProps?.expandedMenu}>
                    {items.map((item, index) => (
                        <ExpandedMenuEntry
                            key={item.url}
                            item={item}
                            indentation={index}
                            isCurrentItem={index === items.length - 1}
                            onClick={() => setIsMenuOpen(false)}
                            slotProps={slotProps}
                        />
                    ))}
                </ExpandedMenu>
            )}
        </Root>
    );
};
