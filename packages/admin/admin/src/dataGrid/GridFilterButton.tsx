import { Filter } from "@dextinity/admin-icons";
import { Chip } from "@mui/material";
import { gridFilterModelSelector, GridPreferencePanelsValue, useGridApiContext, useGridSelector } from "@mui/x-data-grid";
import { useCallback } from "react";
import { FormattedMessage } from "react-intl";

import { Button, type ButtonProps } from "../common/buttons/Button";
import { messages } from "../messages";

export function GridFilterButton(props: ButtonProps) {
    const apiRef = useGridApiContext();
    const filterModel = useGridSelector(apiRef, gridFilterModelSelector);
    const filterCount = filterModel.items.length;

    const handleFilterClick = useCallback(() => {
        if (
            apiRef.current.state.preferencePanel.open &&
            apiRef.current.state.preferencePanel.openedPanelValue === GridPreferencePanelsValue.filters
        ) {
            apiRef.current.hideFilterPanel();
        } else {
            apiRef.current.showFilterPanel();
        }
    }, [apiRef]);

    return (
        <Button
            responsive
            startIcon={<Filter />}
            variant="outlined"
            onPointerUp={(event) => {
                // Necessary workaround to make toggling the filter panel work
                // see https://github.com/mui/mui-x/issues/17130#issuecomment-2765832411
                if (apiRef.current.state.preferencePanel.open) {
                    event.stopPropagation();
                }
            }}
            onClick={handleFilterClick}
            endIcon={filterCount > 0 ? <Chip label={`${filterCount}`} size="small" /> : null}
            sx={{
                maxHeight: "40px",
            }}
            {...props}
        >
            <FormattedMessage {...messages.filter} />
        </Button>
    );
}
