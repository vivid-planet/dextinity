import { ClickAwayListener } from "@mui/material";
import { useForkRef } from "@mui/material/utils";
import { type ReactNode, useEffect, useRef, useState } from "react";

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
    const indentationLine = indentation > 0 && <PageTreeVerticalLine {...slotProps?.pageTreeVerticalLine} />;

    // The current item is the page the menu was opened from. It carries no action at all, so that it does not offer one
    // that only a pointer can reach.
    if (isCurrentItem) {
        return (
            <ExpandedMenuActiveItemWrapper ownerState={{ indentation }} {...slotProps?.expandedMenuActiveItemWrapper}>
                {indentationLine}
                <ExpandedMenuActiveItem variant="subtitle2" {...slotProps?.expandedMenuActiveItem}>
                    {item.title}
                </ExpandedMenuActiveItem>
            </ExpandedMenuActiveItemWrapper>
        );
    }

    return (
        <ExpandedMenuSubitemWrapper ownerState={{ indentation }} to={item.url} onClick={onClick} {...slotProps?.expandedMenuSubitemWrapper}>
            {indentationLine}
            <ExpandedMenuItem variant="body2" {...slotProps?.expandedMenuItem}>
                {item.title}
            </ExpandedMenuItem>
        </ExpandedMenuSubitemWrapper>
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
    const toggleButtonRef = useRef<HTMLButtonElement>(null);
    const mobileRootButtonRef = useForkRef(toggleButtonRef, slotProps?.mobileRootButton?.ref);
    const currentItem = items[items.length - 1];

    useEffect(() => {
        if (!isMenuOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMenuOpen(false);
                toggleButtonRef.current?.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isMenuOpen]);

    return (
        <ClickAwayListener onClickAway={() => setIsMenuOpen(false)}>
            <Root {...slotProps?.root} {...restProps}>
                {Boolean(startAdornment) && <StartAdornment {...slotProps?.startAdornment}>{startAdornment}</StartAdornment>}

                <MobileRootButton onClick={() => setIsMenuOpen((prev) => !prev)} {...slotProps?.mobileRootButton} ref={mobileRootButtonRef}>
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
        </ClickAwayListener>
    );
};
