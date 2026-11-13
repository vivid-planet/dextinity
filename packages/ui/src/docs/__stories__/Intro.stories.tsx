import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../../components/button/Button";
import { Chip } from "../../components/chip/Chip";
import { FormHelperText } from "../../components/formHelperText/FormHelperText";
import { FormLabel } from "../../components/formLabel/FormLabel";
import { Icon } from "../../components/icon/Icon";
import { IconButton } from "../../components/iconButton/IconButton";
import { Input } from "../../components/input/Input";
import { MainNavigationItem } from "../../components/mainNavigationItem/MainNavigationItem";
import { MenuSectionHeader } from "../../components/menuSectionHeader/MenuSectionHeader";
import { Typography } from "../../components/typography/Typography";
import { themeDecorator } from "../../storybook/themeDecorator";
import styles from "./intro.module.scss";

const meta = {
    title: "Intro",
    tags: ["!dev", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
    render: function Render() {
        const contentPages = [
            { name: "Pages", icon: <Icon name="sitemap" /> },
            { name: "Assets", icon: <Icon name="images" /> },
            { name: "Target groups", icon: <Icon name="target-group" /> },
        ];
        const [activePage, setActivePage] = useState("Pages");

        return (
            <div className={styles.showcase}>
                <div className={styles.column}>
                    <section className={styles.taskCard}>
                        <Typography variant="label" className={styles.taskDate}>
                            <Icon name="cal-today" /> Due on Friday
                        </Typography>
                        <Typography variant="title" className={styles.taskTitle}>
                            Publish the spring campaign
                        </Typography>
                        <Typography variant="small" className={styles.taskMeta}>
                            3 of 5 pages ready
                        </Typography>
                    </section>

                    <section className={styles.card}>
                        <div className={styles.field}>
                            <FormLabel htmlFor="showcase-title" required>
                                Page title
                            </FormLabel>
                            <Input id="showcase-title" required defaultValue="Spring campaign" aria-describedby="showcase-title-hint" />
                            <FormHelperText id="showcase-title-hint">Shown in the browser tab and in search results.</FormHelperText>
                        </div>
                        <div className={styles.actions}>
                            <Button variant="outlined">Cancel</Button>
                            <Button>Save</Button>
                        </div>
                    </section>
                    <section className={styles.card}>
                        <Typography variant="displayL">Aa</Typography>
                        <Typography variant="section">Type scale</Typography>
                        <Typography variant="small" className={styles.muted}>
                            Headings, body text, labels, and data in one font.
                        </Typography>
                    </section>
                </div>
                <div className={styles.column}>
                    <nav aria-label="Showcase navigation" className={styles.card}>
                        <MenuSectionHeader slotProps={{ label: { id: "showcase-content" } }}>Content</MenuSectionHeader>
                        <ul aria-labelledby="showcase-content" className={styles.list}>
                            {contentPages.map(({ name, icon }) => (
                                <li key={name}>
                                    <MainNavigationItem
                                        icon={icon}
                                        active={name === activePage}
                                        render={<button type="button" onClick={() => setActivePage(name)} />}
                                    >
                                        {name}
                                    </MainNavigationItem>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <section className={styles.card}>
                        <Typography variant="label">Status</Typography>
                        <div className={styles.chips}>
                            <Chip color="secondary">Draft</Chip>
                            <Chip color="info">In review</Chip>
                            <Chip color="success">Published</Chip>
                            <Chip color="warning">Expires soon</Chip>
                            <Chip color="error">Offline</Chip>
                        </div>
                    </section>
                    <section className={styles.card}>
                        <div className={styles.recordRow}>
                            <div>
                                <Typography variant="body">Product page</Typography>
                                <Typography variant="small" className={styles.muted}>
                                    Edited 2 hours ago
                                </Typography>
                            </div>
                            <div className={styles.iconActions}>
                                <IconButton variant="text" aria-label="Edit">
                                    <Icon name="edit" />
                                </IconButton>
                                <IconButton variant="text" aria-label="Duplicate">
                                    <Icon name="copy" />
                                </IconButton>
                                <IconButton variant="text" color="error" aria-label="Delete">
                                    <Icon name="trash" />
                                </IconButton>
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <Button variant="outlined" disabled>
                                Cancel
                            </Button>
                            <Button loading>Publish</Button>
                        </div>
                    </section>
                </div>
            </div>
        );
    },
};
