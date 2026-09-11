import { ListItemIcon, Menu, MenuItem } from "@mui/material";
import { type MouseEvent, useState } from "react";
import { FormattedMessage } from "react-intl";

import { Button } from "../common/buttons/Button";
import { useSnackbarApi } from "../snackbar/SnackbarProvider";
import { UndoSnackbar } from "../snackbar/UndoSnackbar";
import { CrudVisibilityIcon } from "./CrudVisibilityIcon";

export interface CrudVisibilityProps {
    visibility: boolean;
    onUpdateVisibility: (visibility: boolean) => Promise<void>;
}

export const CrudVisibility = ({ visibility, onUpdateVisibility }: CrudVisibilityProps) => {
    const snackbarApi = useSnackbarApi();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleVisibilityClick = (visibility: boolean) => {
        onUpdateVisibility(visibility);
        handleMenuClose();
        snackbarApi.showSnackbar(
            <UndoSnackbar
                message={
                    <FormattedMessage
                        id="dextinity.common.visibilityChanged"
                        defaultMessage="Changed visibility to {visibility, select, true {published} false {unpublished} other {unknown}}"
                        values={{
                            visibility,
                        }}
                    />
                }
                onUndoClick={() => {
                    onUpdateVisibility(!visibility);
                }}
            />,
        );
    };

    return (
        <>
            <Button size="small" onClick={handleMenuOpen} startIcon={<CrudVisibilityIcon visibility={visibility} />} variant="textDark">
                <FormattedMessage
                    id="dextinity.common.visibility"
                    defaultMessage="{visibility, select, true {Published} false {Unpublished} other {unknown}}"
                    values={{
                        visibility,
                    }}
                />
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => handleVisibilityClick(true)} disabled={visibility == true}>
                    <ListItemIcon>
                        <CrudVisibilityIcon visibility={true} />
                    </ListItemIcon>
                    <FormattedMessage id="dextinity.common.visibility.published" defaultMessage="Published" />
                </MenuItem>
                <MenuItem onClick={() => handleVisibilityClick(false)} disabled={visibility == false}>
                    <ListItemIcon>
                        <CrudVisibilityIcon visibility={false} />
                    </ListItemIcon>
                    <FormattedMessage id="dextinity.common.visibility.unpublished" defaultMessage="Unpublished" />
                </MenuItem>
            </Menu>
        </>
    );
};
