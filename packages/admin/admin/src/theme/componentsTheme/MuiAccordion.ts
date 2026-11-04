import { mergeOverrideStyles } from "../utils/mergeOverrideStyles";
import type { GetMuiComponentTheme } from "./getComponentsTheme";

export const getMuiAccordion: GetMuiComponentTheme<"MuiAccordion"> = (component) => ({
    ...component,
    defaultProps: {
        square: true,
        disableGutters: true,
        elevation: 0,
        ...component?.defaultProps,
    },
    styleOverrides: mergeOverrideStyles<"MuiAccordion">(component?.styleOverrides, {
        root: {
            border: "none",
            borderRadius: "4px",
            boxShadow: "0px 0px 4px 0px rgba(0,0,0,0.08)",
            "&:not(:last-child)": {
                marginBottom: "20px",
            },
            "&:before": {
                display: "none",
            },
            "& .MuiAccordionSummary-expandIconWrapper": {
                transform: "rotate(90deg)",
            },
            "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
                transform: "rotate(-90deg)",
            },
            "& .MuiAccordionSummary-content": {
                marginLeft: 10,
            },
        },
    }),
});
