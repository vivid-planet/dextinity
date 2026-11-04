import type { ComponentNameToClassKey, ThemeOptions } from "@mui/material";
import type { Components, Theme } from "@mui/material/styles";
import type {} from "@mui/x-data-grid/themeAugmentation";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-date-pickers-pro/themeAugmentation";

import { getMuiAccordion } from "./MuiAccordion";
import { getMuiAlert } from "./MuiAlert";
import { getMuiAlertTitle } from "./MuiAlertTitle";
import { getMuiAppBar } from "./MuiAppBar";
import { getMuiAutocomplete } from "./MuiAutocomplete";
import { getMuiBadge } from "./MuiBadge";
import { getMuiButton } from "./MuiButton";
import { getMuiButtonGroup } from "./MuiButtonGroup";
import { getMuiCard } from "./MuiCard";
import { getMuiCardContent } from "./MuiCardContent";
import { getMuiCardHeader } from "./MuiCardHeader";
import { getMuiCheckbox } from "./MuiCheckbox";
import { getMuiChip } from "./MuiChip";
import { getMuiDataGrid } from "./MuiDataGrid";
import { getMuiDialog } from "./MuiDialog";
import { getMuiDialogActions } from "./MuiDialogActions";
import { getMuiDialogContent } from "./MuiDialogContent";
import { getMuiDialogContentText } from "./MuiDialogContentText";
import { getMuiDialogTitle } from "./MuiDialogTitle";
import { getMuiDrawer } from "./MuiDrawer";
import { getMuiFormControlLabel } from "./MuiFormControlLabel";
import { getMuiFormHelperText } from "./MuiFormHelperText";
import { getMuiFormLabel } from "./MuiFormLabel";
import { getMuiIconButton } from "./MuiIconButton";
import { getMuiInput } from "./MuiInput";
import { getMuiInputAdornment } from "./MuiInputAdornment";
import { getMuiInputBase } from "./MuiInputBase";
import { getMuiLinearProgress } from "./MuiLinearProgress";
import { getMuiLink } from "./MuiLink";
import { getMuiList } from "./MuiList";
import { getMuiListItem } from "./MuiListItem";
import { getMuiListItemAvatar } from "./MuiListItemAvatar";
import { getMuiListItemButton } from "./MuiListItemButton";
import { getMuiListItemIcon } from "./MuiListItemIcon";
import { getMuiListItemText } from "./MuiListItemText";
import { getMuiMenu } from "./MuiMenu";
import { getMuiMenuItem } from "./MuiMenuItem";
import { getMuiNativeSelect } from "./MuiNativeSelect";
import { getMuiPaper } from "./MuiPaper";
import { getMuiPickerPopper } from "./MuiPickerPopper";
import { getMuiPickersInputBase } from "./MuiPickersInputBase";
import { getMuiPickersTextField } from "./MuiPickersTextField";
import { getMuiPopover } from "./MuiPopover";
import { getMuiRadio } from "./MuiRadio";
import { getMuiSelect } from "./MuiSelect";
import { getMuiSvgIcon } from "./MuiSvgIcon";
import { getMuiSwitch } from "./MuiSwitch";
import { getMuiTab } from "./MuiTab";
import { getMuiTableCell } from "./MuiTableCell";
import { getMuiTableFooter } from "./MuiTableFooter";
import { getMuiTablePagination } from "./MuiTablePagination";
import { getMuiTableRow } from "./MuiTableRow";
import { getMuiTabs } from "./MuiTabs";
import { getMuiToggleButton } from "./MuiToggleButton";
import { getMuiToggleButtonGroup } from "./MuiToggleButtonGroup";
import { getMuiTooltip } from "./MuiTooltip";
import { getMuiTypography } from "./MuiTypography";

export type GetMuiComponentTheme<ClassesName extends keyof ComponentNameToClassKey> = (
    component: Components[ClassesName],
    theme: Theme,
) => Components[ClassesName];

export const getComponentsTheme = (components: Components, theme: Theme): ThemeOptions["components"] => ({
    ...components,
    MuiAccordion: getMuiAccordion(components.MuiAccordion, theme),
    MuiAlert: getMuiAlert(components.MuiAlert, theme),
    MuiAlertTitle: getMuiAlertTitle(components.MuiAlertTitle, theme),
    MuiAppBar: getMuiAppBar(components.MuiAppBar, theme),
    MuiAutocomplete: getMuiAutocomplete(components.MuiAutocomplete, theme),
    MuiBadge: getMuiBadge(components.MuiBadge, theme),
    MuiButton: getMuiButton(components.MuiButton, theme),
    MuiButtonGroup: getMuiButtonGroup(components.MuiButtonGroup, theme),
    MuiCard: getMuiCard(components.MuiCard, theme),
    MuiCardContent: getMuiCardContent(components.MuiCardContent, theme),
    MuiCardHeader: getMuiCardHeader(components.MuiCardHeader, theme),
    MuiCheckbox: getMuiCheckbox(components.MuiCheckbox, theme),
    MuiChip: getMuiChip(components.MuiChip, theme),
    MuiDataGrid: getMuiDataGrid(components.MuiDataGrid, theme),
    MuiDialog: getMuiDialog(components.MuiDialog, theme),
    MuiDialogActions: getMuiDialogActions(components.MuiDialogActions, theme),
    MuiDialogContent: getMuiDialogContent(components.MuiDialogContent, theme),
    MuiDialogContentText: getMuiDialogContentText(components.MuiDialogContentText, theme),
    MuiDialogTitle: getMuiDialogTitle(components.MuiDialogTitle, theme),
    MuiDrawer: getMuiDrawer(components.MuiDrawer, theme),
    MuiFormControlLabel: getMuiFormControlLabel(components.MuiFormControlLabel, theme),
    MuiFormHelperText: getMuiFormHelperText(components.MuiFormHelperText, theme),
    MuiFormLabel: getMuiFormLabel(components.MuiFormLabel, theme),
    MuiIconButton: getMuiIconButton(components.MuiIconButton, theme),
    MuiInput: getMuiInput(components.MuiInput, theme),
    MuiInputAdornment: getMuiInputAdornment(components.MuiInputAdornment, theme),
    MuiInputBase: getMuiInputBase(components.MuiInputBase, theme),
    MuiLinearProgress: getMuiLinearProgress(components.MuiLinearProgress, theme),
    MuiLink: getMuiLink(components.MuiLink, theme),
    MuiList: getMuiList(components.MuiList, theme),
    MuiListItem: getMuiListItem(components.MuiListItem, theme),
    MuiListItemText: getMuiListItemText(components.MuiListItemText, theme),
    MuiListItemButton: getMuiListItemButton(components.MuiListItemButton, theme),
    MuiListItemIcon: getMuiListItemIcon(components.MuiListItemIcon, theme),
    MuiListItemAvatar: getMuiListItemAvatar(components.MuiListItemAvatar, theme),
    MuiMenu: getMuiMenu(components.MuiMenu, theme),
    MuiMenuItem: getMuiMenuItem(components.MuiMenuItem, theme),
    MuiNativeSelect: getMuiNativeSelect(components.MuiNativeSelect, theme),
    MuiPaper: getMuiPaper(components.MuiPaper, theme),
    MuiPickersTextField: getMuiPickersTextField(components.MuiPickersTextField),
    MuiPickersInputBase: getMuiPickersInputBase(components.MuiPickersInputBase, theme),
    MuiPopover: getMuiPopover(components.MuiPopover, theme),
    MuiRadio: getMuiRadio(components.MuiRadio, theme),
    MuiSelect: getMuiSelect(components.MuiSelect, theme),
    MuiSvgIcon: getMuiSvgIcon(components.MuiSvgIcon, theme),
    MuiSwitch: getMuiSwitch(components.MuiSwitch, theme),
    MuiTab: getMuiTab(components.MuiTab, theme),
    MuiTableCell: getMuiTableCell(components.MuiTableCell, theme),
    MuiTableRow: getMuiTableRow(components.MuiTableRow, theme),
    MuiTabs: getMuiTabs(components.MuiTabs, theme),
    MuiToggleButton: getMuiToggleButton(components.MuiToggleButton, theme),
    MuiToggleButtonGroup: getMuiToggleButtonGroup(components.MuiToggleButtonGroup, theme),
    MuiTooltip: getMuiTooltip(components.MuiTooltip, theme),
    MuiTypography: getMuiTypography(components.MuiTypography, theme),
    MuiTablePagination: getMuiTablePagination(components.MuiTablePagination, theme),
    MuiPickerPopper: getMuiPickerPopper(components.MuiPickerPopper, theme),
    MuiTableFooter: getMuiTableFooter(components.MuiTableFooter, theme),
});
