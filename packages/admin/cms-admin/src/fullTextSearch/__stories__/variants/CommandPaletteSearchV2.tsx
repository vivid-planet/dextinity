import { Button, Dialog } from "@dextinity/admin";
import { Add, Close, Link, Reload, Search, Time, Upload } from "@dextinity/admin-icons";
import { Chip, CircularProgress, IconButton, InputBase, Skeleton, Tab, Tabs, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { type PropsWithChildren, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { getEntityType } from "../shared/entityTypes";
import { HighlightedText } from "../shared/HighlightedText";
import { EmptyState, Kbd, optionId } from "../shared/SearchPanelParts";
import type { SearchResult } from "../shared/types";
import { scrollActiveOptionIntoView } from "../shared/useListKeyboardNavigation";
import { isMacPlatform, useSearchShortcut } from "../shared/useSearchShortcut";
import { allEntitiesFilter, type PaletteItem, type QuickAction, useCommandPalette } from "./useCommandPalette";

const shortcutLetter = "K";
const enterKeyLabel = "↵";
const escapeKeyLabel = "Esc";

const quickActions: QuickAction[] = [
    { id: "createPage", icon: Add, label: <FormattedMessage id="fullTextSearchPrototype.action.createPage" defaultMessage="Create page" /> },
    { id: "uploadFile", icon: Upload, label: <FormattedMessage id="fullTextSearchPrototype.action.uploadFile" defaultMessage="Upload file" /> },
    { id: "redirects", icon: Link, label: <FormattedMessage id="fullTextSearchPrototype.action.redirects" defaultMessage="Manage redirects" /> },
    { id: "startBuild", icon: Reload, label: <FormattedMessage id="fullTextSearchPrototype.action.startBuild" defaultMessage="Start build" /> },
];

interface Props {
    onSelectResult: (result: SearchResult) => void;
    onQuickAction?: (action: QuickAction) => void;
}

/**
 * Command palette with type tabs, skeleton loading, recent searches and quick actions. Tab / Shift+Tab switches the
 * type filter while typing.
 */
export function CommandPaletteSearchV2({ onSelectResult, onQuickAction = () => undefined }: Props) {
    const [open, setOpen] = useState(false);
    const openPalette = useCallback(() => setOpen(true), []);
    useSearchShortcut(openPalette);

    return (
        <>
            <PaletteTrigger onClick={openPalette} />
            {open && <Palette onSelectResult={onSelectResult} onQuickAction={onQuickAction} onClose={() => setOpen(false)} />}
        </>
    );
}

export function PaletteTrigger({ onClick }: { onClick: () => void }) {
    return (
        <Trigger onClick={onClick}>
            <Search fontSize="small" />
            <TriggerLabel variant="body2">
                <FormattedMessage id="fullTextSearchPrototype.placeholder" defaultMessage="Search…" />
            </TriggerLabel>
            <TriggerKbd>{isMacPlatform() ? "⌘" : "Ctrl"}</TriggerKbd>
            <TriggerKbd>{shortcutLetter}</TriggerKbd>
        </Trigger>
    );
}

function Palette({ onSelectResult, onQuickAction, onClose }: Required<Props> & { onClose: () => void }) {
    const intl = useIntl();
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const palette = useCommandPalette({ quickActions, onSelectResult, onQuickAction, onClose });

    useEffect(() => {
        scrollActiveOptionIntoView(listRef.current);
    }, [palette.activeIndex]);

    const activeItem = palette.items[palette.activeIndex];
    const showsSkeleton = !palette.isSearchEmpty && palette.areResultsStale;
    const showsEmptyState = !palette.isSearchEmpty && !showsSkeleton && palette.results.length === 0;

    const renderOption = (item: PaletteItem, content: ReactNode) => {
        const index = palette.items.indexOf(item);
        return (
            <Option
                key={item.key}
                id={optionId(item.key)}
                role="option"
                aria-selected={index === palette.activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => palette.selectItem(item)}
                onMouseMove={() => palette.setActiveIndex(index)}
            >
                {content}
                <EnterHint aria-hidden>{enterKeyLabel}</EnterHint>
            </Option>
        );
    };

    return (
        <PaletteDialog open onClose={onClose} maxWidth="sm" fullWidth disableRestoreFocus>
            <InputRow>
                <InputIcon>{palette.loading && !palette.isSearchEmpty ? <CircularProgress size={20} /> : <Search />}</InputIcon>
                <PaletteInput
                    autoFocus
                    fullWidth
                    inputRef={inputRef}
                    value={palette.search}
                    onChange={(event) => palette.setSearch(event.target.value)}
                    onKeyDown={palette.handleKeyDown}
                    placeholder={intl.formatMessage({
                        id: "fullTextSearchPrototype.palette.placeholder",
                        defaultMessage: "Search pages, news, products, files…",
                    })}
                    inputProps={{
                        role: "combobox",
                        "aria-expanded": true,
                        "aria-controls": "palette-v2-listbox",
                        "aria-activedescendant": activeItem ? optionId(activeItem.key) : undefined,
                    }}
                />
                {palette.isSearchEmpty ? (
                    <Kbd>{escapeKeyLabel}</Kbd>
                ) : (
                    <IconButton
                        size="small"
                        aria-label={intl.formatMessage({ id: "fullTextSearchPrototype.clear", defaultMessage: "Clear search" })}
                        onClick={() => {
                            palette.setSearch("");
                            inputRef.current?.focus();
                        }}
                    >
                        <Close fontSize="small" />
                    </IconButton>
                )}
            </InputRow>

            {!palette.isSearchEmpty && palette.entityCounts.length > 0 && (
                <FilterTabs
                    value={palette.entityFilter}
                    onChange={(_, value: string) => {
                        palette.setEntityFilter(value);
                        inputRef.current?.focus();
                    }}
                    variant="scrollable"
                    scrollButtons={false}
                >
                    <FilterTab
                        value={allEntitiesFilter}
                        label={
                            <TabLabel
                                label={<FormattedMessage id="fullTextSearchPrototype.filter.all" defaultMessage="All" />}
                                count={palette.totalCount}
                            />
                        }
                    />
                    {palette.entityCounts.map(({ entityName, count }) => {
                        const { icon: Icon, pluralLabel } = getEntityType(entityName);
                        return (
                            <FilterTab
                                key={entityName}
                                value={entityName}
                                icon={<Icon fontSize="small" />}
                                iconPosition="start"
                                label={<TabLabel label={pluralLabel} count={count} />}
                            />
                        );
                    })}
                </FilterTabs>
            )}

            <Body ref={listRef} id="palette-v2-listbox" role="listbox">
                {palette.isSearchEmpty ? (
                    <>
                        {palette.recentSearches.terms.length > 0 && (
                            <Section
                                title={<FormattedMessage id="fullTextSearchPrototype.recent.searches" defaultMessage="Recent searches" />}
                                action={
                                    <Button variant="textDark" size="small" onClick={palette.recentSearches.clear}>
                                        <FormattedMessage id="fullTextSearchPrototype.recent.clear" defaultMessage="Clear" />
                                    </Button>
                                }
                            >
                                <ChipRow>
                                    {palette.recentSearches.terms.map((term) => (
                                        <Chip
                                            key={term}
                                            icon={<Time fontSize="small" />}
                                            label={term}
                                            onClick={() => {
                                                palette.setSearch(term);
                                                inputRef.current?.focus();
                                            }}
                                        />
                                    ))}
                                </ChipRow>
                            </Section>
                        )}
                        {palette.recentSearches.results.length > 0 && (
                            <Section title={<FormattedMessage id="fullTextSearchPrototype.recent.opened" defaultMessage="Recently opened" />}>
                                {palette.items
                                    .filter((item) => item.kind === "recentResult")
                                    .map((item) => renderOption(item, <ResultContent result={item.result} search="" showTypeLabel />))}
                            </Section>
                        )}
                        <Section title={<FormattedMessage id="fullTextSearchPrototype.quickActions" defaultMessage="Quick actions" />}>
                            {palette.items
                                .filter((item) => item.kind === "quickAction")
                                .map((item) => {
                                    const Icon = item.action.icon;
                                    return renderOption(
                                        item,
                                        <>
                                            <IconTile>
                                                <Icon fontSize="small" />
                                            </IconTile>
                                            <OptionText>
                                                <Typography variant="body2">{item.action.label}</Typography>
                                            </OptionText>
                                        </>,
                                    );
                                })}
                        </Section>
                    </>
                ) : showsSkeleton ? (
                    <>
                        <SkeletonSection />
                        <SkeletonSection />
                    </>
                ) : showsEmptyState ? (
                    <EmptyState search={palette.debouncedSearch} />
                ) : palette.entityFilter === allEntitiesFilter ? (
                    palette.entityCounts.map(({ entityName, count }) => (
                        <Section
                            key={entityName}
                            title={getEntityType(entityName).pluralLabel}
                            action={
                                <Typography variant="caption" color="text.secondary">
                                    {count}
                                </Typography>
                            }
                        >
                            {palette.items
                                .filter((item) => item.kind === "result" && item.result.entityName === entityName)
                                .map((item) =>
                                    item.kind === "result"
                                        ? renderOption(item, <ResultContent result={item.result} search={palette.debouncedSearch} />)
                                        : null,
                                )}
                        </Section>
                    ))
                ) : (
                    <Section>
                        {palette.items.map((item) =>
                            item.kind === "result"
                                ? renderOption(item, <ResultContent result={item.result} search={palette.debouncedSearch} />)
                                : null,
                        )}
                    </Section>
                )}
            </Body>

            <Footer>
                <FooterHint keys={["↑", "↓"]}>
                    <FormattedMessage id="fullTextSearchPrototype.hint.move" defaultMessage="Move" />
                </FooterHint>
                <FooterHint keys={["↵"]}>
                    <FormattedMessage id="fullTextSearchPrototype.hint.open" defaultMessage="Open" />
                </FooterHint>
                {!palette.isSearchEmpty && palette.entityCounts.length > 1 && (
                    <FooterHint keys={["Tab"]}>
                        <FormattedMessage id="fullTextSearchPrototype.hint.filter" defaultMessage="Filter" />
                    </FooterHint>
                )}
                <FooterHint keys={["Esc"]}>
                    {palette.isSearchEmpty ? (
                        <FormattedMessage id="fullTextSearchPrototype.hint.close" defaultMessage="Close" />
                    ) : (
                        <FormattedMessage id="fullTextSearchPrototype.hint.clear" defaultMessage="Clear" />
                    )}
                </FooterHint>
            </Footer>
        </PaletteDialog>
    );
}

function TabLabel({ label, count }: { label: ReactNode; count: number }) {
    return (
        <TabLabelRoot>
            {label}
            <Count>{count}</Count>
        </TabLabelRoot>
    );
}

function Section({ title, action, children }: PropsWithChildren<{ title?: ReactNode; action?: ReactNode }>) {
    return (
        <SectionRoot role="group">
            {title && (
                <SectionHeading>
                    <Typography variant="subtitle2" color="text.secondary" component="div">
                        {title}
                    </Typography>
                    {action}
                </SectionHeading>
            )}
            {children}
        </SectionRoot>
    );
}

function ResultContent({ result, search, showTypeLabel }: { result: SearchResult; search: string; showTypeLabel?: boolean }) {
    const { icon: Icon, label } = getEntityType(result.entityName);
    return (
        <>
            <IconTile>
                <Icon fontSize="small" />
            </IconTile>
            <OptionText>
                <Typography variant="body2" noWrap>
                    <HighlightedText text={result.name} search={search} variant="background" />
                </Typography>
                {result.secondaryInformation && (
                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                        <HighlightedText text={result.secondaryInformation} search={search} variant="background" />
                    </Typography>
                )}
            </OptionText>
            {showTypeLabel && <Chip size="small" label={label} />}
        </>
    );
}

function SkeletonSection() {
    return (
        <SectionRoot aria-hidden>
            <SectionHeading>
                <Skeleton variant="text" width={90} />
            </SectionHeading>
            {[64, 48, 56].map((width) => (
                <SkeletonRow key={width}>
                    <Skeleton variant="rounded" width={36} height={36} />
                    <OptionText>
                        <Skeleton variant="text" width={`${width}%`} />
                        <Skeleton variant="text" width={`${width - 20}%`} height={14} />
                    </OptionText>
                </SkeletonRow>
            ))}
        </SectionRoot>
    );
}

function FooterHint({ keys, children }: PropsWithChildren<{ keys: string[] }>) {
    return (
        <FooterHintRoot variant="caption" color="text.secondary">
            {keys.map((key) => (
                <Kbd key={key}>{key}</Kbd>
            ))}
            {children}
        </FooterHintRoot>
    );
}

const Trigger = styled("button")`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1)};
    width: 280px;
    margin-right: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(1, 1.5)};
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: ${({ theme }) => Number(theme.shape.borderRadius) * 2}px;
    background-color: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    font: inherit;
    transition: ${({ theme }) => theme.transitions.create("background-color")};

    &:hover,
    &:focus-visible {
        background-color: rgba(255, 255, 255, 0.2);
    }
`;

const TriggerLabel = styled(Typography)`
    flex-grow: 1;
    text-align: left;
`;

const TriggerKbd = styled(Kbd)`
    margin: 0;
    border-color: rgba(255, 255, 255, 0.25);
    background-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
`;

const PaletteDialog = styled(Dialog)`
    & .MuiDialog-container {
        align-items: flex-start;
    }

    & .MuiDialog-paper {
        display: flex;
        flex-direction: column;
        max-width: 680px;
        max-height: 72vh;
        margin-top: 10vh;
        overflow: hidden;
        border-radius: ${({ theme }) => Number(theme.shape.borderRadius) * 3}px;
    }

    & .MuiDialogTitle-root,
    & .DextinityAdminDialog-closeButton {
        display: none;
    }
`;

const InputRow = styled("div")`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(3, 4)};
`;

const InputIcon = styled("span")`
    display: flex;
    width: 24px;
    justify-content: center;
    color: ${({ theme }) => theme.palette.text.secondary};
`;

const PaletteInput = styled(InputBase)`
    font-size: 20px;
    border: none;
    background-color: transparent;

    &.Mui-focused {
        border: none;
        box-shadow: none;
    }

    & .MuiInputBase-input {
        padding: 0;
    }
`;

const FilterTabs = styled(Tabs)`
    flex-shrink: 0;
    min-height: 0;
    padding: ${({ theme }) => theme.spacing(0, 3)};
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const FilterTab = styled(Tab)`
    min-height: 44px;
    padding: ${({ theme }) => theme.spacing(1, 2)};
    text-transform: none;
`;

const TabLabelRoot = styled("span")`
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1)};
`;

const Count = styled("span")`
    min-width: 20px;
    padding: ${({ theme }) => theme.spacing(0, 1)};
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    background-color: ${({ theme }) => theme.palette.grey[100]};
    color: ${({ theme }) => theme.palette.text.secondary};
    font-size: 12px;
    line-height: 20px;
    font-variant-numeric: tabular-nums;
`;

const Body = styled("div")`
    flex-grow: 1;
    overflow-y: auto;
    padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const SectionRoot = styled("div")`
    padding: ${({ theme }) => theme.spacing(2, 2, 0)};

    & + & {
        margin-top: ${({ theme }) => theme.spacing(2)};
        border-top: 1px solid ${({ theme }) => theme.palette.divider};
    }
`;

const SectionHeading = styled("div")`
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 28px;
    padding: ${({ theme }) => theme.spacing(0, 2, 1)};
`;

const ChipRow = styled("div")`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing(1)};
    padding: ${({ theme }) => theme.spacing(0, 2, 1)};
`;

const Option = styled("div")`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2.5)};
    padding: ${({ theme }) => theme.spacing(1.5, 2)};
    border-radius: ${({ theme }) => Number(theme.shape.borderRadius) * 2}px;
    cursor: pointer;

    &[aria-selected="true"] {
        background-color: ${({ theme }) => theme.palette.action.hover};
    }
`;

const EnterHint = styled(Kbd)`
    visibility: hidden;

    [aria-selected="true"] > & {
        visibility: visible;
    }
`;

const IconTile = styled("span")`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: ${({ theme }) => Number(theme.shape.borderRadius) * 2}px;
    background-color: ${({ theme }) => theme.palette.grey[50]};
    color: ${({ theme }) => theme.palette.text.secondary};
`;

const OptionText = styled("span")`
    flex-grow: 1;
    min-width: 0;
`;

const SkeletonRow = styled("div")`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2.5)};
    padding: ${({ theme }) => theme.spacing(1.5, 2)};
`;

const Footer = styled("div")`
    flex-shrink: 0;
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing(4)};
    padding: ${({ theme }) => theme.spacing(2, 4)};
    border-top: 1px solid ${({ theme }) => theme.palette.divider};
    background-color: ${({ theme }) => theme.palette.grey[50]};
`;

const FooterHintRoot = styled(Typography)`
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(0.5)};
`;
