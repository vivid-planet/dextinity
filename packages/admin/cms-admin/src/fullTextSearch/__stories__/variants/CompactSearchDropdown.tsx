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
    OptionIcon,
    optionId,
    OptionList,
    OptionText,
    PanelOption,
    RecentEmptyState,
    RecentItemContent,
    RecentSectionsHeadings,
    ShortcutKey,
} from "../shared/SearchPanelParts";
import type { SearchDropdownVariantProps } from "../shared/types";
import { scrollActiveOptionIntoView } from "../shared/useListKeyboardNavigation";
import { groupItemsByEntity, type PanelItem, useSearchPanel } from "../shared/useSearchPanel";
import { useSearchShortcut } from "../shared/useSearchShortcut";

/**
 * One line per result, in relevance order: type icon, name, context and type label. The densest option, showing the
 * most results without scrolling.
 */
export function CompactSearchDropdown({ onSelectResult }: SearchDropdownVariantProps) {
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
        initialLimit: 10,
    });

    useSearchShortcut(() => inputRef.current?.focus());

    useEffect(() => {
        scrollActiveOptionIntoView(listRef.current);
    }, [panel.activeIndex]);

    const activeItem = panel.items[panel.activeIndex];
    const showsEmptyState = !panel.isSearchEmpty && !panel.loading && panel.hasResultsData && panel.results.length === 0;

    const renderOption = (item: PanelItem, index: number) => (
        <PanelOption
            key={item.key}
            item={item}
            isActive={index === panel.activeIndex}
            onSelect={() => panel.selectItem(item)}
            onHover={() => panel.setActiveIndex(index)}
        >
            {item.kind === "result" ? (
                <ResultRow result={item.result} search={panel.debouncedSearch} />
            ) : item.kind === "showAll" ? (
                <Typography variant="body2" color="primary">
                    <FormattedMessage
                        id="fullTextSearchPrototype.showMore"
                        defaultMessage="Show {count, plural, one {# more result} other {# more results}}"
                        values={{ count: panel.totalCount - panel.results.length }}
                    />
                </Typography>
            ) : (
                <RecentItemContent item={item} />
            )}
        </PanelOption>
    );

    return (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
            <div ref={anchorRef}>
                <Input
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
                        "aria-controls": "compact-search-listbox",
                        "aria-activedescendant": activeItem ? optionId(activeItem.key) : undefined,
                    }}
                />
                <Popper open={open} anchorEl={anchorRef.current} placement="bottom-start" sx={{ zIndex: "modal" }}>
                    <Panel elevation={3}>
                        {panel.loading && !panel.isSearchEmpty ? <ThinProgress /> : <ProgressPlaceholder />}
                        {showsEmptyState ? (
                            <EmptyState search={panel.debouncedSearch} />
                        ) : panel.isSearchEmpty && panel.items.length === 0 ? (
                            <RecentEmptyState />
                        ) : (
                            <ScrollableOptionList ref={listRef} id="compact-search-listbox" role="listbox">
                                {panel.isSearchEmpty ? (
                                    groupItemsByEntity(panel.items).map(({ groupKey, entries }) => (
                                        <li key={groupKey} role="presentation">
                                            <RecentSectionsHeadings
                                                kind={groupKey === "recentTerm" ? "recentTerm" : "recentResult"}
                                                onClear={groupKey === "recentTerm" ? panel.recentSearches.clear : undefined}
                                            />
                                            <OptionList role="group">{entries.map(({ item, index }) => renderOption(item, index))}</OptionList>
                                        </li>
                                    ))
                                ) : (
                                    <>
                                        <ResultCount role="presentation">
                                            <Typography variant="caption" color="text.secondary">
                                                <FormattedMessage
                                                    id="fullTextSearchPrototype.resultCount"
                                                    defaultMessage="{count, plural, one {# result} other {# results}}"
                                                    values={{ count: panel.totalCount }}
                                                />
                                            </Typography>
                                        </ResultCount>
                                        {panel.items.map(renderOption)}
                                    </>
                                )}
                            </ScrollableOptionList>
                        )}
                    </Panel>
                </Popper>
            </div>
        </ClickAwayListener>
    );
}

function ResultRow({ result, search }: { result: { entityName: string; name: string; secondaryInformation?: string | null }; search: string }) {
    const { icon: Icon, label } = getEntityType(result.entityName);
    return (
        <>
            <OptionIcon>
                <Icon fontSize="small" />
            </OptionIcon>
            <SingleLineText>
                <Name variant="body2" noWrap>
                    <HighlightedText text={result.name} search={search} />
                </Name>
                {result.secondaryInformation && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                        <HighlightedText text={result.secondaryInformation} search={search} />
                    </Typography>
                )}
            </SingleLineText>
            <TypeLabel variant="caption" color="text.secondary">
                {label}
            </TypeLabel>
        </>
    );
}

const Input = styled(HeaderSearchInput)`
    width: 360px;
`;

const Panel = styled(Paper)`
    width: 520px;
    margin-top: ${({ theme }) => theme.spacing(1)};
    overflow: hidden;
`;

const ScrollableOptionList = styled(OptionList)`
    max-height: min(480px, calc(100vh - 100px));
    overflow-y: auto;
`;

const SingleLineText = styled(OptionText)`
    display: flex;
    align-items: baseline;
    gap: ${({ theme }) => theme.spacing(2)};
`;

const Name = styled(Typography)`
    flex-shrink: 0;
    max-width: 60%;
`;

const TypeLabel = styled(Typography)`
    flex-shrink: 0;
`;

const ResultCount = styled("li")`
    padding: ${({ theme }) => theme.spacing(0.5, 3, 1)};
`;

const ThinProgress = styled(LinearProgress)`
    height: 2px;
`;

const ProgressPlaceholder = styled("div")`
    height: 2px;
`;
