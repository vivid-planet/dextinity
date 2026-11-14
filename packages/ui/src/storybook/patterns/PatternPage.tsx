import type { PropsWithChildren, ReactNode } from "react";

import { Icon } from "../../components/icon/Icon";
import { Panel } from "../../components/panel/Panel";
import { ShortcutList, type ShortcutListItem } from "../../components/shortcutList/ShortcutList";
import styles from "./PatternPage.module.scss";

/**
 * A pattern page's layout: its sections stacked on the light field the draft's glass panels are made for.
 */
export function PatternPage({ children }: PropsWithChildren) {
    return <div className={styles.page}>{children}</div>;
}

export interface PatternSectionProps {
    title: string;
    description?: string;
}

/**
 * One titled section of a pattern page, e.g. "Example", "Flow" or "Rules".
 */
export function PatternSection({ title, description, children }: PropsWithChildren<PatternSectionProps>) {
    return (
        <Panel title={title} description={description}>
            {children}
        </Panel>
    );
}

interface TitledItem {
    title: string;
    description: string;
}

/**
 * The pattern's flow, as numbered step cards.
 */
export function PatternSteps({ steps }: { steps: TitledItem[] }) {
    return (
        <PatternSection title="Flow">
            <ol className={styles.steps}>
                {steps.map((step, index) => (
                    <li key={step.title}>
                        <span className={styles.stepNumber}>{index + 1}</span>
                        <div>
                            <b>{step.title}</b>
                            <span>{step.description}</span>
                        </div>
                    </li>
                ))}
            </ol>
        </PatternSection>
    );
}

/**
 * A numbered list of places or layers, e.g. where a pattern applies.
 */
export function PatternLegend({ items }: { items: TitledItem[] }) {
    return (
        <ol className={styles.legend}>
            {items.map((item, index) => (
                <li key={item.title}>
                    <span className={styles.legendNumber}>{index + 1}</span>
                    <div>
                        <b>{item.title}</b>
                        <span>{item.description}</span>
                    </div>
                </li>
            ))}
        </ol>
    );
}

/**
 * The pattern's keyboard shortcuts.
 */
export function PatternShortcuts({
    title = "Keyboard shortcuts",
    description,
    shortcuts,
}: {
    title?: string;
    description?: string;
    shortcuts: ShortcutListItem[];
}) {
    return (
        <PatternSection title={title} description={description}>
            <ShortcutList shortcuts={shortcuts} />
        </PatternSection>
    );
}

/**
 * The draft's rules block: what to do, and what not to.
 */
export function PatternRules({ dos, donts }: { dos: string[]; donts: string[] }) {
    return (
        <PatternSection title="Rules">
            <div className={styles.rules}>
                <div className={styles.do}>
                    <b>
                        <Icon name="check" size="small" />
                        Do
                    </b>
                    <ul>
                        {dos.map((rule) => (
                            <li key={rule}>{rule}</li>
                        ))}
                    </ul>
                </div>
                <div className={styles.dont}>
                    <b>
                        <Icon name="close" size="small" />
                        Don't
                    </b>
                    <ul>
                        {donts.map((rule) => (
                            <li key={rule}>{rule}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </PatternSection>
    );
}

/**
 * A grid of specimens, each with a label and a caption.
 */
export function PatternSpecs({ children }: PropsWithChildren) {
    return <div className={styles.specs}>{children}</div>;
}

export function PatternSpec({ label, caption, children }: { label: string; caption?: ReactNode; children: ReactNode }) {
    return (
        <div className={styles.spec}>
            <div className={styles.specContent}>{children}</div>
            <div className={styles.specLabel}>
                <b>{label}</b>
                {caption != null && <span>{caption}</span>}
            </div>
        </div>
    );
}

const pageDocs = {
    Buttons: "building-blocks-buttons-button--docs",
    "Form fields": "building-blocks-form-fields-field--docs",
    "Selection & toggles": "building-blocks-selection-toggles-checkbox--docs",
    "Status, tags & badges": "building-blocks-status-tags-badges-statusindicator--docs",
    "Tables & paging": "building-blocks-tables-paging-datagrid--docs",
    Tree: "building-blocks-tree-treeview--docs",
    "Media & upload": "building-blocks-media-upload-dropzone--docs",
    "Blocks & preview": "building-blocks-blocks-preview-blocklist--docs",
    "Loading & save state": "building-blocks-loading-save-state-savestate--docs",
    "Menus & messages": "building-blocks-menus-messages-toast--docs",
    "Modals & overlays": "building-blocks-modals-overlays-confirmdialog--docs",
} as const;

export type PatternUsedPage = keyof typeof pageDocs;

export interface PatternLink {
    label: string;
    /** The Storybook docs id, e.g. `building-blocks-tree-treeview--docs`. */
    docsId: string;
}

/**
 * Links to other Storybook pages, as chips with an arrow.
 */
export function PatternLinks({ title, links }: { title: string; links: PatternLink[] }) {
    return (
        <PatternSection title={title}>
            <ul className={styles.uses}>
                {links.map((link) => (
                    <li key={link.label}>
                        <a href={`/?path=/docs/${link.docsId}`} target="_top">
                            {link.label}
                            <Icon name="arrow-right" />
                        </a>
                    </li>
                ))}
            </ul>
        </PatternSection>
    );
}

/**
 * Links to the building-block pages a pattern is made of.
 */
export function PatternUses({ pages }: { pages: PatternUsedPage[] }) {
    return <PatternLinks title="Components used" links={pages.map((page) => ({ label: page, docsId: pageDocs[page] }))} />;
}

/**
 * The live example of a pattern, stacked.
 */
export function PatternExample({ children }: PropsWithChildren) {
    return <div className={styles.example}>{children}</div>;
}

export const patternListClassNames = { list: styles.list, row: styles.row, rowTitle: styles.rowTitle };
