import { Button, Dialog, Tab, Tabs } from "@dextinity/admin";
import { Add, ChevronRight, Link, Reload, Search, Settings, Snips, Time, Upload } from "@dextinity/admin-icons";
import { Chip, CircularProgress, IconButton, InputBase, Popover, Skeleton, Switch, Typography } from "@mui/material";
import { alpha, styled, type Theme } from "@mui/material/styles";
import { Fragment, type PropsWithChildren, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { PaletteTrigger } from "./PaletteTrigger";
import { getEntityType, knownEntityNames } from "./shared/entityTypes";
import { HighlightedText } from "./shared/HighlightedText";
import { type ContentMatch, findContentMatches } from "./shared/pageContents";
import { getResultDetails } from "./shared/resultDetails";
import { EmptyState, Kbd, optionId } from "./shared/SearchPanelParts";
import type { SearchResult } from "./shared/types";
import { scrollActiveOptionIntoView } from "./shared/useListKeyboardNavigation";
import { useSearchShortcut } from "./shared/useSearchShortcut";
import { allEntitiesFilter, type PaletteItem, type QuickAction, useCommandPalette } from "./useCommandPalette";

const enterKeyLabel = "↵";
const escapeKeyLabel = "Esc";
const enabledEntitiesStorageKey = "dextinity.fullTextSearchPrototype.enabledEntities";

const quickActions: QuickAction[] = [
    { id: "createPage", icon: Add, label: <FormattedMessage id="fullTextSearchPrototype.action.createPage" defaultMessage="Create page" /> },
    { id: "uploadFile", icon: Upload, label: <FormattedMessage id="fullTextSearchPrototype.action.uploadFile" defaultMessage="Upload file" /> },
    { id: "redirects", icon: Link, label: <FormattedMessage id="fullTextSearchPrototype.action.redirects" defaultMessage="Manage redirects" /> },
    { id: "startBuild", icon: Reload, label: <FormattedMessage id="fullTextSearchPrototype.action.startBuild" defaultMessage="Start build" /> },
];

type PaletteColor = "primary" | "success" | "warning" | "secondary";

const entityColors: Record<string, PaletteColor | "default"> = {
    Page: "primary",
    News: "success",
    Product: "warning",
    DamFile: "secondary",
    Redirect: "default",
};

interface Props {
    onSelectResult: (result: SearchResult, contentMatch?: ContentMatch) => void;
    onQuickAction?: (action: QuickAction) => void;
}

/**
 * Command palette with configurable type tabs (gear menu) and result rows with a round type icon, a bold title, context
 * below and up to two chips with additional information on the right.
 */
export function CommandPaletteSearch({ onSelectResult, onQuickAction = () => undefined }: Props) {
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

function readEnabledEntityNames(): string[] {
    try {
        const value = window.localStorage.getItem(enabledEntitiesStorageKey);
        return value ? (JSON.parse(value) as string[]) : knownEntityNames;
    } catch {
        return knownEntityNames;
    }
}

function useEnabledEntityNames() {
    const [enabledEntityNames, setEnabledEntityNames] = useState(readEnabledEntityNames);

    const toggleEntityName = (entityName: string) => {
        const isEnabled = enabledEntityNames.includes(entityName);
        if (isEnabled && enabledEntityNames.length === 1) {
            return;
        }
        const next = isEnabled ? enabledEntityNames.filter((name) => name !== entityName) : [...enabledEntityNames, entityName];
        setEnabledEntityNames(next);
        try {
            window.localStorage.setItem(enabledEntitiesStorageKey, JSON.stringify(next));
        } catch {
            // Storage may be unavailable (private mode), the selection then only lives for the session
        }
    };

    return { enabledEntityNames, toggleEntityName };
}

function Palette({ onSelectResult, onQuickAction, onClose }: Required<Props> & { onClose: () => void }) {
    const intl = useIntl();
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null);
    const { enabledEntityNames, toggleEntityName } = useEnabledEntityNames();
    const searchRef = useRef("");
    const palette = useCommandPalette({
        quickActions,
        onSelectResult: (result) => onSelectResult(result, getVisibleContentMatches(result, searchRef.current)[0]),
        onQuickAction,
        onClose,
        enabledEntityNames,
    });

    searchRef.current = palette.debouncedSearch;

    useEffect(() => {
        scrollActiveOptionIntoView(listRef.current);
    }, [palette.activeIndex]);

    const activeItem = palette.items[palette.activeIndex];
    const showsSkeleton = !palette.isSearchEmpty && palette.areResultsStale;
    const showsEmptyState = !palette.isSearchEmpty && !showsSkeleton && palette.visibleResults.length === 0;
    const countForEntity = (entityName: string) => palette.entityCounts.find((entry) => entry.entityName === entityName)?.count ?? 0;
    const areTabsInactive = palette.isSearchEmpty || showsSkeleton;
    const tabEntityNames = enabledEntityNames.filter((entityName) => areTabsInactive || countForEntity(entityName) > 0);
    const tabKeys = [allEntitiesFilter, ...tabEntityNames];

    const groupedResults =
        palette.entityFilter === allEntitiesFilter
            ? palette.entityCounts.map(({ entityName }) => ({
                  entityName,
                  items: palette.items.filter((item) => item.kind === "result" && item.result.entityName === entityName),
              }))
            : [{ entityName: undefined, items: palette.items }];

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
            </Option>
        );
    };

    const body = (
        <Body ref={listRef} id="palette-listbox" role="listbox">
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
                                        variant="outlined"
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
                                .map((item) => renderOption(item, <ResultContent result={item.result} search="" />))}
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
                                        <RoundIcon className="color-default">
                                            <Icon />
                                        </RoundIcon>
                                        <OptionText>
                                            <Title variant="body2">{item.action.label}</Title>
                                        </OptionText>
                                        <EnterHint aria-hidden>{enterKeyLabel}</EnterHint>
                                    </>,
                                );
                            })}
                    </Section>
                </>
            ) : showsSkeleton ? (
                <Section>
                    {[62, 48, 70, 55, 40].map((width) => (
                        <SkeletonRow key={width}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <OptionText>
                                <Skeleton variant="text" width={`${width}%`} />
                                <Skeleton variant="text" width={`${width - 20}%`} height={14} />
                            </OptionText>
                            <Skeleton variant="rounded" width={64} height={24} />
                        </SkeletonRow>
                    ))}
                </Section>
            ) : showsEmptyState ? (
                <EmptyState search={palette.debouncedSearch} />
            ) : (
                groupedResults.map(({ entityName, items }) => (
                    <Section
                        key={entityName}
                        title={entityName ? getEntityType(entityName).pluralLabel : undefined}
                        action={
                            entityName ? (
                                <Typography variant="caption" color="text.secondary">
                                    {items.length}
                                </Typography>
                            ) : undefined
                        }
                    >
                        {items.map((item) =>
                            item.kind === "result"
                                ? renderOption(item, <ResultContent result={item.result} search={palette.debouncedSearch} />)
                                : null,
                        )}
                    </Section>
                ))
            )}
        </Body>
    );

    return (
        <PaletteDialog open onClose={onClose} maxWidth="sm" fullWidth disableRestoreFocus>
            <InputRow>
                <InputIcon>{palette.loading && !palette.isSearchEmpty ? <CircularProgress size={22} /> : <Search />}</InputIcon>
                <PaletteInput
                    autoFocus
                    fullWidth
                    inputRef={inputRef}
                    value={palette.search}
                    onChange={(event) => palette.setSearch(event.target.value)}
                    onKeyDown={palette.handleKeyDown}
                    placeholder={intl.formatMessage({ id: "fullTextSearchPrototype.placeholder", defaultMessage: "Search…" })}
                    inputProps={{
                        role: "combobox",
                        "aria-expanded": true,
                        "aria-controls": "palette-listbox",
                        "aria-activedescendant": activeItem ? optionId(activeItem.key) : undefined,
                    }}
                />
                {palette.isSearchEmpty ? (
                    <Kbd>{escapeKeyLabel}</Kbd>
                ) : (
                    <ClearButton
                        variant="textDark"
                        onClick={() => {
                            palette.setSearch("");
                            inputRef.current?.focus();
                        }}
                    >
                        <FormattedMessage id="fullTextSearchPrototype.clearShort" defaultMessage="Clear" />
                    </ClearButton>
                )}
            </InputRow>

            <TabsArea>
                <Tabs
                    tabsState={{
                        value: Math.max(0, tabKeys.indexOf(palette.entityFilter)),
                        setValue: (index) => {
                            palette.setEntityFilter(tabKeys[index]);
                            inputRef.current?.focus();
                        },
                    }}
                >
                    <Tab
                        label={
                            <TabLabel
                                label={<FormattedMessage id="fullTextSearchPrototype.filter.all" defaultMessage="All" />}
                                count={areTabsInactive ? undefined : palette.visibleTotalCount}
                            />
                        }
                    >
                        {body}
                    </Tab>
                    {tabEntityNames.map((entityName) => {
                        const { icon: Icon, pluralLabel } = getEntityType(entityName);
                        return (
                            <Tab
                                key={entityName}
                                disabled={areTabsInactive}
                                icon={<Icon />}
                                iconPosition="start"
                                label={<TabLabel label={pluralLabel} count={areTabsInactive ? undefined : countForEntity(entityName)} />}
                            >
                                {body}
                            </Tab>
                        );
                    })}
                </Tabs>
                <SettingsButton
                    aria-label={intl.formatMessage({ id: "fullTextSearchPrototype.configureTypes", defaultMessage: "Choose what to search" })}
                    onClick={(event) => setSettingsAnchor(event.currentTarget)}
                    className={settingsAnchor ? "is-open" : undefined}
                >
                    <Settings />
                </SettingsButton>
            </TabsArea>

            <Popover
                open={settingsAnchor !== null}
                anchorEl={settingsAnchor}
                onClose={() => setSettingsAnchor(null)}
                disableRestoreFocus
                slotProps={{ transition: { onExited: () => inputRef.current?.focus() } }}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <SettingsList>
                    <SettingsHeading variant="subtitle2" color="text.secondary">
                        <FormattedMessage id="fullTextSearchPrototype.configureTypes" defaultMessage="Choose what to search" />
                    </SettingsHeading>
                    {knownEntityNames.map((entityName) => {
                        const { icon: Icon, pluralLabel } = getEntityType(entityName);
                        const isEnabled = enabledEntityNames.includes(entityName);
                        return (
                            <SettingsItem key={entityName} className={isEnabled ? undefined : "is-disabled"}>
                                <Icon />
                                <Typography variant="body2" component="span">
                                    {pluralLabel}
                                </Typography>
                                <Switch
                                    checked={isEnabled}
                                    disabled={isEnabled && enabledEntityNames.length === 1}
                                    onChange={() => toggleEntityName(entityName)}
                                    inputProps={{ "aria-label": entityName }}
                                />
                            </SettingsItem>
                        );
                    })}
                </SettingsList>
            </Popover>

            <Footer>
                <FooterHint keys={["↓", "↑"]}>
                    <FormattedMessage id="fullTextSearchPrototype.hint.move" defaultMessage="Move" />
                </FooterHint>
                <FooterHint keys={[enterKeyLabel]}>
                    <FormattedMessage id="fullTextSearchPrototype.hint.select" defaultMessage="Select" />
                </FooterHint>
                {!palette.isSearchEmpty && palette.entityCounts.length > 1 && (
                    <FooterHint keys={["Tab"]}>
                        <FormattedMessage id="fullTextSearchPrototype.hint.filter" defaultMessage="Filter" />
                    </FooterHint>
                )}
                <FooterHint keys={[escapeKeyLabel]}>
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

function TabLabel({ label, count }: { label: ReactNode; count?: number }) {
    return (
        <TabLabelRoot>
            {label}
            {count !== undefined && <Chip size="small" label={count} />}
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

function textMatchesSearch(text: string, search: string) {
    const lowerText = text.toLowerCase();
    return search
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((term) => lowerText.includes(term));
}

function getVisibleContentMatches(result: SearchResult, search: string): ContentMatch[] {
    if (search.length === 0 || textMatchesSearch(`${result.name} ${result.secondaryInformation ?? ""}`, search)) {
        return [];
    }
    return findContentMatches(result.id, search);
}

function ResultContent({ result, search }: { result: SearchResult; search: string }) {
    const { icon: Icon } = getEntityType(result.entityName);
    const [firstContentMatch, ...moreContentMatches] = getVisibleContentMatches(result, search);
    return (
        <>
            <RoundIcon className={`color-${entityColors[result.entityName] ?? "default"}`}>
                <Icon />
            </RoundIcon>
            <OptionText>
                <Title variant="body2" noWrap>
                    <HighlightedText text={result.name} search={search} />
                </Title>
                {result.secondaryInformation && (
                    <SecondaryText variant="caption" color="text.secondary" noWrap>
                        <HighlightedText text={result.secondaryInformation} search={search} />
                    </SecondaryText>
                )}
            </OptionText>
            <DetailChips>
                {getResultDetails(result.id).map((detail) => (
                    <Chip key={detail.label} size="small" label={detail.label} color={detail.color} />
                ))}
            </DetailChips>
            {firstContentMatch && (
                <ContentMatchBox className="content-match">
                    <MatchLocation variant="caption" color="text.secondary">
                        <Snips fontSize="inherit" />
                        {firstContentMatch.location.map((part, index) => (
                            <Fragment key={`${index}:${part}`}>
                                {index > 0 && <ChevronRight fontSize="inherit" />}
                                <span>{part}</span>
                            </Fragment>
                        ))}
                    </MatchLocation>
                    <Snippet variant="body2">
                        <HighlightedText text={firstContentMatch.snippet} search={search} />
                    </Snippet>
                    {moreContentMatches.length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                            <FormattedMessage
                                id="fullTextSearchPrototype.moreContentMatches"
                                defaultMessage="+ {count, plural, one {# more match} other {# more matches}} on this page"
                                values={{ count: moreContentMatches.length }}
                            />
                        </Typography>
                    )}
                </ContentMatchBox>
            )}
        </>
    );
}

function FooterHint({ keys, children }: PropsWithChildren<{ keys: string[] }>) {
    return (
        <FooterHintRoot variant="body2" color="text.secondary">
            {keys.map((key) => (
                <FooterKbd key={key}>{key}</FooterKbd>
            ))}
            {children}
        </FooterHintRoot>
    );
}

const tintedIcon = (theme: Theme, color: PaletteColor) => `
    &.color-${color} {
        background-color: ${alpha(theme.palette[color].main, 0.12)};
        color: ${theme.palette[color].dark};
    }
`;

const PaletteDialog = styled(Dialog)`
    & .MuiDialog-container {
        align-items: flex-start;
    }

    & .MuiDialog-paper {
        display: flex;
        flex-direction: column;
        max-width: 720px;
        max-height: 76vh;
        margin-top: 9vh;
        overflow: hidden;
        border-radius: 16px;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
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
    gap: ${({ theme }) => theme.spacing(3)};
    padding: ${({ theme }) => theme.spacing(5, 6, 3)};
`;

const InputIcon = styled("span")`
    display: flex;
    justify-content: center;
    width: 28px;
    color: ${({ theme }) => theme.palette.text.secondary};

    & .MuiSvgIcon-root {
        font-size: 26px;
    }
`;

const PaletteInput = styled(InputBase)`
    font-size: 26px;
    font-weight: 500;
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

const ClearButton = styled(Button)`
    text-decoration: underline;
    text-underline-offset: 3px;
`;

const TabLabelRoot = styled("span")`
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1.5)};
`;

const TabsArea = styled("div")`
    position: relative;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;

    & .DextinityAdminTabs-root {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        min-height: 0;
    }

    & .DextinityAdminTabs-tabs {
        flex-shrink: 0;
        margin-bottom: 0;
        padding: ${({ theme }) => theme.spacing(0, 14, 0, 5)};
    }

    & .DextinityAdminTabs-content {
        flex-grow: 1;
        min-height: 0;
        overflow-y: auto;
    }
`;

const SettingsButton = styled(IconButton)`
    position: absolute;
    top: ${({ theme }) => theme.spacing(1)};
    right: ${({ theme }) => theme.spacing(4)};
    border-radius: 10px;
    background-color: ${({ theme }) => theme.palette.grey[50]};

    &.is-open {
        background-color: ${({ theme }) => theme.palette.grey[100]};
    }
`;

const SettingsList = styled("div")`
    width: 280px;
    padding: ${({ theme }) => theme.spacing(1.5, 0)};
`;

const SettingsHeading = styled(Typography)`
    display: block;
    padding: ${({ theme }) => theme.spacing(1, 3, 1.5)};
`;

const SettingsItem = styled("label")`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(0.5, 2, 0.5, 3)};
    cursor: pointer;

    & > span:nth-of-type(1) {
        flex-grow: 1;
    }

    &.is-disabled {
        color: ${({ theme }) => theme.palette.text.disabled};
    }
`;

const Body = styled("div")`
    padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const SectionRoot = styled("div")`
    padding: ${({ theme }) => theme.spacing(2, 3, 0)};

    & + & {
        margin-top: ${({ theme }) => theme.spacing(3)};
    }
`;

const SectionHeading = styled("div")`
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 32px;
    padding: ${({ theme }) => theme.spacing(1, 3)};
`;

const ChipRow = styled("div")`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing(1.5)};
    padding: ${({ theme }) => theme.spacing(0, 3, 2)};
`;

const Option = styled("div")`
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    column-gap: ${({ theme }) => theme.spacing(3)};
    padding: ${({ theme }) => theme.spacing(2.5, 3)};
    border-radius: 12px;
    cursor: pointer;

    &:not(:last-of-type)::after {
        content: "";
        position: absolute;
        left: ${({ theme }) => theme.spacing(3)};
        right: ${({ theme }) => theme.spacing(3)};
        bottom: 0;
        border-bottom: 1px solid ${({ theme }) => theme.palette.grey[50]};
    }

    &[aria-selected="true"] {
        background-color: ${({ theme }) => theme.palette.grey[50]};
    }

    &[aria-selected="true"] .content-match {
        background-color: ${({ theme }) => theme.palette.background.paper};
    }

    &[aria-selected="true"]::after,
    &:has(+ [aria-selected="true"])::after {
        display: none;
    }
`;

const RoundIcon = styled("span")`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.palette.grey[50]};
    color: ${({ theme }) => theme.palette.text.secondary};
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);

    ${({ theme }) => tintedIcon(theme, "primary")}
    ${({ theme }) => tintedIcon(theme, "success")}
    ${({ theme }) => tintedIcon(theme, "warning")}
    ${({ theme }) => tintedIcon(theme, "secondary")}
`;

const OptionText = styled("span")`
    flex-grow: 1;
    min-width: 0;
`;

const Title = styled(Typography)`
    font-weight: 600;
`;

const SecondaryText = styled(Typography)`
    display: block;
    margin-top: 2px;
`;

const ContentMatchBox = styled("span")`
    grid-column: 2 / -1;
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(0.5)};
    margin-top: ${({ theme }) => theme.spacing(1.5)};
    padding: ${({ theme }) => theme.spacing(1.5, 2)};
    border-radius: 8px;
    background-color: ${({ theme }) => theme.palette.grey[50]};
`;

const MatchLocation = styled(Typography)`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(0.5)};
`;

const Snippet = styled(Typography)`
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
`;

const DetailChips = styled("span")`
    display: flex;
    flex-shrink: 0;
    gap: ${({ theme }) => theme.spacing(1)};
`;

const EnterHint = styled(Kbd)`
    visibility: hidden;

    [aria-selected="true"] > & {
        visibility: visible;
    }
`;

const SkeletonRow = styled("div")`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(3)};
    padding: ${({ theme }) => theme.spacing(2.5, 3)};
`;

const Footer = styled("div")`
    flex-shrink: 0;
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing(6)};
    padding: ${({ theme }) => theme.spacing(3, 6)};
    border-top: 1px solid ${({ theme }) => theme.palette.divider};
    background-color: ${({ theme }) => theme.palette.grey[50]};
`;

const FooterHintRoot = styled(Typography)`
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1)};
`;

const FooterKbd = styled(Kbd)`
    min-width: 24px;
    margin: 0;
    border-radius: 6px;
    background-color: ${({ theme }) => theme.palette.background.paper};
    box-shadow: 0 1px 0 ${({ theme }) => theme.palette.divider};
    line-height: 22px;
`;
