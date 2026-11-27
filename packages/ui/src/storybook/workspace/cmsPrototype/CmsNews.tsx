import { useState } from "react";

import { BulkActionBar } from "../../../components/bulkActionBar/BulkActionBar";
import { Button } from "../../../components/button/Button";
import { EmptyState } from "../../../components/emptyState/EmptyState";
import { FilterBar } from "../../../components/filterBar/FilterBar";
import { FilterChip } from "../../../components/filterChip/FilterChip";
import { Icon } from "../../../components/icon/Icon";
import { IconButton } from "../../../components/iconButton/IconButton";
import { ListLayout } from "../../../components/listLayout/ListLayout";
import { Menu } from "../../../components/menu/Menu";
import { MenuItem } from "../../../components/menu/MenuItem";
import { MenuSeparator } from "../../../components/menu/MenuSeparator";
import { PageHeader } from "../../../components/pageHeader/PageHeader";
import { Pagination } from "../../../components/pagination/Pagination";
import { StatusIndicator } from "../../../components/statusIndicator/StatusIndicator";
import { PageTypeShell } from "../../pageTypes/PageTypeShell";
import { usePrototypeNavigation } from "../../pageTypes/prototypeNavigation";
import { StoryTable, type StoryTableColumn } from "../../StoryTable";
import { type ContentStatus, type NewsArticle, newsArticles, newsCategories } from "./cmsData";
import styles from "./cmsPrototype.module.scss";

const statusFilters: { value: ContentStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "unpublished", label: "Unpublished" },
    { value: "archived", label: "Archived" },
];

export function formatArticleDate(isoDate: string) {
    return new Date(isoDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const columns: StoryTableColumn<NewsArticle>[] = [
    {
        key: "title",
        header: "Title",
        render: (article) => (
            <span className={styles.articleCell}>
                <img src={article.image} alt="" className={styles.articleThumbnail} />
                <span className={styles.strong}>{article.title}</span>
            </span>
        ),
    },
    { key: "category", header: "Category", render: (article) => <span className={styles.muted}>{article.category}</span> },
    { key: "author", header: "Author", render: (article) => <span className={styles.muted}>{article.author}</span> },
    { key: "date", header: "Date", render: (article) => <span className={styles.muted}>{formatArticleDate(article.date)}</span> },
    { key: "status", header: "Status", render: (article) => <StatusIndicator status={article.status} /> },
];

function RowMenu({ article }: { article: NewsArticle }) {
    const [open, setOpen] = useState(false);
    const prototype = usePrototypeNavigation();
    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            trigger={
                <IconButton color="secondary" aria-label={`Actions for ${article.title}`} size="small" variant="text">
                    <Icon name="more-horizontal" />
                </IconButton>
            }
        >
            <MenuItem label="Edit" icon={<Icon name="edit" />} onClick={() => prototype?.navigate(`news/${article.id}`)} />
            <MenuItem label="Duplicate" icon={<Icon name="copy" />} />
            <MenuSeparator />
            <MenuItem label="Archive" icon={<Icon name="archive" />} />
        </Menu>
    );
}

export function CmsNews() {
    const prototype = usePrototypeNavigation();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<ContentStatus | "all">("all");
    const [category, setCategory] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const matches = newsArticles.filter(
        (article) => article.title.toLowerCase().includes(search.toLowerCase()) && (category == null || article.category === category),
    );
    const countFor = (value: ContentStatus | "all") => matches.filter((article) => value === "all" || article.status === value).length;
    const results = matches.filter((article) => status === "all" || article.status === status).sort((a, b) => b.date.localeCompare(a.date));
    const pageRows = results.slice((page - 1) * pageSize, page * pageSize);

    function resetFilters() {
        setSearch("");
        setStatus("all");
        setCategory(null);
        setPage(1);
    }

    return (
        <PageTypeShell currentId="news">
            <ListLayout
                header={
                    <PageHeader
                        eyebrow="Structured data"
                        title="News"
                        subtitle={`${newsArticles.length} articles in Austria · German`}
                        secondaryActions={[{ label: "Export", icon: <Icon name="download" /> }]}
                        primaryAction={{ label: "New article", icon: <Icon name="plus" />, href: "#news/new" }}
                    />
                }
                toolbar={
                    <FilterBar
                        searchValue={search}
                        onSearchChange={(value) => {
                            setSearch(value);
                            setPage(1);
                        }}
                        resultCount={results.length}
                    >
                        {statusFilters.map((filter) => (
                            <FilterChip
                                key={filter.value}
                                selected={status === filter.value}
                                onClick={() => {
                                    setStatus(filter.value);
                                    setPage(1);
                                }}
                                count={countFor(filter.value)}
                                startAdornment={filter.value === "all" ? undefined : <StatusIndicator status={filter.value} decorative />}
                            >
                                {filter.label}
                            </FilterChip>
                        ))}
                        {newsCategories.map((value) => (
                            <FilterChip
                                key={value}
                                selected={category === value}
                                onClick={() => {
                                    setCategory(category === value ? null : value);
                                    setPage(1);
                                }}
                            >
                                {value}
                            </FilterChip>
                        ))}
                    </FilterBar>
                }
            >
                <div className={styles.list}>
                    <StoryTable
                        aria-label="News"
                        columns={columns}
                        rows={pageRows}
                        getRowId={(article) => article.id}
                        getRowLabel={(article) => article.title}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onRowClick={(article) => prototype?.navigate(`news/${article.id}`)}
                        rowActions={(article) => <RowMenu article={article} />}
                        emptyState={
                            <EmptyState
                                icon={<Icon name="search" />}
                                title="No matching articles"
                                description="Check the spelling or reset the filters."
                                actions={
                                    <Button variant="outlined" color="secondary" size="small" onClick={resetFilters}>
                                        Reset filters
                                    </Button>
                                }
                            />
                        }
                    />
                    {selectedIds.length > 0 && (
                        <BulkActionBar
                            className={styles.bulkActionBar}
                            count={selectedIds.length}
                            onClear={() => setSelectedIds([])}
                            actions={[
                                { label: "Publish", icon: <Icon name="check" />, onClick: () => setSelectedIds([]) },
                                { label: "Archive", icon: <Icon name="archive" />, onClick: () => setSelectedIds([]) },
                            ]}
                        />
                    )}
                    <Pagination
                        page={page}
                        pageSize={pageSize}
                        total={results.length}
                        onPageChange={setPage}
                        onPageSizeChange={(nextPageSize) => {
                            setPageSize(nextPageSize);
                            setPage(1);
                        }}
                    />
                </div>
            </ListLayout>
        </PageTypeShell>
    );
}
