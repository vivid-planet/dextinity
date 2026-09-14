import { Delete, MoreVertical } from "@dextinity/admin-icons";
import { IconButton, ListItem, ListItemText, Stack } from "@mui/material";
import { type MouseEventHandler, type ReactElement, type ReactNode, useState } from "react";
import { useIntl } from "react-intl";

import { DamThumbnail } from "../../dam/DataGrid/thumbnail/DamThumbnail";
import { DamPathLazy } from "./DamPathLazy";
import type { GQLDamFileFieldFileFragment } from "./FileField.gql.generated";
import { type ActionItem, FileFieldMenu, useHasFileFieldMenu } from "./FileFieldMenu";

interface FileFieldRowProps {
    file: GQLDamFileFieldFileFragment;
    onRemove: () => void;
    preview?: (file: GQLDamFileFieldFileFragment) => ReactNode;
    menuActions?: Array<ActionItem | ReactElement | null | undefined>;
}

export const FileFieldRow = ({ file, onRemove, preview, menuActions }: FileFieldRowProps) => {
    const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
    const intl = useIntl();
    const showMoreMenu = useHasFileFieldMenu(menuActions);

    const handleMoreClick: MouseEventHandler<HTMLElement> = (event) => setMenuAnchorEl(event.currentTarget);

    return (
        <ListItem
            divider
            secondaryAction={
                <Stack direction="row">
                    <IconButton
                        size="small"
                        onClick={onRemove}
                        aria-label={intl.formatMessage({ id: "dextinity.form.file.removeFile", defaultMessage: "Remove" })}
                    >
                        <Delete color="action" />
                    </IconButton>
                    {showMoreMenu && (
                        <IconButton
                            size="small"
                            onClick={handleMoreClick}
                            aria-label={intl.formatMessage({ id: "dextinity.form.file.moreActions", defaultMessage: "More actions" })}
                        >
                            <MoreVertical color="action" />
                        </IconButton>
                    )}
                </Stack>
            }
        >
            <Stack direction="row" alignItems="center" spacing={2} flex={1} minWidth={0}>
                {preview ? preview(file) : <DamThumbnail asset={{ ...file, __typename: "DamFile" }} />}
                <ListItemText
                    primary={file.name}
                    secondary={<DamPathLazy fileId={file.id} />}
                    primaryTypographyProps={{ variant: "subtitle1", noWrap: true }}
                    secondaryTypographyProps={{ variant: "body2", color: "textSecondary", noWrap: true, component: "span" }}
                />
            </Stack>
            {showMoreMenu && (
                <FileFieldMenu fileId={file.id} anchorEl={menuAnchorEl} onClose={() => setMenuAnchorEl(null)} menuActions={menuActions} />
            )}
        </ListItem>
    );
};
