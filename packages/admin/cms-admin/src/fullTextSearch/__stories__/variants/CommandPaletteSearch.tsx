import { Button, Dialog } from "@dextinity/admin";
import { Search } from "@dextinity/admin-icons";
import { InputBase, LinearProgress, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { getEntityType } from "../shared/entityTypes";
import { HighlightedText } from "../shared/HighlightedText";
import {
    EmptyState,
    KeyboardHints,
    OptionIcon,
    optionId,
    OptionList,
    OptionText,
    PanelFooter,
    PanelOption,
    RecentEmptyState,
    RecentItemContent,
    RecentSectionsHeadings,
    SectionHeading,
    ShortcutKey,
} from "../shared/SearchPanelParts";
import type { SearchDropdownVariantProps } from "../shared/types";
import { scrollActiveOptionIntoView } from "../shared/useListKeyboardNavigation";
import { groupItemsByEntity, useSearchPanel } from "../shared/useSearchPanel";
import { useSearchShortcut } from "../shared/useSearchShortcut";

/**
 * The header only shows a trigger. Searching happens in a centered overlay with room for longer names and context,
 * opened by click or Cmd/Ctrl+K from anywhere in the admin.
 */
export function CommandPaletteSearch({ onSelectResult }: SearchDropdownVariantProps) {
    const [open, setOpen] = useState(false);
    const openPalette = useCallback(() => setOpen(true), []);
    useSearchShortcut(openPalette);

    return (
        <>
            <Trigger onClick={openPalette}>
                <Search fontSize="small" />
                <TriggerLabel variant="body2">
                    <FormattedMessage id="fullTextSearchPrototype.placeholder" defaultMessage="Search…" />
                </TriggerLabel>
                <ShortcutKey />
            </Trigger>
            {open && <Palette onSelectResult={onSelectResult} onClose={() => setOpen(false)} />}
        </>
    );
}

function Palette({ onSelectResult, onClose }: SearchDropdownVariantProps & { onClose: () => void }) {
    const intl = useIntl();
    const listRef = useRef<HTMLUListElement>(null);
    const panel = useSearchPanel({ onSelectResult, onClose, initialLimit: 12 });

    useEffect(() => {
        scrollActiveOptionIntoView(listRef.current);
    }, [panel.activeIndex]);

    const activeItem = panel.items[panel.activeIndex];
    const groups = groupItemsByEntity(panel.items);
    const showsEmptyState = !panel.isSearchEmpty && !panel.loading && panel.hasResultsData && panel.results.length === 0;

    return (
        <PaletteDialog open onClose={onClose} maxWidth="sm" fullWidth disableRestoreFocus>
            <PaletteInputRow>
                <Search color="action" />
                <PaletteInput
                    autoFocus
                    fullWidth
                    value={panel.search}
                    onChange={(event) => panel.setSearch(event.target.value)}
                    onKeyDown={panel.handleKeyDown}
                    placeholder={intl.formatMessage({
                        id: "fullTextSearchPrototype.palette.placeholder",
                        defaultMessage: "Search pages, news, products, files…",
                    })}
                    inputProps={{
                        role: "combobox",
                        "aria-expanded": true,
                        "aria-controls": "palette-search-listbox",
                        "aria-activedescendant": activeItem ? optionId(activeItem.key) : undefined,
                    }}
                />
            </PaletteInputRow>
            {panel.loading && !panel.isSearchEmpty ? <ThinProgress /> : <ProgressPlaceholder />}
            <ScrollArea>
                {showsEmptyState ? (
                    <EmptyState search={panel.debouncedSearch} />
                ) : panel.isSearchEmpty && panel.items.length === 0 ? (
                    <RecentEmptyState />
                ) : (
                    <OptionList ref={listRef} id="palette-search-listbox" role="listbox">
                        {groups.map(({ groupKey, entries }) => {
                            if (groupKey === "showAll") {
                                return null;
                            }
                            const isRecent = groupKey === "recentTerm" || groupKey === "recentResult";
                            const { pluralLabel } = getEntityType(groupKey);
                            return (
                                <li key={groupKey} role="presentation">
                                    {isRecent ? (
                                        <RecentSectionsHeadings
                                            kind={groupKey}
                                            onClear={groupKey === "recentTerm" ? panel.recentSearches.clear : undefined}
                                        />
                                    ) : (
                                        <SectionHeading
                                            action={
                                                <Typography variant="caption" color="text.secondary">
                                                    {entries.length}
                                                </Typography>
                                            }
                                        >
                                            {pluralLabel}
                                        </SectionHeading>
                                    )}
                                    <OptionList role="group">
                                        {entries.map(({ item, index }) => (
                                            <PanelOption
                                                key={item.key}
                                                item={item}
                                                isActive={index === panel.activeIndex}
                                                onSelect={() => panel.selectItem(item)}
                                                onHover={() => panel.setActiveIndex(index)}
                                            >
                                                {item.kind === "result" ? (
                                                    <ResultContent
                                                        entityName={item.result.entityName}
                                                        name={item.result.name}
                                                        secondaryInformation={item.result.secondaryInformation}
                                                        search={panel.debouncedSearch}
                                                        isActive={index === panel.activeIndex}
                                                    />
                                                ) : (
                                                    <RecentItemContent item={item} />
                                                )}
                                            </PanelOption>
                                        ))}
                                    </OptionList>
                                </li>
                            );
                        })}
                    </OptionList>
                )}
            </ScrollArea>
            <PanelFooter>
                <KeyboardHints />
                {panel.hasMoreResults && !panel.isSearchEmpty && (
                    <Button variant="textDark" size="small" onClick={() => panel.showAll()}>
                        <FormattedMessage
                            id="fullTextSearchPrototype.showAll"
                            defaultMessage="Show all {count} results"
                            values={{ count: panel.totalCount }}
                        />
                    </Button>
                )}
            </PanelFooter>
        </PaletteDialog>
    );
}

interface ResultContentProps {
    entityName: string;
    name: string;
    secondaryInformation?: string | null;
    search: string;
    isActive: boolean;
}

function ResultContent({ entityName, name, secondaryInformation, search, isActive }: ResultContentProps) {
    const { icon: Icon } = getEntityType(entityName);
    return (
        <>
            <IconTile>
                <Icon fontSize="small" />
            </IconTile>
            <OptionText>
                <Typography variant="body2" noWrap>
                    <HighlightedText text={name} search={search} />
                </Typography>
                {secondaryInformation && (
                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                        <HighlightedText text={secondaryInformation} search={search} />
                    </Typography>
                )}
            </OptionText>
            {isActive && (
                <Typography variant="caption" color="text.secondary">
                    <FormattedMessage id="fullTextSearchPrototype.palette.open" defaultMessage="Open ↵" />
                </Typography>
            )}
        </>
    );
}

const Trigger = styled("button")`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1.5)};
    width: 260px;
    margin-right: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(1, 1.5)};
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
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

const PaletteDialog = styled(Dialog)`
    & .MuiDialog-container {
        align-items: flex-start;
    }

    & .MuiDialog-paper {
        margin-top: 12vh;
        max-height: 70vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    & .MuiDialogTitle-root {
        display: none;
    }
`;

const PaletteInputRow = styled("div")`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(2, 3)};
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const PaletteInput = styled(InputBase)`
    font-size: 18px;
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

const ScrollArea = styled("div")`
    overflow-y: auto;
    flex-grow: 1;
`;

const IconTile = styled(OptionIcon)`
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    background-color: ${({ theme }) => theme.palette.grey[50]};
`;

const ThinProgress = styled(LinearProgress)`
    height: 2px;
`;

const ProgressPlaceholder = styled("div")`
    height: 2px;
`;
