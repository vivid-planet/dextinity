"use client";
import { Button } from "@src/common/components/Button";
import { PageLink } from "@src/layout/header/PageLink";
import { FormattedMessage } from "react-intl";

import type { GQLTopMenuPageTreeNodeFragment } from "./TopNavigation.fragment.generated";
import styles from "./TopNavigation.module.scss";

interface Props {
    data: GQLTopMenuPageTreeNodeFragment[];
}

export const TopNavigation = ({ data }: Props) => {
    return (
        <>
            <a className={styles.skipLink} href="#mainContent">
                <Button as="span">
                    <FormattedMessage defaultMessage="Skip to main content" id="skipLink.skipToMainContent" />
                </Button>
            </a>
            <a className={styles.skipLink} href="#footer">
                <Button as="span">
                    <FormattedMessage defaultMessage="Skip to footer" id="skipLink.skipToFooter" />
                </Button>
            </a>
            <ol className={styles.topLevelNavigation}>
                {data.map((item) => (
                    <li className={styles.topLevelLinkContainer} key={item.id}>
                        <PageLink page={item} activeClassName={styles.linkActive} className={styles.link}>
                            {item.name}
                        </PageLink>
                        {item.childNodes.length > 0 && (
                            <ol className={styles.subLevelNavigation}>
                                {item.childNodes.map((node) => (
                                    <li key={node.id}>
                                        <PageLink page={node} activeClassName={styles.linkActive} className={styles.link}>
                                            {node.name}
                                        </PageLink>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </li>
                ))}
            </ol>
        </>
    );
};
