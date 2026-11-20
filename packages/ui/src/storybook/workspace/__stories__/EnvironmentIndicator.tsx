import { type PropsWithChildren, useState } from "react";

import { AppShell } from "../../../components/appShell/AppShell";
import { useAppShellContext } from "../../../components/appShell/appShellContext";
import { Button } from "../../../components/button/Button";
import { Card } from "../../../components/card/Card";
import { Icon } from "../../../components/icon/Icon";
import { PageHeader } from "../../../components/pageHeader/PageHeader";
import { SegmentedControl } from "../../../components/segmentedControl/SegmentedControl";
import { sideNavGroups } from "../../../components/sideNav/__stories__/sideNavStoryData";
import { getSideNavAncestorIds, SideNav } from "../../../components/sideNav/SideNav";
import { StoryScopeSwitcher, StoryUserMenu } from "../../../components/topBar/__stories__/topBarStoryParts";
import { TopBar } from "../../../components/topBar/TopBar";
import { ProductLogo, ProductSign } from "../../ProductLogo";
import styles from "./EnvironmentIndicator.module.scss";

export type Environment = "dev" | "test" | "staging" | "prelive" | "prod";

export type EnvironmentIndicatorVariant = "navLabel" | "banner" | "edge";

const environments: Record<Environment, { label: string; short: string; host: string }> = {
    dev: { label: "Development", short: "Dev", host: "admin.dev.example.com" },
    test: { label: "Test", short: "Test", host: "admin.test.example.com" },
    staging: { label: "Staging", short: "Staging", host: "admin.staging.example.com" },
    prelive: { label: "Pre-live", short: "Pre-live", host: "admin.prelive.example.com" },
    prod: { label: "Production", short: "Prod", host: "admin.example.com" },
};

/** The label of the instance, e.g. "Staging". Production has none: whatever isn't marked is live. */
function EnvironmentLabel({
    environment,
    size = "default",
    className,
}: {
    environment: Environment;
    size?: "default" | "small";
    className?: string;
}) {
    const { label, short } = environments[environment];
    return (
        <span
            className={[styles.label, className].filter(Boolean).join(" ")}
            data-environment={environment}
            data-size={size}
            title={`${label} instance`}
        >
            {size === "small" ? short.slice(0, 1) : short}
        </span>
    );
}

/** On narrow windows the navigation sits in a drawer, so the label moves into the top bar to stay in view. */
function TopBarEnvironmentLabel({ environment }: { environment: Environment }) {
    const layout = useAppShellContext()?.layout;
    return layout === "narrow" ? <EnvironmentLabel environment={environment} /> : null;
}

function Nav({ variant, environment }: { variant: EnvironmentIndicatorVariant; environment: Environment }) {
    const [currentId, setCurrentId] = useState("job-ads");
    const [expandedIds, setExpandedIds] = useState(getSideNavAncestorIds(sideNavGroups, "job-ads"));
    const marked = environment !== "prod" && variant !== "banner";
    return (
        <SideNav
            logo={
                <>
                    <ProductLogo />
                    {marked && <EnvironmentLabel environment={environment} className={styles.cornerLabel} />}
                </>
            }
            logoMark={
                <>
                    <ProductSign />
                    {marked && <EnvironmentLabel environment={environment} size="small" className={styles.markLabel} />}
                </>
            }
            groups={sideNavGroups}
            currentId={currentId}
            expandedIds={expandedIds}
            onExpandedIdsChange={setExpandedIds}
            onNavigate={(item, event) => {
                event.preventDefault();
                setCurrentId(item.id);
            }}
            slotProps={{ header: { className: styles.navHeader } }}
        />
    );
}

function Banner({ environment }: { environment: Environment }) {
    const { label, host } = environments[environment];
    return (
        <div className={styles.banner} data-environment={environment} role="status">
            <strong>{label}</strong>
            <span className={styles.bannerHost}>{host}</span>
            <span className={styles.bannerNote}>Not the live system: changes here don't reach the website.</span>
        </div>
    );
}

function Shell({ variant, environment, children }: PropsWithChildren<{ variant: EnvironmentIndicatorVariant; environment: Environment }>) {
    const [navCollapsed, setNavCollapsed] = useState(false);
    const marked = environment !== "prod";
    return (
        <div className={styles.frame} data-variant={variant} data-environment={environment} data-marked={marked ? "" : undefined}>
            {marked && variant === "banner" && <Banner environment={environment} />}
            {marked && variant === "edge" && <div className={styles.edge} data-environment={environment} aria-hidden />}
            <AppShell
                nav={<Nav variant={variant} environment={environment} />}
                topBar={
                    <TopBar
                        onSearchClick={() => undefined}
                        scope={
                            <span className={styles.topBarStart}>
                                {marked && variant !== "banner" && <TopBarEnvironmentLabel environment={environment} />}
                                <StoryScopeSwitcher />
                            </span>
                        }
                        userMenu={<StoryUserMenu />}
                    />
                }
                navCollapsed={navCollapsed}
                onNavCollapsedChange={setNavCollapsed}
                disableKeyboardShortcuts
            >
                {children}
            </AppShell>
        </div>
    );
}

const variantTexts: Record<EnvironmentIndicatorVariant, { title: string; description: string }> = {
    navLabel: {
        title: "A · Label in the navigation",
        description:
            "A small label in the corner of the navigation's header, next to the logo. Collapsed, a dot with the initial sits on the sign; on phones, where the navigation is a drawer, the label moves into the top bar.",
    },
    banner: {
        title: "B · Banner above the app",
        description:
            "A low bar over the full width, above the navigation and the top bar, with the instance, its address, and a sentence on what that means. Can't be missed, takes 28 px of height on every page.",
    },
    edge: {
        title: "C · Edge and label",
        description:
            "A 4 px line in the instance's color along the window's top edge, plus the label of A. The line is seen out of the corner of the eye on every page, also with the navigation collapsed; the label says which instance it is.",
    },
};

/**
 * A proposal for marking the instance an app runs on, e.g. Staging, so that nobody mistakes it for the live system. Production
 * stays unmarked.
 */
export function EnvironmentIndicatorProposal({ variant }: { variant: EnvironmentIndicatorVariant }) {
    const [environment, setEnvironment] = useState<Environment>("staging");
    const text = variantTexts[variant];
    return (
        <Shell variant={variant} environment={environment}>
            <PageHeader
                eyebrow="Content · Careers"
                title="Job ads"
                subtitle="47 job ads in Austria · German"
                actions={<Button startIcon={<Icon name="plus" />}>New job ad</Button>}
            />
            <div className={styles.content}>
                <Card title={text.title}>
                    <div className={styles.cardBody}>
                        <p>{text.description}</p>
                        <SegmentedControl<Environment>
                            aria-label="Instance"
                            value={environment}
                            onChange={setEnvironment}
                            options={(Object.keys(environments) as Environment[]).map((value) => ({ value, label: environments[value].short }))}
                        />
                        <p className={styles.hint}>Switch the instance to compare the colors; production shows no marking.</p>
                    </div>
                </Card>
            </div>
        </Shell>
    );
}

/** The labels of every instance side by side, in the expanded and the collapsed navigation. */
export function EnvironmentLabelOverview() {
    return (
        <div className={styles.overview}>
            {(Object.keys(environments) as Environment[]).map((environment) => (
                <div key={environment} className={styles.overviewItem}>
                    <div className={styles.overviewHeader}>
                        <ProductLogo />
                        {environment !== "prod" && <EnvironmentLabel environment={environment} className={styles.cornerLabel} />}
                    </div>
                    <div className={styles.overviewMark}>
                        <ProductSign />
                        {environment !== "prod" && <EnvironmentLabel environment={environment} size="small" className={styles.markLabel} />}
                    </div>
                    <span className={styles.overviewCaption}>{environments[environment].label}</span>
                </div>
            ))}
        </div>
    );
}
