import { Delete, Download, Excel, Favorite, Move } from "@dextinity/admin-icons";
import { ListItemIcon } from "@mui/material";

import { CrudMoreActionsMenu, CrudMoreActionsMenuItem } from "../CrudMoreActionsMenu";

export default {
    title: "components/dataGrid/CrudMoreActionsMenu",
};

export const Basic = () => {
    return (
        <CrudMoreActionsMenu
            selectionSize={2}
            overallActions={[
                {
                    label: "Export to Excel",
                    onClick: () => {},
                    icon: <Excel />,
                },
            ]}
            selectiveActions={[
                {
                    label: "Move",
                    onClick: () => {},
                    icon: <Move />,
                },
                {
                    label: "Delete",
                    onClick: () => {},
                    icon: <Delete />,
                    divider: true,
                },
                {
                    label: "Download",
                    onClick: () => {},
                    icon: <Download />,
                },
            ]}
        />
    );
};

export const CustomComponent = () => {
    const CustomAction = () => {
        return (
            <CrudMoreActionsMenuItem
                onClick={() => {
                    window.alert("Hello from custom action");
                }}
            >
                <ListItemIcon>
                    <Favorite />
                </ListItemIcon>
                Custom Action
            </CrudMoreActionsMenuItem>
        );
    };

    return (
        <CrudMoreActionsMenu
            overallActions={[
                {
                    label: "Export to Excel",
                    onClick: () => {},
                    icon: <Excel />,
                },
                <CustomAction key="custom-action" />,
            ]}
        />
    );
};
