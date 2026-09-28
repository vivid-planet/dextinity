import { AppHeaderDropdown, ClearInputAdornment } from "@dextinity/admin";
import { Domain, Language, Search } from "@dextinity/admin-icons";
import {
    Box,
    Divider,
    InputAdornment,
    InputBase,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Typography,
    useTheme,
} from "@mui/material";
import { capitalCase } from "change-case";
import { Fragment, type ReactNode, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { findTextMatches, MarkedMatches } from "../common/MarkedMatches";
import type { ContentScope } from "./Provider";

type Option = {
    scope: ContentScope;
    label?: { [Key in keyof ContentScope]?: string };
};

interface Props {
    value: ContentScope;
    onChange: (value: ContentScope) => void;
    options: Array<Option>;
    searchable?: boolean;
    groupBy?: keyof ContentScope;
    icon?: ReactNode;
    renderOption?: (option: Option, query?: string, selected?: boolean) => ReactNode;
    renderSelectedOption?: (option: Option) => ReactNode;
}

export const contentScopeLocalStorageKey = "contentScopeSelect.selectedScope";

export function ContentScopeSelect({
    value,
    onChange,
    options,
    searchable,
    groupBy,
    icon = <Language />,
    renderOption,
    renderSelectedOption,
}: Props) {
    const intl = useIntl();
    const [searchValue, setSearchValue] = useState<string>("");
    const theme = useTheme();

    const hasMultipleDimensions = options.some((option) => Object.keys(option.scope).length > 1);

    let filteredOptions = options;

    if (searchable) {
        filteredOptions = options.filter((option) => {
            return (
                Object.values(option.scope).some((value) => value.toLowerCase().includes(searchValue.toLowerCase())) ||
                Object.values(option.label || []).some((value) => value?.toLowerCase().includes(searchValue.toLowerCase()))
            );
        });
    }

    let groups: Array<{ value: string; label: string | undefined; options: Option[] }> = [];

    if (groupBy) {
        if (hasMultipleDimensions) {
            for (const option of filteredOptions) {
                const groupForOption = groups.find((group) => group.value === option.scope[groupBy]);

                if (groupForOption) {
                    groupForOption.options.push(option);
                } else {
                    groups.push({ value: option.scope[groupBy], label: option.label ? option.label[groupBy] : undefined, options: [option] });
                }
            }
        } else {
            console.warn("ContentScopeSelect: groupBy is set but only one dimension is present. Ignoring groupBy.");
            groups = [{ value: "", label: "", options: filteredOptions }];
        }
    } else {
        groups = [{ value: "", label: "", options: filteredOptions }];
    }

    const selectedOption = options.find((option) => {
        return valueMatchesOption(value, option);
    });

    if (!selectedOption) {
        throw new Error("ContentScopeSelect: Can't find provided value in options.");
    }

    if (!renderOption) {
        renderOption = (option, query, isSelected) => {
            const text = Object.entries(option.scope)
                .filter(([dimension]) => (hasMultipleDimensions && groupBy ? dimension !== groupBy : true))
                .map(([key, value]) => (option.label && option.label[key]) ?? value)
                .join(" – ");
            const matches = findTextMatches(text, query);

            return (
                <>
                    <ListItemIcon>
                        <Domain />
                    </ListItemIcon>
                    <ListItemText
                        slotProps={{
                            primary: {
                                variant: isSelected ? "subtitle2" : "body2",
                            },
                        }}
                        sx={{ margin: 0 }}
                        primary={<MarkedMatches text={text} matches={matches} />}
                    />
                </>
            );
        };
    }

    if (!renderSelectedOption) {
        renderSelectedOption = (option) => {
            return Object.keys(option.scope)
                .map((key) => humanReadableLabel({ label: option.label ? option.label[key] : undefined, value: option.scope[key] }))
                .join(" / ");
        };
    }

    const handleChange = (selectedScope: ContentScope) => {
        localStorage.setItem(contentScopeLocalStorageKey, JSON.stringify(selectedScope));
        onChange(selectedScope);
    };

    return (
        <AppHeaderDropdown
            buttonChildren={renderSelectedOption(selectedOption)}
            startIcon={icon}
            slotProps={{
                root: {
                    sx: (theme) => ({
                        overflow: "hidden",
                        width: "100%",

                        [theme.breakpoints.up("md")]: {
                            width: "auto",
                        },
                    }),
                },
                button: {
                    slotProps: {
                        root: {
                            sx: (theme) => ({
                                width: "100%",
                                justifyContent: "start",

                                [theme.breakpoints.up("md")]: {
                                    justifyContent: "center",
                                },
                            }),
                        },
                        content: {
                            sx: (theme) => ({
                                width: "100%",
                                justifyContent: "start",

                                [theme.breakpoints.up("md")]: {
                                    justifyContent: "center",
                                },
                            }),
                        },

                        endIcon: {
                            sx: (theme) => ({
                                [theme.breakpoints.up("xs")]: {
                                    "&:not(:first-of-type)": {
                                        marginLeft: "auto",
                                    },
                                },

                                [theme.breakpoints.up("md")]: {
                                    "&:not(:first-of-type)": {
                                        marginLeft: theme.spacing(2),
                                    },
                                },
                            }),
                        },
                        typography: {
                            sx: {
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                            },
                        },
                    },
                },

                popover: {
                    anchorOrigin: { vertical: "bottom", horizontal: "left" },
                    transformOrigin: { vertical: "top", horizontal: "left" },
                    PaperProps: {
                        sx: (theme) => ({
                            minWidth: "350px",
                            maxHeight: "calc(100vh - 60px)",
                            [theme.breakpoints.down("md")]: {
                                width: "100%",
                                maxWidth: "none",
                                bottom: 0,
                            },
                        }),
                    },
                },
            }}
        >
            {(hideDropdown) => (
                <>
                    {searchable && (
                        <>
                            <Box sx={{ px: 3, py: 2 }}>
                                <InputBase
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <Search htmlColor={theme.palette.grey[900]} />
                                        </InputAdornment>
                                    }
                                    placeholder={intl.formatMessage({
                                        id: "dextinity.contentScopeSelect.searchInput.placeholder",
                                        defaultMessage: "Search...",
                                    })}
                                    value={searchValue}
                                    onChange={(event) => setSearchValue(event.currentTarget.value)}
                                    endAdornment={
                                        searchValue !== "" ? (
                                            <ClearInputAdornment
                                                onClick={() => setSearchValue("")}
                                                position="end"
                                                slotProps={{
                                                    buttonBase: { sx: { fontSize: "16px" } },
                                                }}
                                            />
                                        ) : undefined
                                    }
                                    autoFocus
                                    fullWidth
                                />
                            </Box>
                            <Divider />
                        </>
                    )}
                    <List sx={{ paddingTop: 0 }}>
                        {groups.map((group, index) => {
                            const showGroupHeader = hasMultipleDimensions;
                            const showGroupDivider = showGroupHeader && index !== groups.length - 1;
                            const groupLabel = humanReadableLabel(group);
                            const matches = findTextMatches(groupLabel, searchValue);

                            return (
                                <Fragment key={group.value}>
                                    {showGroupHeader && (
                                        <ListSubheader
                                            sx={(theme) => ({
                                                paddingX: theme.spacing(3),
                                                paddingTop: theme.spacing(4),
                                                paddingBottom: theme.spacing(2),
                                                lineHeight: "inherit",
                                            })}
                                        >
                                            <Typography variant="overline" sx={(theme) => ({ color: theme.palette.grey[500] })}>
                                                {matches ? <MarkedMatches text={groupLabel} matches={matches} /> : groupLabel}
                                            </Typography>
                                        </ListSubheader>
                                    )}
                                    {group.options.map((option) => {
                                        const isSelected = option === selectedOption;

                                        return (
                                            <ListItemButton
                                                key={JSON.stringify(option)}
                                                onClick={() => {
                                                    hideDropdown();
                                                    handleChange(option.scope);
                                                    setSearchValue("");
                                                }}
                                                selected={isSelected}
                                                sx={({ spacing }) => ({
                                                    paddingX: spacing(6),
                                                })}
                                            >
                                                {renderOption?.(option, searchValue, isSelected)}
                                            </ListItemButton>
                                        );
                                    })}
                                    {showGroupDivider && (
                                        <Divider
                                            sx={({ spacing, palette }) => ({ marginX: "8px", marginY: spacing(2), borderColor: palette.grey[50] })}
                                        />
                                    )}
                                </Fragment>
                            );
                        })}
                        {filteredOptions.length === 0 && (
                            <ListItem>
                                <FormattedMessage id="dextinity.contentScopeSelect.list.noOptions" defaultMessage="No options" />
                            </ListItem>
                        )}
                    </List>
                </>
            )}
        </AppHeaderDropdown>
    );
}

function humanReadableLabel({ label, value }: { label?: string; value: string }) {
    return label ?? capitalCase(value);
}

function valueMatchesOption(value: ContentScope, option: Option) {
    const optionMatchesAllValueDimensions = Object.keys(value).every((dimension) => value[dimension] === option.scope[dimension]);
    const valueMatchesAllOptionDimensions = Object.keys(option.scope).every((dimension) => option.scope[dimension] === value[dimension]);

    return optionMatchesAllValueDimensions && valueMatchesAllOptionDimensions;
}
