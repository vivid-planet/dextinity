import { Assets, Delete, MoreVertical } from "@dextinity/admin-icons";
import { BlockAdminComponentButton, BlockAdminComponentPaper } from "@dextinity/cms-admin";
import { Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { type ReactNode, useState } from "react";
import type { FieldRenderProps } from "react-final-form";
import { FormattedMessage, useIntl } from "react-intl";

import { ChooseDamFileDialog } from "./ChooseDamFileDialog.js";
import type { DamBlockFile } from "./damBlockFile.js";

interface DamFileFieldMenuAction {
    label: ReactNode;
    icon: ReactNode;
    onClick: () => void;
}

interface DamFileFieldProps extends FieldRenderProps<DamBlockFile | undefined, HTMLElement> {
    buttonText?: ReactNode;
    allowedMimetypes?: string[];
    preview?: ReactNode;
    menuActions?: DamFileFieldMenuAction[];
}

/** The file field of the blocks: `FileField` of `@dextinity/cms-admin` with the DAM's REST API */
export function DamFileField({ input, buttonText, allowedMimetypes, preview, menuActions = [] }: DamFileFieldProps) {
    const intl = useIntl();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const file = input.value || undefined;

    if (!file) {
        return (
            <>
                <BlockAdminComponentButton onClick={() => setIsDialogOpen(true)} startIcon={<Assets />} size="large">
                    {buttonText ?? <FormattedMessage id="dextinity.form.file.chooseFile" defaultMessage="Choose file" />}
                </BlockAdminComponentButton>
                {isDialogOpen && (
                    <ChooseDamFileDialog
                        allowedMimetypes={allowedMimetypes}
                        onClose={() => setIsDialogOpen(false)}
                        onChooseFile={(chosenFile) => {
                            setIsDialogOpen(false);
                            input.onChange(chosenFile);
                        }}
                    />
                )}
            </>
        );
    }

    return (
        <BlockAdminComponentPaper disablePadding>
            <Stack direction="row" spacing={3} alignItems="center" padding={3}>
                {preview}
                <Stack flexGrow={1} minWidth={0}>
                    <Typography variant="subtitle1" noWrap>
                        {file.name}
                    </Typography>
                    {file.archived && (
                        <Typography variant="body2" color="textSecondary">
                            <FormattedMessage id="dextinity.dam.archived" defaultMessage="Archived" />
                        </Typography>
                    )}
                </Stack>
                {menuActions.length > 0 && (
                    <IconButton
                        onClick={(event) => setMenuAnchor(event.currentTarget)}
                        aria-label={intl.formatMessage({ id: "dextinity.form.file.moreActions", defaultMessage: "More actions" })}
                    >
                        <MoreVertical />
                    </IconButton>
                )}
            </Stack>
            <Menu anchorEl={menuAnchor} open={menuAnchor !== null} onClose={() => setMenuAnchor(null)}>
                {menuActions.map((action, index) => (
                    <MenuItem
                        // The actions have no IDs, and they don't change while the menu is open
                        key={index}
                        onClick={() => {
                            setMenuAnchor(null);
                            action.onClick();
                        }}
                    >
                        <ListItemIcon>{action.icon}</ListItemIcon>
                        <ListItemText primary={action.label} />
                    </MenuItem>
                ))}
            </Menu>
            <Divider />
            <BlockAdminComponentButton startIcon={<Delete />} onClick={() => input.onChange(undefined)}>
                <FormattedMessage id="dextinity.form.file.empty" defaultMessage="Empty" />
            </BlockAdminComponentButton>
        </BlockAdminComponentPaper>
    );
}
