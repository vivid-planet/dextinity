import type { SxProps, Theme } from "@mui/material";

export const lastContentColumnClassName = "TableBlock-lastContentColumn";

const getCommonDataGridStyles = (theme: Theme) => ({
    "--DataGrid-rowBorderColor": theme.palette.grey[100],
    borderLeft: 0,
    borderRight: 0,

    ".MuiDataGrid-columnHeaderTitleContainerContent": {
        width: "100%",
        justifyContent: "flex-end",
    },

    ".MuiDataGrid-columnHeaders .MuiDataGrid-filler[role='presentation']": {
        display: "none",
    },

    ".MuiDataGrid-columnHeader": {
        borderRight: `1px solid ${theme.palette.grey[100]}`,

        "&.MuiDataGrid-columnHeader--pinnedLeft.MuiDataGrid-columnHeader--withRightBorder": {
            borderRight: `1px solid ${theme.palette.grey[100]}`,
            boxShadow: "none",
        },

        "&.MuiDataGrid-columnHeader--pinnedRight.MuiDataGrid-columnHeader--withLeftBorder": {
            borderLeft: `1px solid ${theme.palette.grey[100]}`,
            boxShadow: "none",
        },

        [`&.${lastContentColumnClassName}`]: {
            borderRight: "none",
        },

        '&[data-field="actions"]': {
            borderLeft: `1px solid ${theme.palette.grey[100]}`,
        },
    },

    ".MuiDataGrid-cell": {
        borderBottom: `1px solid ${theme.palette.grey[100]}`,
        borderRight: `1px solid ${theme.palette.grey[100]}`,
        borderTop: "none",

        "&.MuiDataGrid-cellEmpty[role='presentation']": {
            display: "none",
        },

        "&.MuiDataGrid-cell--pinnedLeft.MuiDataGrid-cell--withRightBorder": {
            borderRightWidth: 1,
            boxShadow: "none",
        },

        "&.MuiDataGrid-cell--pinnedRight.MuiDataGrid-cell--withLeftBorder": {
            borderLeftWidth: 1,
            boxShadow: "none",
        },

        [`&.${lastContentColumnClassName}`]: {
            borderRight: "none",
        },

        '&[data-field="actions"]': {
            display: "flex",
            borderLeft: `1px solid ${theme.palette.grey[100]}`,
            borderRight: "none",
            justifyContent: "center",
            alignItems: "center",
            padding: 0,
        },
    },

    ".MuiDataGrid-columnSeparator": {
        display: "none",
    },
});

export const dataGridStyles: SxProps<Theme> = (theme) => getCommonDataGridStyles(theme);

export const freeDataGridStyles: SxProps<Theme> = (theme) => ({
    ...getCommonDataGridStyles(theme),

    '.MuiDataGrid-cell[data-field="actions"], .MuiDataGrid-columnHeader[data-field="actions"]': {
        position: "sticky",
        right: 0,
        zIndex: 1,
        backgroundColor: theme.palette.background.paper,
    },
});
