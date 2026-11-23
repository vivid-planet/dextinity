import { useState } from "react";

import { Button } from "../../../components/button/Button";
import { Chip } from "../../../components/chip/Chip";
import { EmptyState } from "../../../components/emptyState/EmptyState";
import { FilterBar } from "../../../components/filterBar/FilterBar";
import { FilterChip } from "../../../components/filterChip/FilterChip";
import { Icon } from "../../../components/icon/Icon";
import { ListLayout } from "../../../components/listLayout/ListLayout";
import { PageHeader } from "../../../components/pageHeader/PageHeader";
import { PageTypeShell } from "../../pageTypes/PageTypeShell";
import { StoryTable, type StoryTableColumn } from "../../StoryTable";
import styles from "./cmsPrototype.module.scss";
import { type Redirect, useCmsSite } from "./CmsSiteContext";

const typeLabels: Record<Redirect["type"], string> = { automatic: "Automatic", manual: "Manual" };

const columns: StoryTableColumn<Redirect>[] = [
    { key: "source", header: "Source", render: (redirect) => <span className={styles.mono}>{redirect.source}</span> },
    { key: "target", header: "Target", render: (redirect) => <span className={styles.mono}>{redirect.target}</span> },
    {
        key: "type",
        header: "Type",
        render: (redirect) => (
            <Chip size="small" color={redirect.type === "automatic" ? "info" : "secondary"}>
                {typeLabels[redirect.type]}
            </Chip>
        ),
    },
    { key: "comment", header: "Comment", render: (redirect) => redirect.comment },
    { key: "created", header: "Created", render: (redirect) => redirect.created },
];

/** The redirects of the scope, with the ones the page tree creates when pages move. */
export function CmsRedirects() {
    const { redirects } = useCmsSite();
    const [search, setSearch] = useState("");
    const [type, setType] = useState<Redirect["type"] | "all">("all");
    const matches = (redirect: Redirect) =>
        `${redirect.source} ${redirect.target}`.toLowerCase().includes(search.trim().toLowerCase()) && (type === "all" || redirect.type === type);
    const rows = redirects.filter(matches);

    return (
        <PageTypeShell currentId="redirects">
            <ListLayout
                header={
                    <PageHeader
                        eyebrow="Project"
                        title="Redirects"
                        subtitle={`${redirects.length} redirects in Austria · German`}
                        primaryAction={{ label: "New redirect", icon: <Icon name="plus" /> }}
                    />
                }
                toolbar={
                    <FilterBar
                        searchValue={search}
                        onSearchChange={setSearch}
                        labels={{ search: "Filter redirects", searchPlaceholder: "Filter by path" }}
                        resultCount={rows.length}
                    >
                        {(["all", "automatic", "manual"] as const).map((value) => (
                            <FilterChip
                                key={value}
                                selected={type === value}
                                onClick={() => setType(value)}
                                count={redirects.filter((redirect) => value === "all" || redirect.type === value).length}
                            >
                                {value === "all" ? "All" : typeLabels[value]}
                            </FilterChip>
                        ))}
                    </FilterBar>
                }
            >
                <StoryTable
                    aria-label="Redirects"
                    columns={columns}
                    rows={rows}
                    getRowId={(redirect) => redirect.id}
                    getRowLabel={(redirect) => redirect.source}
                    emptyState={
                        <EmptyState
                            icon={<Icon name="search" />}
                            title="No matching redirects"
                            actions={
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    size="small"
                                    onClick={() => {
                                        setSearch("");
                                        setType("all");
                                    }}
                                >
                                    Clear filter
                                </Button>
                            }
                        />
                    }
                />
            </ListLayout>
        </PageTypeShell>
    );
}
