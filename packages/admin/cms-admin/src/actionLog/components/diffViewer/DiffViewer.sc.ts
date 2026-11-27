import { Box, css, type Theme } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import type { ReactDiffViewerStylesOverride } from "react-diff-viewer-continued";

export const Root = styled(Box)(
    ({ theme }) => css`
        div[role="banner"] {
            display: none;
        }

        table {
            tr:first-of-type {
                td {
                    padding: 0;
                }
            }

            td:nth-of-type(2) {
                border-right: 1px solid ${theme.palette.grey["200"]};
            }

            th:first-of-type {
                border-right: 1px solid ${theme.palette.grey["200"]};
            }
        }
    `,
);

export const CodeFoldMessageContainer = styled(Box)(
    ({ theme }) => css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing(2)};
    `,
);

export const createStyles = (theme: Theme): ReactDiffViewerStylesOverride => {
    return {
        codeFoldExpandButton: {
            fontSize: theme.typography.subtitle2.fontSize,
            fontWeight: theme.typography.subtitle2.fontWeight,
            textDecoration: "underline",
            color: theme.palette.grey["900"],
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
        },
        diffAdded: {
            "& pre": {
                backgroundColor: alpha(theme.palette.success.main, 0.5),
                borderRadius: theme.shape.borderRadius,
                color: theme.palette.common.white,
                fontSize: theme.typography.caption.fontSize,
                lineHeight: "8px",
                minWidth: "14px",
                paddingBottom: "3px",
                paddingTop: "3px",
                textAlign: "center",
            },
        },
        diffContainer: {
            "& *": {
                fontFamily: theme.typography.fontFamily,
            },
            "& td": {
                paddingBottom: theme.spacing(2),
                paddingTop: theme.spacing(2),
            },
            minWidth: "unset",
        },
        diffRemoved: {
            "& pre": {
                backgroundColor: alpha(theme.palette.error.main, 0.3),
                borderRadius: theme.shape.borderRadius,
                color: theme.palette.common.white,
                fontSize: theme.typography.caption.fontSize,
                lineHeight: "8px",
                minWidth: "14px",
                paddingBottom: "3px",
                paddingTop: "3px",
                textAlign: "center",
            },
            textDecoration: "line-through",
        },
        line: {
            borderBottom: `1px solid ${theme.palette.common.white}`,
            marginTop: theme.spacing(2),
            paddingBottom: theme.spacing(2),
        },
        marker: {
            color: theme.palette.common.white,
        },
        titleBlock: {
            height: "auto",
            padding: 0,
        },
        variables: {
            light: {
                addedBackground: alpha(theme.palette.success.main, 0.1),
                codeFoldBackground: theme.palette.grey["50"],
                diffViewerTitleBackground: theme.palette.grey.A200,
                removedBackground: alpha(theme.palette.error.main, 0.1),
                wordAddedBackground: alpha(theme.palette.success.main, 0.2),
                wordRemovedBackground: alpha(theme.palette.error.main, 0.2),
            },
        },
        wordDiff: {
            fontWeight: theme.typography.subtitle2.fontWeight,
            color: theme.palette.grey["900"],
        },
        wordRemoved: {
            textDecoration: "line-through",
        },
    };
};
