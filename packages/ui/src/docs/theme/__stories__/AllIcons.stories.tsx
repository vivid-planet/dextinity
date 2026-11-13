import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Icon } from "../../../components/icon/Icon";
import { type DefaultIconName, type DeprecatedIconAlias, deprecatedIconAliases } from "../../../components/icon/iconRegistry";
import { Typography } from "../../../components/typography/Typography";
import { themeDecorator } from "../../../storybook/themeDecorator";
import styles from "./allIcons.module.scss";
import { iconCategories } from "./iconCategories";
import { iconSearchTerms } from "./iconSearchTerms";

function matchesSearchQuery(iconName: DefaultIconName, searchQuery: string): boolean {
    const words = [iconName, ...iconSearchTerms[iconName]].map((word) => word.toLowerCase());
    return searchQuery
        .toLowerCase()
        .split(" ")
        .every((part) => words.some((word) => word.includes(part)));
}

function IconList() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <>
            <input
                className={styles.searchField}
                type="search"
                placeholder="Search icons by name or search term"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
            />
            {iconCategories.map(({ label, iconNames }) => {
                const matchingIconNames = iconNames.filter((iconName) => matchesSearchQuery(iconName, searchQuery.trim()));
                if (matchingIconNames.length === 0) {
                    return null;
                }
                return (
                    <section key={label} className={styles.category}>
                        <Typography variant="section" className={styles.categoryTitle}>
                            {label} <span className={styles.count}>{matchingIconNames.length}</span>
                        </Typography>
                        <div className={styles.grid}>
                            {matchingIconNames.map((iconName) => (
                                <div key={iconName} className={styles.item} title={iconName}>
                                    <Icon name={iconName} className={styles.icon} />
                                    <div className={styles.label}>
                                        <Typography variant="body" className={styles.name}>
                                            {iconName}
                                        </Typography>
                                        {iconSearchTerms[iconName].length > 0 && (
                                            <Typography variant="small" className={styles.searchTerms}>
                                                {iconSearchTerms[iconName].join(", ")}
                                            </Typography>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })}
        </>
    );
}

const deprecatedAliases = Object.entries(deprecatedIconAliases) as [DeprecatedIconAlias, DefaultIconName][];

function DeprecatedAliasList() {
    return (
        <table className={styles.aliasTable}>
            <thead>
                <tr>
                    <th>Deprecated name</th>
                    <th>Icon</th>
                </tr>
            </thead>
            <tbody>
                {deprecatedAliases.map(([alias, iconName]) => (
                    <tr key={alias}>
                        <td>
                            <code>{alias}</code>
                        </td>
                        <td>
                            <span className={styles.aliasTarget}>
                                <Icon name={iconName} />
                                <code>{iconName}</code>
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

const meta = {
    title: "Foundations/Icons/All icons",
    tags: ["!dev", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
} satisfies Meta;

export default meta;

export const AllIcons: StoryObj = {
    render: () => <IconList />,
};

export const DeprecatedNames: StoryObj = {
    render: () => <DeprecatedAliasList />,
};
