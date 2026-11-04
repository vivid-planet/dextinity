"use client";
import { SvgUse } from "@src/common/helpers/SvgUse";
import { PageLink } from "@src/layout/header/PageLink";
import { PageLayout } from "@src/layout/PageLayout";
import { useEscapeKeyPressed } from "@src/util/useEscapeKeyPressed";
import clsx from "clsx";
import { useState } from "react";
import FocusLock from "react-focus-lock";
import { FormattedMessage, useIntl } from "react-intl";

import type { GQLMobileMenuFragment } from "./MobileMenu.fragment.generated";
import styles from "./MobileMenu.module.scss";

interface Props {
    menu: GQLMobileMenuFragment;
}

export const MobileMenu = ({ menu }: Props) => {
    const intl = useIntl();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [expandedSubLevelNavigation, setExpandedSubLevelNavigation] = useState<string | null>(null);

    const handleMenuButtonClick = () => {
        if (isMenuOpen) {
            setExpandedSubLevelNavigation(null);
            setIsMenuOpen(false);
        } else {
            setIsMenuOpen(true);
        }
    };

    const handleSubLevelNavigationButtonClick = (id: string) => {
        if (expandedSubLevelNavigation === id) {
            setExpandedSubLevelNavigation(null);
        } else {
            setExpandedSubLevelNavigation(id);
        }
    };

    useEscapeKeyPressed(() => {
        if (expandedSubLevelNavigation !== null) {
            setExpandedSubLevelNavigation(null);
        } else {
            setIsMenuOpen(false);
        }
    });

    return (
        <div className={styles.root}>
            <button
                className={styles.menuButton}
                aria-label={intl.formatMessage({
                    id: "header.menu.arialLabel",
                    defaultMessage: "Menu",
                })}
                aria-expanded={isMenuOpen}
                onClick={handleMenuButtonClick}
            >
                <SvgUse href={isMenuOpen ? "/assets/icons/menu-open.svg#root" : "/assets/icons/menu.svg#root"} width={24} height={24} />
            </button>
            <div className={clsx(styles.menuContainer, isMenuOpen && styles["menuContainer--open"])} aria-hidden={!isMenuOpen}>
                <PageLayout grid>
                    <div className={styles.pageLayoutContent}>
                        <FocusLock>
                            <ol className={styles.topLevelNavigation}>
                                <li>
                                    <button
                                        className={styles.backButton}
                                        aria-label={intl.formatMessage({
                                            id: "header.closeButton.arialLabel",
                                            defaultMessage: "Close Menu",
                                        })}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <SvgUse href="/assets/icons/arrow-left.svg#root" width={16} height={16} color="inherit" />
                                        <FormattedMessage id="header.closeMenu" defaultMessage="Close Menu" />
                                    </button>
                                </li>
                                {menu.items.map((node) => {
                                    return (
                                        <li key={node.id}>
                                            {node.node.childNodes.length > 0 ? (
                                                <button
                                                    className={styles.menuItemButton}
                                                    aria-label={intl.formatMessage(
                                                        {
                                                            id: "header.subMenu.arialLabel",
                                                            defaultMessage: "Submenu of {name}",
                                                        },
                                                        { name: node.node.name },
                                                    )}
                                                    aria-expanded={expandedSubLevelNavigation === node.id}
                                                    onClick={() => handleSubLevelNavigationButtonClick(node.id)}
                                                >
                                                    {node.node.name}
                                                    <SvgUse href="/assets/icons/arrow-right.svg#root" width={16} height={16} color="inherit" />
                                                </button>
                                            ) : (
                                                <PageLink page={node.node} className={styles.link}>
                                                    {node.node.name}
                                                </PageLink>
                                            )}
                                            {node.node.childNodes.length > 0 && (
                                                <FocusLock disabled={expandedSubLevelNavigation !== node.id}>
                                                    <ol
                                                        className={clsx(
                                                            styles.subLevelNavigation,
                                                            expandedSubLevelNavigation === node.id && styles["subLevelNavigation--expanded"],
                                                        )}
                                                    >
                                                        <PageLayout grid>
                                                            <div className={styles.pageLayoutContent}>
                                                                <li>
                                                                    <button
                                                                        className={styles.backButton}
                                                                        aria-label={intl.formatMessage({
                                                                            id: "header.backButton.arialLabel",
                                                                            defaultMessage: "Go back",
                                                                        })}
                                                                        onClick={() => setExpandedSubLevelNavigation(null)}
                                                                    >
                                                                        <SvgUse
                                                                            href="/assets/icons/arrow-left.svg#root"
                                                                            width={16}
                                                                            height={16}
                                                                            color="inherit"
                                                                        />
                                                                        <FormattedMessage id="header.back" defaultMessage="Back" />
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <PageLink page={node.node} className={styles.overviewButton}>
                                                                        <SvgUse
                                                                            href="/assets/icons/overview.svg#root"
                                                                            width={16}
                                                                            height={16}
                                                                            color="inherit"
                                                                        />
                                                                        <FormattedMessage id="header.overview" defaultMessage="Overview" />
                                                                        <span aria-hidden="true"> | </span>
                                                                        {node.node.name}
                                                                    </PageLink>
                                                                </li>
                                                                {node.node.childNodes.map((childNode) => (
                                                                    <li key={childNode.id}>
                                                                        <PageLink page={childNode} className={styles.link}>
                                                                            {childNode.name}
                                                                        </PageLink>
                                                                    </li>
                                                                ))}
                                                            </div>
                                                        </PageLayout>
                                                    </ol>
                                                </FocusLock>
                                            )}
                                        </li>
                                    );
                                })}
                            </ol>
                        </FocusLock>
                    </div>
                </PageLayout>
            </div>
        </div>
    );
};
