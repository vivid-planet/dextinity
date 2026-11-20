import { Button } from "@dextinity/admin";
import { Search, Time } from "@dextinity/admin-icons";
import { InputBase, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { PropsWithChildren, ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { getEntityType } from "./entityTypes";
import type { PanelItem } from "./useSearchPanel";
import { isMacPlatform } from "./useSearchShortcut";

export const optionId = (key: string) => `full-text-search-option-${key.replace(/[^a-zA-Z0-9-_]/g, "-")}`;

interface OptionProps {
    item: PanelItem;
    isActive: boolean;
    onSelect: () => void;
    onHover: () => void;
}

export function PanelOption({ item, isActive, onSelect, onHover, children }: PropsWithChildren<OptionProps>) {
    return (
        <OptionRoot
            id={optionId(item.key)}
            role="option"
            aria-selected={isActive}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onSelect}
            onMouseMove={onHover}
        >
            {children}
        </OptionRoot>
    );
}

export function RecentItemContent({ item }: { item: PanelItem }) {
    if (item.kind === "recentTerm") {
        return (
            <>
                <OptionIcon>
                    <Time fontSize="small" />
                </OptionIcon>
                <OptionText>
                    <Typography variant="body2" noWrap>
                        {item.term}
                    </Typography>
                </OptionText>
            </>
        );
    }
    if (item.kind === "recentResult") {
        const { icon: Icon, label } = getEntityType(item.result.entityName);
        return (
            <>
                <OptionIcon>
                    <Icon fontSize="small" />
                </OptionIcon>
                <OptionText>
                    <Typography variant="body2" noWrap>
                        {item.result.name}
                    </Typography>
                    {item.result.secondaryInformation && (
                        <Typography variant="caption" color="text.secondary" noWrap component="div">
                            {item.result.secondaryInformation}
                        </Typography>
                    )}
                </OptionText>
                <Typography variant="caption" color="text.secondary">
                    {label}
                </Typography>
            </>
        );
    }
    return null;
}

export function SectionHeading({ icon, children, action }: PropsWithChildren<{ icon?: ReactNode; action?: ReactNode }>) {
    return (
        <SectionHeadingRoot>
            {icon}
            <Typography variant="overline" color="text.secondary" component="div" sx={{ flexGrow: 1 }}>
                {children}
            </Typography>
            {action}
        </SectionHeadingRoot>
    );
}

export function RecentSectionsHeadings({ kind, onClear }: { kind: "recentTerm" | "recentResult"; onClear?: () => void }) {
    return (
        <SectionHeading
            action={
                onClear ? (
                    <ClearButton variant="textDark" size="small" onClick={onClear}>
                        <FormattedMessage id="fullTextSearchPrototype.recent.clear" defaultMessage="Clear" />
                    </ClearButton>
                ) : undefined
            }
        >
            {kind === "recentTerm" ? (
                <FormattedMessage id="fullTextSearchPrototype.recent.searches" defaultMessage="Recent searches" />
            ) : (
                <FormattedMessage id="fullTextSearchPrototype.recent.opened" defaultMessage="Recently opened" />
            )}
        </SectionHeading>
    );
}

export function KeyboardHints() {
    return (
        <KeyboardHintsRoot>
            <KeyboardHint keys={["↑", "↓"]}>
                <FormattedMessage id="fullTextSearchPrototype.hint.navigate" defaultMessage="Navigate" />
            </KeyboardHint>
            <KeyboardHint keys={["↵"]}>
                <FormattedMessage id="fullTextSearchPrototype.hint.open" defaultMessage="Open" />
            </KeyboardHint>
            <KeyboardHint keys={["Esc"]}>
                <FormattedMessage id="fullTextSearchPrototype.hint.close" defaultMessage="Close" />
            </KeyboardHint>
        </KeyboardHintsRoot>
    );
}

function KeyboardHint({ keys, children }: PropsWithChildren<{ keys: string[] }>) {
    return (
        <Typography variant="caption" color="text.secondary" component="span">
            {keys.map((key) => (
                <Kbd key={key}>{key}</Kbd>
            ))}{" "}
            {children}
        </Typography>
    );
}

export function ShortcutKey() {
    return <Kbd>{isMacPlatform() ? "⌘K" : "Ctrl K"}</Kbd>;
}

export function EmptyState({ search }: { search: string }) {
    return (
        <EmptyStateRoot>
            <Search color="disabled" />
            <Typography variant="body2">
                <FormattedMessage
                    id="fullTextSearchPrototype.noResults"
                    defaultMessage="No results for “{search}”"
                    values={{ search: <strong key="search">{search}</strong> }}
                />
            </Typography>
            <Typography variant="caption" color="text.secondary">
                <FormattedMessage id="fullTextSearchPrototype.noResults.hint" defaultMessage="Check the spelling or try a shorter search term." />
            </Typography>
        </EmptyStateRoot>
    );
}

export function RecentEmptyState() {
    return (
        <EmptyStateRoot>
            <Typography variant="caption" color="text.secondary">
                <FormattedMessage
                    id="fullTextSearchPrototype.recent.empty"
                    defaultMessage="Search pages, news, products, files and redirects of the current scope."
                />
            </Typography>
        </EmptyStateRoot>
    );
}

export const HeaderSearchInput = styled(InputBase)`
    color: ${({ theme }) => theme.palette.common.white};
    background-color: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    padding: ${({ theme }) => theme.spacing(0.5, 1.5)};
    margin-right: ${({ theme }) => theme.spacing(2)};
    gap: ${({ theme }) => theme.spacing(1)};
    transition: ${({ theme }) => theme.transitions.create(["width", "background-color", "border-color"])};

    &.Mui-focused {
        background-color: rgba(255, 255, 255, 0.2);
        border-color: ${({ theme }) => theme.palette.primary.main};
    }

    & input::placeholder {
        color: rgba(255, 255, 255, 0.7);
        opacity: 1;
    }
`;

export const OptionList = styled("ul")`
    list-style: none;
    margin: 0;
    padding: ${({ theme }) => theme.spacing(1, 0)};
`;

const OptionRoot = styled("li")`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(1.5, 3)};
    cursor: pointer;
    border-left: 2px solid transparent;

    &[aria-selected="true"] {
        background-color: ${({ theme }) => theme.palette.action.hover};
        border-left-color: ${({ theme }) => theme.palette.primary.main};
    }
`;

export const OptionIcon = styled("span")`
    display: flex;
    color: ${({ theme }) => theme.palette.text.secondary};
`;

export const OptionText = styled("span")`
    flex-grow: 1;
    min-width: 0;
`;

const SectionHeadingRoot = styled("div")`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1)};
    padding: ${({ theme }) => theme.spacing(1.5, 3, 0.5)};
    color: ${({ theme }) => theme.palette.text.secondary};
`;

const ClearButton = styled(Button)`
    min-width: 0;
    padding: 0;
`;

const KeyboardHintsRoot = styled("div")`
    display: flex;
    gap: ${({ theme }) => theme.spacing(3)};
`;

export const Kbd = styled("kbd")`
    display: inline-block;
    min-width: 18px;
    margin-right: 2px;
    padding: 0 ${({ theme }) => theme.spacing(0.75)};
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    background-color: ${({ theme }) => theme.palette.grey[50]};
    color: ${({ theme }) => theme.palette.text.secondary};
    font-family: inherit;
    font-size: 11px;
    line-height: 18px;
    text-align: center;
`;

export const PanelFooter = styled("div")`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(1.5, 3)};
    border-top: 1px solid ${({ theme }) => theme.palette.divider};
    background-color: ${({ theme }) => theme.palette.grey[50]};
`;

const EmptyStateRoot = styled("div")`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1)};
    padding: ${({ theme }) => theme.spacing(5, 3)};
    text-align: center;
`;
