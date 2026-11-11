import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../../components/button/Button";
import { Chip } from "../../components/chip/Chip";
import { FormHelperText } from "../../components/formHelperText/FormHelperText";
import { FormLabel } from "../../components/formLabel/FormLabel";
import { Icon } from "../../components/icon/Icon";
import { IconButton } from "../../components/iconButton/IconButton";
import { Input } from "../../components/input/Input";
import { MenuSectionHeader } from "../../components/menuSectionHeader/MenuSectionHeader";
import { NavItem } from "../../components/navItem/NavItem";
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
            { name: "Pages", icon: <Icon name="page-tree" /> },
            { name: "Assets", icon: <Icon name="assets" /> },
            { name: "Target groups", icon: <Icon name="target-groups" /> },
        ];
        const [activePage, setActivePage] = useState("Pages");

        return (
            <div className={styles.showcase}>
                <div className={styles.column}>
                    <section className={styles.taskCard}>
                        <Typography variant="labelS" className={styles.taskDate}>
                            <Icon name="calendar-today" /> Due on Friday
                        </Typography>
                        <Typography variant="h3" className={styles.taskTitle}>
                            Publish the spring campaign
                        </Typography>
                        <Typography variant="bodyS" className={styles.taskMeta}>
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
                        <Typography variant="display">Aa</Typography>
                        <Typography variant="h4">Type scale</Typography>
                        <Typography variant="bodyS" className={styles.muted}>
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
                                    <NavItem
                                        icon={icon}
                                        active={name === activePage}
                                        render={<button type="button" onClick={() => setActivePage(name)} />}
                                    >
                                        {name}
                                    </NavItem>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <section className={styles.card}>
                        <Typography variant="labelS">Status</Typography>
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
                                <Typography variant="labelM">Product page</Typography>
                                <Typography variant="bodyXs" className={styles.muted}>
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
                                    <Icon name="delete" />
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
