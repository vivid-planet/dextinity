import { Button } from "@dextinity/admin";
import { Search } from "@dextinity/admin-icons";
import { ClickAwayListener, LinearProgress, Paper, Popper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { getEntityType } from "../shared/entityTypes";
import { HighlightedText } from "../shared/HighlightedText";
import {
    EmptyState,
    HeaderSearchInput,
    KeyboardHints,
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
 * Results are grouped by entity type. The group heading carries the type, so each row only needs the name and one
 * line of context (path, category, folder, …).
 */
export function GroupedSearchDropdown({ onSelectResult }: SearchDropdownVariantProps) {
    const intl = useIntl();
    const anchorRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [open, setOpen] = useState(false);

    const panel = useSearchPanel({
        onSelectResult,
        onClose: () => {
            setOpen(false);
            inputRef.current?.blur();
        },
    });

    useSearchShortcut(() => inputRef.current?.focus());

    useEffect(() => {
        scrollActiveOptionIntoView(listRef.current);
    }, [panel.activeIndex]);

    const activeItem = panel.items[panel.activeIndex];
    const groups = groupItemsByEntity(panel.items);
    const showsEmptyState = !panel.isSearchEmpty && !panel.loading && panel.hasResultsData && panel.results.length === 0;

    return (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
            <div ref={anchorRef}>
                <ExpandingInput
                    inputRef={inputRef}
                    value={panel.search}
                    onChange={(event) => {
                        panel.setSearch(event.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(event) => {
                        setOpen(true);
                        panel.handleKeyDown(event);
                    }}
                    placeholder={intl.formatMessage({ id: "fullTextSearchPrototype.placeholder", defaultMessage: "Search…" })}
                    startAdornment={<Search fontSize="small" />}
                    endAdornment={panel.isSearchEmpty && !open ? <ShortcutKey /> : undefined}
                    inputProps={{
                        role: "combobox",
                        "aria-expanded": open,
                        "aria-controls": "grouped-search-listbox",
                        "aria-activedescendant": activeItem ? optionId(activeItem.key) : undefined,
                    }}
                    className={open ? "is-open" : undefined}
                />
                <Popper open={open} anchorEl={anchorRef.current} placement="bottom-end" sx={{ zIndex: "modal" }}>
                    <Panel elevation={3}>
                        {panel.loading && !panel.isSearchEmpty ? <ThinProgress /> : <ProgressPlaceholder />}
                        <ScrollArea>
                            {showsEmptyState ? (
                                <EmptyState search={panel.debouncedSearch} />
                            ) : panel.isSearchEmpty && panel.items.length === 0 ? (
                                <RecentEmptyState />
                            ) : (
                                <OptionList ref={listRef} id="grouped-search-listbox" role="listbox">
                                    {groups.map(({ groupKey, entries }) => {
                                        if (groupKey === "showAll") {
                                            return null;
                                        }
                                        const isRecent = groupKey === "recentTerm" || groupKey === "recentResult";
                                        const { icon: Icon, pluralLabel } = getEntityType(groupKey);
                                        return (
                                            <li key={groupKey} role="presentation">
                                                {isRecent ? (
                                                    <RecentSectionsHeadings
                                                        kind={groupKey}
                                                        onClear={groupKey === "recentTerm" ? panel.recentSearches.clear : undefined}
                                                    />
                                                ) : (
                                                    <SectionHeading icon={<Icon fontSize="small" />}>{pluralLabel}</SectionHeading>
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
                                                                <IndentedText>
                                                                    <Typography variant="body2" noWrap>
                                                                        <HighlightedText text={item.result.name} search={panel.debouncedSearch} />
                                                                    </Typography>
                                                                    {item.result.secondaryInformation && (
                                                                        <Typography variant="caption" color="text.secondary" noWrap component="div">
                                                                            <HighlightedText
                                                                                text={item.result.secondaryInformation}
                                                                                search={panel.debouncedSearch}
                                                                            />
                                                                        </Typography>
                                                                    )}
                                                                </IndentedText>
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
                                <Button
                                    variant="textDark"
                                    size="small"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => panel.showAll()}
                                    className={activeItem?.kind === "showAll" ? "is-active" : undefined}
                                >
                                    <FormattedMessage
                                        id="fullTextSearchPrototype.showAll"
                                        defaultMessage="Show all {count} results"
                                        values={{ count: panel.totalCount }}
                                    />
                                </Button>
                            )}
                        </PanelFooter>
                    </Panel>
                </Popper>
            </div>
        </ClickAwayListener>
    );
}

const ExpandingInput = styled(HeaderSearchInput)`
    width: 220px;

    &.is-open {
        width: 320px;
    }
`;

const Panel = styled(Paper)`
    display: flex;
    flex-direction: column;
    width: 440px;
    max-height: min(560px, calc(100vh - 100px));
    margin-top: ${({ theme }) => theme.spacing(1)};
    overflow: hidden;
`;

const ScrollArea = styled("div")`
    overflow-y: auto;
    flex-grow: 1;
`;

const ThinProgress = styled(LinearProgress)`
    height: 2px;
`;

const ProgressPlaceholder = styled("div")`
    height: 2px;
`;

const IndentedText = styled(OptionText)`
    padding-left: ${({ theme }) => theme.spacing(5)};
`;
