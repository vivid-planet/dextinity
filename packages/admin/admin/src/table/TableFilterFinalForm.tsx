import { Clear } from "@dextinity/admin-icons";
import { Grid, Typography } from "@mui/material";
import type { AnyObject } from "final-form";
import { Component, type ReactNode } from "react";
import { Form, type FormProps, type FormRenderProps, type RenderableProps } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { Button } from "../common/buttons/Button";
import { renderFinalFormChildren } from "../renderFinalFormChildren";
import type { IFilterApi } from "./useTableQueryFilter";

type Props<FilterValues = AnyObject> = Omit<FormProps<FilterValues>, "onSubmit" | "initialValues"> & {
    headline?: ReactNode;
    resetButton?: boolean;
    onSubmit?: FormProps<FilterValues>["onSubmit"];
    filterApi: IFilterApi<FilterValues>;
};

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export class TableFilterFinalForm<FilterValues = AnyObject> extends Component<Props<FilterValues>> {
    public render() {
        // remove render, children and component from forwardProps as we define render and those would interfere
        const { headline, resetButton, render, children, component, onSubmit, ...forwardProps } = this.props;
        return (
            <Form
                onSubmit={
                    onSubmit
                        ? onSubmit
                        : () => {
                              return;
                          }
                }
                form={this.props.filterApi.formApi}
                render={this.renderForm}
                {...forwardProps}
            />
        );
    }
    private renderForm = (formRenderProps: FormRenderProps<FilterValues>) => {
        return (
            <form onSubmit={formRenderProps.handleSubmit}>
                <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                    {(this.props.headline || this.props.resetButton) && (
                        <Grid size={12}>
                            <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                                {this.props.headline && (
                                    <Grid>
                                        <Typography variant="h4">{this.props.headline}</Typography>
                                    </Grid>
                                )}
                                {this.props.resetButton && (
                                    <Grid>
                                        <Button
                                            variant="textDark"
                                            startIcon={<Clear />}
                                            onClick={() => {
                                                formRenderProps.form.reset();
                                            }}
                                        >
                                            <FormattedMessage id="dextinity.table.tableFilterFinalForm.resetButton" defaultMessage="Reset filter" />
                                        </Button>
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                    )}
                    <Grid size={12}>{renderFinalFormChildren(this.props as RenderableProps<FormRenderProps<FilterValues>>, formRenderProps)}</Grid>
                </Grid>
            </form>
        );
    };
}
