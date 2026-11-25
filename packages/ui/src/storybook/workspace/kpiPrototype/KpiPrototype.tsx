import { Card } from "../../../components/card/Card";
import { MiniChart } from "../../../components/miniChart/MiniChart";
import { OverviewLayout } from "../../../components/overviewLayout/OverviewLayout";
import { StatTile } from "../../../components/statTile/StatTile";
import { PageTypeShell } from "../../pageTypes/PageTypeShell";
import { PrototypeApp } from "../PrototypeApp";
import { kpiPrototype } from "../prototypes";
import { kpiNavGroups } from "./kpiNavigation";
import styles from "./kpiPrototype.module.scss";

// Monthly recurring revenue in thousand euros, December 2025 to November 2026
const revenue = [142.6, 146.1, 149.8, 151.2, 155.9, 158.4, 161.0, 164.7, 168.3, 171.5, 173.1, 184.2];
// New customers per week, the last eight weeks
const newCustomers = [7, 9, 6, 10, 8, 11, 9, 12];
// Customers who cancelled in a month, in percent of all customers
const churn = [2.9, 2.7, 2.8, 2.5, 2.6, 2.4, 2.3, 2.4, 2.2, 2.1, 2.2, 1.8];

function KpiOverview() {
    return (
        <PageTypeShell currentId="overview">
            <OverviewLayout
                eyebrow="Business · November 2026"
                title="Business KPIs"
                summary="Revenue grew 6.4 % on October, and churn is at its lowest this year."
            >
                <Card title="Revenue" meta="Monthly recurring">
                    <div className={styles.widget}>
                        <StatTile value="€184.2k" label="Monthly recurring revenue" trend="up" context="+6.4 % on October" />
                        <MiniChart
                            variant="line"
                            data={revenue}
                            aria-label="Monthly recurring revenue, the last 12 months"
                            startLabel="Dec 2025"
                            endLabel="Nov 2026"
                        />
                    </div>
                </Card>
                <Card title="New customers" meta="Last 8 weeks">
                    <div className={styles.widget}>
                        <StatTile value={38} label="New customers this month" trend="up" context="+12 on October · goal 40" />
                        <MiniChart
                            data={newCustomers}
                            aria-label="New customers per week, the last 8 weeks"
                            startLabel="8 weeks ago"
                            endLabel="This week"
                        />
                    </div>
                </Card>
                <Card title="Churn" meta="Monthly">
                    <div className={styles.widget}>
                        <StatTile
                            value="1.8"
                            unit="%"
                            label="Customers who cancelled"
                            trend="down"
                            context="−0.4 points on October · lowest this year"
                        />
                        <MiniChart
                            variant="line"
                            data={churn}
                            aria-label="Churn rate, the last 12 months"
                            startLabel="Dec 2025"
                            endLabel="Nov 2026"
                        />
                    </div>
                </Card>
            </OverviewLayout>
        </PageTypeShell>
    );
}

function renderPage(pageId: string) {
    return pageId === "overview" ? <KpiOverview /> : undefined;
}

/** An overview of the three business KPIs: revenue, new customers, and churn. */
export function KpiPrototype() {
    return <PrototypeApp prototype={kpiPrototype} navGroups={kpiNavGroups} renderPage={renderPage} />;
}
