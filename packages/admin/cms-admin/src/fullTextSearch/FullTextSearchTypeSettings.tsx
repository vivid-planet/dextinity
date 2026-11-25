import { Settings } from "@dextinity/admin-icons";
import { IconButton, List, ListItem, ListItemIcon, ListItemText, Popover, Switch, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useId, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { FullTextSearchTypeIcon } from "./FullTextSearchTypeIcon";
import { useFullTextSearchTypeLabel } from "./useFullTextSearchTypeLabel";
import type { FullTextSearchType } from "./useFullTextSearchTypeSettings";

interface FullTextSearchTypeSettingsProps {
    knownTypes: FullTextSearchType[];
    disabledTypes: string[];
    onTypeEnabledChange: (type: string, enabled: boolean) => void;
}

export function FullTextSearchTypeSettings({ knownTypes, disabledTypes, onTypeEnabledChange }: FullTextSearchTypeSettingsProps) {
    const intl = useIntl();
    const getTypeLabel = useFullTextSearchTypeLabel();
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const titleId = useId();

    const enabledTypeCount = knownTypes.filter(({ type }) => !disabledTypes.includes(type)).length;

    return (
        <>
            <SettingsButton
                ref={buttonRef}
                aria-label={intl.formatMessage({ id: "dextinity.fullTextSearch.typeSettings", defaultMessage: "Choose what to search" })}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen(true)}
            >
                <Settings />
            </SettingsButton>
            <Popover
                open={open}
                anchorEl={buttonRef.current}
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { role: "dialog", "aria-labelledby": titleId } }}
            >
                <SettingsTitle id={titleId} variant="subtitle2" color="text.secondary">
                    <FormattedMessage id="dextinity.fullTextSearch.typeSettings" defaultMessage="Choose what to search" />
                </SettingsTitle>
                {knownTypes.length === 0 && (
                    <SettingsHint variant="body2" color="text.secondary">
                        <FormattedMessage
                            id="dextinity.fullTextSearch.typeSettings.noKnownTypes"
                            defaultMessage="The types you can search appear here after your first search."
                        />
                    </SettingsHint>
                )}
                <SettingsList dense>
                    {knownTypes.map((knownType) => {
                        const enabled = !disabledTypes.includes(knownType.type);
                        const labelId = `${titleId}-${knownType.type}`;

                        return (
                            <ListItem
                                key={knownType.type}
                                secondaryAction={
                                    <Switch
                                        edge="end"
                                        checked={enabled}
                                        // At least one type must stay enabled, an empty type list would search all types
                                        disabled={enabled && enabledTypeCount === 1}
                                        onChange={(event) => onTypeEnabledChange(knownType.type, event.target.checked)}
                                        slotProps={{ input: { "aria-labelledby": labelId } }}
                                    />
                                }
                            >
                                <ListItemIcon>
                                    <FullTextSearchTypeIcon searchType={knownType} />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={getTypeLabel(knownType)} />
                            </ListItem>
                        );
                    })}
                </SettingsList>
            </Popover>
        </>
    );
}

const SettingsButton = styled(IconButton)`
    flex-shrink: 0;
    background-color: ${({ theme }) => theme.palette.grey[50]};
`;

const SettingsTitle = styled(Typography)`
    padding: ${({ theme }) => theme.spacing(3, 4, 1)};
`;

const SettingsHint = styled(Typography)`
    max-width: 280px;
    padding: ${({ theme }) => theme.spacing(0, 4, 3)};
`;

const SettingsList = styled(List)`
    min-width: 280px;
    padding: ${({ theme }) => theme.spacing(0, 1, 2)};
`;
