import { Columns4 } from "@dextinity/admin-icons";
import { GridPreferencePanelsValue, useGridApiContext } from "@mui/x-data-grid";
import { useCallback } from "react";
import { FormattedMessage } from "react-intl";

import { Button, type ButtonProps } from "../common/buttons/Button";
import { messages } from "../messages";

export function GridColumnsButton(props: ButtonProps) {
    const apiRef = useGridApiContext();

    const handleFilterClick = useCallback(() => {
        apiRef.current.showPreferences(GridPreferencePanelsValue.columns);
    }, [apiRef]);

    return (
        <Button responsive startIcon={<Columns4 />} variant="outlined" onClick={handleFilterClick} {...props}>
            <FormattedMessage {...messages.columns} />
        </Button>
    );
}
