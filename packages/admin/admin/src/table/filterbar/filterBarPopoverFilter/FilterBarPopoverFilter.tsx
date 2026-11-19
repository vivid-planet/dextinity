import { Check, Reset } from "@dextinity/admin-icons";
// eslint-disable-next-line no-restricted-imports
import { Button, type ButtonProps, type ComponentsOverrides, Popover as MuiPopover, type Theme } from "@mui/material";
import { css, useThemeProps } from "@mui/material/styles";
import { type ComponentType, type MouseEvent, type PropsWithChildren, useState } from "react";
import { Form, useForm } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { createComponentSlot } from "../../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../../helpers/ThemedComponentBaseProps";
import { messages } from "../../../messages";
import { dirtyFieldsCount } from "../dirtyFieldsCount";
import type { FilterBarActiveFilterBadgeProps } from "../filterBarActiveFilterBadge/FilterBarActiveFilterBadge";
import { FilterBarButton, type FilterBarButtonProps } from "../filterBarButton/FilterBarButton";

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export type FilterBarPopoverFilterClassKey = "root" | "fieldBarWrapper" | "popoverContentContainer" | "buttonsContainer" | "popover";

const Root = createComponentSlot("div")<FilterBarPopoverFilterClassKey>({
    componentName: "FilterBarPopoverFilter",
    slotName: "root",
})(
    ({ theme }) => css`
        background-color: ${theme.palette.common.white};
        position: relative;
        margin-bottom: 10px;
        border-radius: 2px;
        margin-right: 6px;
    `,
);

const FieldBarWrapper = createComponentSlot("div")<FilterBarPopoverFilterClassKey>({
    componentName: "FilterBarPopoverFilter",
    slotName: "fieldBarWrapper",
})(css`
    position: relative;
`);

const PopoverContentContainer = createComponentSlot("div")<FilterBarPopoverFilterClassKey>({
    componentName: "FilterBarPopoverFilter",
    slotName: "popoverContentContainer",
})(css`
    min-width: 300px;

    .DextinityAdminFormFieldContainer-root {
        box-sizing: border-box;
        padding: 20px;
        margin-bottom: 0;
    }
`);

const ButtonsContainer = createComponentSlot("div")<FilterBarPopoverFilterClassKey>({
    componentName: "FilterBarPopoverFilter",
    slotName: "buttonsContainer",
})(
    ({ theme }) => css`
        border-top: 1px solid ${theme.palette.grey[100]};
        justify-content: space-between;
        box-sizing: border-box;
        padding: 10px 15px;
        display: flex;
        height: 60px;
    `,
);

const Popover = createComponentSlot(MuiPopover)<FilterBarPopoverFilterClassKey>({
    componentName: "FilterBarPopoverFilter",
    slotName: "popover",
})();

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export interface FilterBarPopoverFilterProps extends ThemedComponentBaseProps<{
    root: "div";
    fieldBarWrapper: "div";
    popoverContentContainer: "div";
    buttonsContainer: "div";
    contentContainer: "div";
    popover: typeof Popover;
}> {
    label: string;
    dirtyFieldsBadge?: ComponentType<FilterBarActiveFilterBadgeProps>;
    calcNumberDirtyFields?: (values: Record<string, any>, registeredFields: string[]) => number;
    submitButtonProps?: Partial<ButtonProps>;
    resetButtonProps?: Partial<ButtonProps>;
    filterBarButtonProps?: Partial<FilterBarButtonProps>;
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export function FilterBarPopoverFilter(inProps: PropsWithChildren<FilterBarPopoverFilterProps>) {
    const {
        children,
        label,
        dirtyFieldsBadge,
        calcNumberDirtyFields = dirtyFieldsCount,
        submitButtonProps,
        resetButtonProps,
        filterBarButtonProps,
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminFilterBarPopoverFilter" });

    const outerForm = useForm();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    return (
        <Root {...slotProps?.root} {...restProps}>
            <Form
                onSubmit={(values) => {
                    for (const name in values) {
                        outerForm.change(name, values[name]);
                    }
                }}
                initialValues={outerForm.getState().values}
            >
                {({ form, values, handleSubmit, dirtyFields }) => {
                    const countValue = calcNumberDirtyFields(values, form.getRegisteredFields());
                    return (
                        <FieldBarWrapper {...slotProps?.fieldBarWrapper}>
                            <FilterBarButton
                                openPopover={open}
                                numberDirtyFields={countValue}
                                onClick={handleClick}
                                dirtyFieldsBadge={dirtyFieldsBadge}
                                {...filterBarButtonProps}
                            >
                                {label}
                            </FilterBarButton>
                            <Popover
                                open={open}
                                anchorEl={anchorEl}
                                {...slotProps?.popover}
                                onClose={() => {
                                    setAnchorEl(null);
                                    handleSubmit();
                                }}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "left",
                                }}
                                PaperProps={{
                                    square: true,
                                    elevation: 1,
                                    ...slotProps?.popover?.PaperProps,
                                    sx: {
                                        marginLeft: "-1", //due to border of popover, but now overrideable with styling if needed
                                        marginTop: "2", //due to boxShadow of popover to not overlap border of clickable fieldBar
                                        ...slotProps?.popover?.PaperProps?.sx,
                                    },
                                }}
                                elevation={2}
                                keepMounted
                            >
                                <PopoverContentContainer {...slotProps?.popoverContentContainer}>
                                    {children}
                                    <ButtonsContainer {...slotProps?.buttonsContainer}>
                                        <Button
                                            type="reset"
                                            variant="text"
                                            onClick={() => {
                                                form.getRegisteredFields().map((name) => {
                                                    outerForm.change(name, undefined);
                                                });
                                                form.reset();

                                                setAnchorEl(null);
                                            }}
                                            startIcon={<Reset />}
                                            {...resetButtonProps}
                                        >
                                            <FormattedMessage {...messages.reset} />
                                        </Button>

                                        <Button
                                            type="submit"
                                            color="primary"
                                            variant="contained"
                                            onClick={() => {
                                                handleSubmit();
                                                setAnchorEl(null);
                                            }}
                                            startIcon={<Check />}
                                            disabled={Object.values(dirtyFields).length === 0}
                                            {...submitButtonProps}
                                        >
                                            <FormattedMessage {...messages.apply} />
                                        </Button>
                                    </ButtonsContainer>
                                </PopoverContentContainer>
                            </Popover>
                        </FieldBarWrapper>
                    );
                }}
            </Form>
        </Root>
    );
}

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminFilterBarPopoverFilter: FilterBarPopoverFilterClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminFilterBarPopoverFilter: FilterBarPopoverFilterProps;
    }

    interface Components {
        DextinityAdminFilterBarPopoverFilter?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminFilterBarPopoverFilter"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminFilterBarPopoverFilter"];
        };
    }
}
