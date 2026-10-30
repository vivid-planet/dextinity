"use client";
import { SvgUse } from "@src/common/helpers/SvgUse";
import { PageLink } from "@src/layout/header/PageLink";
import { useEscapeKeyPressed } from "@src/util/useEscapeKeyPressed";
import clsx from "clsx";
import { useId, useState } from "react";
import FocusLock from "react-focus-lock";
import { useIntl } from "react-intl";

import type { GQLDesktopMenuFragment } from "./DesktopMenu.fragment.generated";
import styles from "./DesktopMenu.module.scss";

interface Props {
    menu: GQLDesktopMenuFragment;
}

export const DesktopMenu = ({ menu }: Props) => {
    const intl = useIntl();
    const [expandedSubLevelNavigation, setExpandedSubLevelNavigation] = useState<string | null>(null);
    const [autoFocus, setAutoFocus] = useState<boolean>(false);
    const sublevelMenuId = useId();

    const handleSubLevelNavigationButtonClick = (id: string) => {
        if (expandedSubLevelNavigation === id) {
            setExpandedSubLevelNavigation(null);
        } else {
            setExpandedSubLevelNavigation(id);
        }
    };

    useEscapeKeyPressed(() => {
        setExpandedSubLevelNavigation(null);
        setAutoFocus(false);
    });

    return (
        <div className={styles.desktopHeaderFullHeightNav}>
            <ol className={styles.topLevelNavigation}>
                {menu.items.map((node) => {
                    const isExpanded = expandedSubLevelNavigation === node.id;
                    const hasChildren = node.node.childNodes.length > 0;
                    return (
                        <li
                            key={node.id}
                            className={styles.topLevelLinkContainer}
                            onMouseEnter={() => setExpandedSubLevelNavigation(node.id)}
                            onMouseLeave={() => {
                                setExpandedSubLevelNavigation(null);
                                setAutoFocus(false);
                            }}
                        >
                            <div className={styles.linkContainer}>
                                <PageLink page={node.node} activeClassName={styles["menuPageLink--active"]} className={styles.menuPageLink}>
                                    {node.node.name}
                                </PageLink>
                                {hasChildren && (
                                    <button
                                        className={styles.toggleSubLevelNavigationButton}
                                        aria-label={intl.formatMessage(
                                            {
                                                id: "header.subMenu.arialLabel",
                                                defaultMessage: "Submenu of {name}",
                                            },
                                            { name: node.node.name },
                                        )}
                                        aria-controls={sublevelMenuId}
                                        aria-expanded={isExpanded}
                                        onClick={() => {
                                            setAutoFocus(true);
                                            handleSubLevelNavigationButtonClick(node.id);
                                        }}
                                    >
                                        <SvgUse
                                            href="/assets/icons/chevron-down.svg#root"
                                            className={clsx(styles.animatedChevron, isExpanded && styles["animatedChevron--expanded"])}
                                        />
                                    </button>
                                )}
                            </div>
                            {hasChildren && (
                                <FocusLock disabled={!isExpanded} autoFocus={autoFocus}>
                                    <ol
                                        id={sublevelMenuId}
                                        className={clsx(styles.subLevelNavigation, isExpanded && styles["subLevelNavigation--expanded"])}
                                    >
                                        <button
                                            className={styles.closeSublevelNavigationButton}
                                            onClick={() => setExpandedSubLevelNavigation(null)}
                                            aria-label={intl.formatMessage(
                                                {
                                                    id: "header.subMenu.closeButton",
                                                    defaultMessage: "Close submenu of {name}",
                                                },
                                                { name: node.node.name },
                                            )}
                                            aria-controls={sublevelMenuId}
                                        >
                                            <SvgUse href="/assets/icons/menu-open.svg#root" width={16} height={16} />
                                        </button>
                                        {node.node.childNodes.map((childNode) => (
                                            <li key={childNode.id}>
                                                <PageLink
                                                    page={childNode}
                                                    activeClassName={styles["menuPageLink--active"]}
                                                    className={styles.menuPageLink}
                                                >
                                                    {childNode.name}
                                                </PageLink>
                                            </li>
                                        ))}
                                    </ol>
                                </FocusLock>
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};
