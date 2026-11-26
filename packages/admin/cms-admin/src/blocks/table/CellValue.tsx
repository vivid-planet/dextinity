import { alpha, styled } from "@mui/material/styles";

import type { TableCellSettings } from "./createTableSettings";
import { useTableBlockContext } from "./TableBlockContext";

type Props = TableCellSettings & {
    isTemporarilyHighlighted?: boolean;
    value: unknown;
};

export const CellValue = ({ isTemporarilyHighlighted, value, rowSettings, columnSettings }: Props) => {
    const { CellBlock, getCellStyle } = useTableBlockContext();

    return (
        <CellValueContainer $isTemporarilyHighlighted={isTemporarilyHighlighted} sx={getCellStyle({ rowSettings, columnSettings })}>
            <RteContentWrapper>
                <RteContent>
                    <CellBlock.ReadOnlyComponent state={value} />
                </RteContent>
            </RteContentWrapper>
        </CellValueContainer>
    );
};

const CellValueContainer = styled("div")<{ $isTemporarilyHighlighted?: boolean }>(({ $isTemporarilyHighlighted, theme }) => ({
    position: "relative",
    marginLeft: theme.spacing(-2),
    marginRight: theme.spacing(-2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    height: "100%",

    "&:after": {
        content: "''",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: alpha(theme.palette.primary.dark, 0.4),
        opacity: $isTemporarilyHighlighted ? 1 : 0,
        transition: "opacity 1s ease-in-out",
        pointerEvents: "none",
    },
}));

const RteContentWrapper = styled("div")(({ theme }) => ({
    overflow: "hidden",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    // The data grid sets a line height as tall as the row, which cell content inherits.
    lineHeight: "normal",

    ".DextinityAdminRteBlockElement-root:first-child, .MuiTypography-root:first-child": {
        marginTop: 0,
    },

    ".DextinityAdminRteBlockElement-root:last-child, .MuiTypography-root:last-child": {
        marginBottom: 0,
    },
}));

const RteContent = styled("div")({
    marginTop: "auto",
    marginBottom: "auto",
    pointerEvents: "none",
});
