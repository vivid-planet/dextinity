"use client";
import { JsonLd } from "@dextinity/site-nextjs";
import { SvgUse } from "@src/common/helpers/SvgUse";
import { PageLayout } from "@src/layout/PageLayout";
import { createSitePath } from "@src/util/createSitePath";
import { useSiteConfig } from "@src/util/SiteConfigProvider";
import clsx from "clsx";
import NextLink from "next/link";
import { useId, useState } from "react";
import ReactFocusLock from "react-focus-lock";
import { FormattedMessage } from "react-intl";
import type { BreadcrumbList, WithContext } from "schema-dts";

import type { GQLBreadcrumbsFragment } from "./Breadcrumbs.fragment.generated";
import styles from "./Breadcrumbs.module.scss";

export const Breadcrumbs = ({ scope, name, path, parentNodes }: GQLBreadcrumbsFragment) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const listId = useId();

    const baseUrl = useSiteConfig().url;
    const absoluteUrl = (nodePath: string) => `${baseUrl}${createSitePath({ path: nodePath, scope })}`;

    const breadcrumbList: WithContext<BreadcrumbList> = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            ...parentNodes.map((node, index) => ({
                "@type": "ListItem" as const,
                position: index + 1,
                name: node.name,
                item: absoluteUrl(node.path),
            })),
            {
                "@type": "ListItem" as const,
                position: parentNodes.length + 1,
                name,
            },
        ],
    };

    return (
        <>
            <JsonLd data={breadcrumbList} />
            <PageLayout grid className={styles.root}>
                <button
                    className={styles.mobileHomeButton}
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-expanded={isExpanded}
                    aria-controls={listId}
                >
                    {name}
                    <SvgUse
                        className={clsx(styles.mobileChevron, isExpanded && styles["mobileChevron--expanded"])}
                        href="/assets/icons/chevron-down.svg#root"
                        width={16}
                        height={16}
                    />
                </button>
                {parentNodes.length > 0 && (
                    <ReactFocusLock className={clsx(styles.listContainer, isExpanded && styles["listContainer--expanded"])} disabled={!isExpanded}>
                        <ol className={styles.list} id={listId}>
                            <li className={styles.mobileNavigationListElements}>
                                <button className={styles.mobileBackButton} onClick={() => setIsExpanded(false)}>
                                    <SvgUse href="/assets/icons/arrow-left.svg#root" width={16} height={16} color="inherit" />
                                    <FormattedMessage id="header.closeBreadcrumbs" defaultMessage="Close Breadcrumbs" />
                                </button>
                            </li>
                            <li className={clsx(styles.mobileNavigationListElements, styles.linkContainer)} style={{ "--breadcrumb-level": 0 }}>
                                <NextLink className={styles.link} href={createSitePath({ path: "/", scope })}>
                                    <FormattedMessage id="header.breadcrumbs.home" defaultMessage="Home" />
                                </NextLink>
                            </li>
                            {parentNodes.map((parentNode, index) => (
                                <li
                                    key={parentNode.path}
                                    className={clsx(styles.listElement, isExpanded && styles.linkContainer)}
                                    style={{ "--breadcrumb-level": index + 1 }}
                                >
                                    <SvgUse
                                        href="/assets/icons/corner-down-right.svg#root"
                                        className={clsx(styles.mobileCornerDownRightIcon, styles.linkActive)}
                                        width={16}
                                        height={16}
                                    />
                                    <NextLink
                                        className={styles.link}
                                        href={createSitePath({
                                            path: parentNode.path,
                                            scope,
                                        })}
                                    >
                                        {parentNode.name}
                                    </NextLink>
                                    <SvgUse href="/assets/icons/chevron-down.svg#root" className={styles.chevron} width={16} height={16} />
                                </li>
                            ))}
                            <li
                                className={clsx(styles.listElement, isExpanded && styles.linkContainer)}
                                style={{ "--breadcrumb-level": parentNodes.length + 1 }}
                            >
                                <SvgUse
                                    href="/assets/icons/corner-down-right.svg#root"
                                    className={clsx(styles.mobileCornerDownRightIcon, styles.linkActive)}
                                    width={16}
                                    height={16}
                                />
                                <NextLink
                                    className={clsx(styles.link, styles.linkActive)}
                                    href={createSitePath({
                                        path: path,
                                        scope,
                                    })}
                                >
                                    {name}
                                </NextLink>
                            </li>
                        </ol>
                    </ReactFocusLock>
                )}
            </PageLayout>
        </>
    );
};
