import { type ReactNode, useState } from "react";

import { Avatar } from "../../../components/avatar/Avatar";
import { Button } from "../../../components/button/Button";
import { Card } from "../../../components/card/Card";
import { CardRow } from "../../../components/card/CardRow";
import { Icon } from "../../../components/icon/Icon";
import { IconButton } from "../../../components/iconButton/IconButton";
import { Menu } from "../../../components/menu/Menu";
import { MenuItem } from "../../../components/menu/MenuItem";
import { MenuRadioGroup } from "../../../components/menu/MenuRadioGroup";
import { MenuRadioItem } from "../../../components/menu/MenuRadioItem";
import { PageHeader } from "../../../components/pageHeader/PageHeader";
import { PageTypeShell } from "../../pageTypes/PageTypeShell";
import styles from "./WidgetHeaderVariants.module.scss";

const recentlyEdited = [
    { title: "Open positions", path: "/careers/open-positions", editor: "Anna Klein", time: "12 min ago" },
    { title: "Senior UX Designer", path: "/careers/senior-ux-designer", editor: "Max Mustermann", time: "1 h ago" },
    { title: "About us", path: "/about-us", editor: "Lena Berger", time: "Yesterday" },
];

const periods = [
    { value: "today", label: "Today" },
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 3 months" },
];

function Rows() {
    return recentlyEdited.map((page) => (
        <CardRow
            key={page.path}
            href="#page-tree"
            title={page.title}
            subtitle={page.path}
            end={
                <>
                    <Avatar name={page.editor} size="small" />
                    {page.time}
                </>
            }
        />
    ));
}

function PeriodMenu() {
    const [open, setOpen] = useState(false);
    const [period, setPeriod] = useState("7");

    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            trigger={
                <Button variant="text" color="secondary" size="small" endIcon={<Icon name="chevron-down" />}>
                    {periods.find((option) => option.value === period)?.label}
                </Button>
            }
        >
            <MenuRadioGroup aria-label="Period" value={period} onChange={setPeriod}>
                {periods.map((option) => (
                    <MenuRadioItem key={option.value} value={option.value} label={option.label} />
                ))}
            </MenuRadioGroup>
        </Menu>
    );
}

function MoreMenu() {
    const [open, setOpen] = useState(false);

    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            trigger={
                <IconButton variant="text" color="secondary" size="small" aria-label="More actions">
                    <Icon name="more-horizontal" />
                </IconButton>
            }
        >
            <MenuItem label="Open page tree" icon={<Icon name="page-tree" />} />
            <MenuItem label="Refresh" icon={<Icon name="refresh" />} />
            <MenuItem label="Hide widget" icon={<Icon name="eye-off" />} />
        </Menu>
    );
}

function DetailsButton() {
    return (
        <IconButton variant="text" color="secondary" size="small" aria-label="Open page tree">
            <Icon name="arrow-right" />
        </IconButton>
    );
}

function Variant({ letter, name, description, children }: { letter: string; name: string; description: string; children: ReactNode }) {
    return (
        <div className={styles.variant}>
            <p className={styles.label}>
                <strong>
                    {letter} · {name}
                </strong>{" "}
                {description}
            </p>
            {children}
        </div>
    );
}

/**
 * Five header versions of the "Recently edited" widget without the header bar: the header lies on the card's own fill, with the
 * title at the start and the actions at the end.
 */
export function WidgetHeaderVariants() {
    return (
        <PageTypeShell currentId="dashboard">
            <PageHeader eyebrow="Exploration" title="Widget headers" subtitle="Recently edited, without the header bar, in five versions" />
            <div className={styles.grid}>
                <Variant letter="A" name="Arrow" description="Title, and an arrow to the full view.">
                    <Card className={styles.plain} title="Recently edited" link={<DetailsButton />}>
                        <Rows />
                    </Card>
                </Variant>

                <Variant letter="B" name="Context menu" description="Icon and title, the actions in a menu.">
                    <Card className={styles.plain} title="Recently edited" icon={<Icon name="clock" />} link={<MoreMenu />}>
                        <Rows />
                    </Card>
                </Variant>

                <Variant letter="C" name="Text button" description="Title with a count, and a named link to the full view.">
                    <Card
                        className={styles.plain}
                        title="Recently edited"
                        meta="12 pages"
                        link={
                            <Button variant="text" color="secondary" size="small" endIcon={<Icon name="arrow-right" />}>
                                Page tree
                            </Button>
                        }
                    >
                        <Rows />
                    </Card>
                </Variant>

                <Variant letter="D" name="Period and arrow" description="A period to filter by, then the arrow to the full view.">
                    <Card
                        className={styles.plain}
                        title="Recently edited"
                        link={
                            <>
                                <PeriodMenu />
                                <DetailsButton />
                            </>
                        }
                    >
                        <Rows />
                    </Card>
                </Variant>

                <Variant letter="E" name="Full toolbar" description="Period, an own action, and a menu, with a line under the header.">
                    <Card
                        className={styles.plain}
                        title="Recently edited"
                        slotProps={{ header: { className: styles.divided } }}
                        link={
                            <>
                                <PeriodMenu />
                                <Button variant="outlined" color="secondary" size="small" startIcon={<Icon name="plus" />}>
                                    New page
                                </Button>
                                <MoreMenu />
                            </>
                        }
                    >
                        <Rows />
                    </Card>
                </Variant>
            </div>
        </PageTypeShell>
    );
}
