import { Icon, IconButton, Menu, MenuItem, Tabs } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { useLayoutEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";

import { RouterTabLink } from "../../common/RouterTabLink";

interface EditorTabBarTab {
    key: string;
    label: string;
    invalid?: boolean;
}

interface EditorTabBarProps {
    tabs: EditorTabBarTab[];
    selectedKey: string | undefined;
    getTabUrl: (key: string) => string;
}

/**
 * The tabs of a block content editor as router links. The tabs that don't fit the panel move into a "More tabs" menu at the end; the
 * selected tab always stays in the bar.
 */
export function EditorTabBar({ tabs, selectedKey, getTabUrl }: EditorTabBarProps) {
    const intl = useIntl();
    const history = useHistory();
    const rowRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);
    const [fittingCount, setFittingCount] = useState(tabs.length);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useLayoutEffect(() => {
        const row = rowRef.current;
        const measure = measureRef.current;
        if (row == null || measure == null) {
            return;
        }

        const updateFittingCount = () => {
            const rowStyle = getComputedStyle(row);
            const availableWidth = row.clientWidth - parseFloat(rowStyle.paddingInlineStart) - parseFloat(rowStyle.paddingInlineEnd);
            const list = measure.querySelector<HTMLElement>("[role=tablist]");
            const gap = list != null ? parseFloat(getComputedStyle(list).columnGap) || 0 : 0;
            const tabWidths = Array.from(measure.querySelectorAll<HTMLElement>("[role=tab]")).map((tab) => tab.getBoundingClientRect().width);
            const widthOf = (count: number) => tabWidths.slice(0, count).reduce((sum, width) => sum + width, 0) + gap * Math.max(count - 1, 0);

            if (widthOf(tabWidths.length) <= availableWidth) {
                setFittingCount(tabWidths.length);
                return;
            }
            const widthWithMoreButton = (count: number) => widthOf(count) + gap + moreButtonWidth;
            let count = tabWidths.length - 1;
            while (count > 1 && widthWithMoreButton(count) > availableWidth) {
                count--;
            }
            setFittingCount(count);
        };

        updateFittingCount();
        const resizeObserver = new ResizeObserver(updateFittingCount);
        resizeObserver.observe(row);
        resizeObserver.observe(measure);
        return () => resizeObserver.disconnect();
    }, [tabs.length]);

    const toItem = (tab: EditorTabBarTab) => ({
        value: tab.key,
        label: tab.label,
        href: getTabUrl(tab.key),
        tone: tab.invalid ? ("error" as const) : ("default" as const),
    });
    const labels = { error: intl.formatMessage({ id: "dextinity.pageEditor.tabInvalid", defaultMessage: "Contains errors" }) };
    const ariaLabel = intl.formatMessage({ id: "dextinity.pageEditor.tabs", defaultMessage: "Editor" });

    const selectedIndex = tabs.findIndex((tab) => tab.key === selectedKey);
    let visibleTabs = tabs.slice(0, fittingCount);
    if (selectedIndex >= fittingCount) {
        visibleTabs = [...tabs.slice(0, fittingCount - 1), tabs[selectedIndex]];
    }
    const overflowTabs = tabs.filter((tab) => !visibleTabs.includes(tab));

    return (
        <Root ref={rowRef}>
            <TabList
                aria-label={ariaLabel}
                value={selectedKey ?? ""}
                onChange={() => {
                    // The tabs are router links, which navigate themselves; the route decides the selected tab
                }}
                items={visibleTabs.map(toItem)}
                labels={labels}
                slots={{ tab: RouterTabLink }}
            />
            {overflowTabs.length > 0 && (
                <Menu
                    open={isMenuOpen}
                    onOpenChange={setIsMenuOpen}
                    placement="bottom-end"
                    trigger={
                        <IconButton
                            variant="text"
                            color={overflowTabs.some((tab) => tab.invalid) ? "error" : "secondary"}
                            size="small"
                            aria-label={intl.formatMessage({ id: "dextinity.pageEditor.moreTabs", defaultMessage: "More tabs" })}
                        >
                            <Icon name="more-horizontal" />
                        </IconButton>
                    }
                >
                    {overflowTabs.map((tab) => (
                        <MenuItem
                            key={tab.key}
                            label={tab.invalid ? `${tab.label} – ${labels.error}` : tab.label}
                            icon={tab.invalid ? <Icon name="error" /> : undefined}
                            onClick={() => {
                                setIsMenuOpen(false);
                                history.push(getTabUrl(tab.key));
                            }}
                        />
                    ))}
                </Menu>
            )}
            <Measure ref={measureRef} aria-hidden inert>
                <Tabs aria-label={ariaLabel} value={selectedKey ?? ""} onChange={() => {}} items={tabs.map(toItem)} labels={labels} />
            </Measure>
        </Root>
    );
}

// The width of the small "More tabs" button
const moreButtonWidth = 32;

const Root = styled("div")`
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--dextinity-space-1);
    padding-inline: var(--dextinity-panel-padding);
    padding-block-start: var(--dextinity-space-2);
`;

const TabList = styled(Tabs)`
    flex: 1;
    min-inline-size: 0;
` as typeof Tabs;

const Measure = styled("div")`
    position: absolute;
    inset-inline-start: 0;
    inset-block-start: 0;
    visibility: hidden;
    pointer-events: none;
    white-space: nowrap;
`;
