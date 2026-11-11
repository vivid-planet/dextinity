import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Icon } from "../../../../components/icon/Icon";
import { type DefaultIconName, defaultIconNames } from "../../../../components/icon/iconRegistry";
import { Typography } from "../../../../components/typography/Typography";
import { themeDecorator } from "../../../../storybook/themeDecorator";
import styles from "./allIcons.module.scss";
import { iconSearchTerms } from "./iconSearchTerms";

const iconNames = Object.keys(defaultIconNames).filter((name): name is DefaultIconName => name in iconSearchTerms);

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
            <div className={styles.grid}>
                {iconNames
                    .filter((iconName) => matchesSearchQuery(iconName, searchQuery.trim()))
                    .map((iconName) => (
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
        </>
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
