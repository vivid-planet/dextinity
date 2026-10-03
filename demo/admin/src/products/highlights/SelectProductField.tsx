import { gql } from "@apollo/client/core";
import { ClearInputAdornment, Dialog, Field, type FieldProps, Tooltip } from "@comet/admin";
import { SelectSearch } from "@comet/admin-icons";
import { IconButton, InputBase } from "@mui/material";
import { useState } from "react";
import { type FieldRenderProps } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { type GQLSelectProductFieldFragment } from "./SelectProductField.generated";
import { SelectProductFieldGrid } from "./SelectProductFieldGrid";

export const selectProductFieldFragment = gql`
    fragment SelectProductField on Product {
        id
        title
    }
`;

type Props = FieldProps<GQLSelectProductFieldFragment, HTMLDivElement> & { clearable?: boolean };
export function SelectProductField({ clearable = false, ...restProps }: Props) {
    const [open, setOpen] = useState(false);
    return (
        <Field {...restProps}>
            {(fieldProps: FieldRenderProps<{ id: string; title: string }, HTMLDivElement>) => {
                return (
                    <>
                        <Dialog
                            open={open}
                            onClose={() => setOpen(false)}
                            maxWidth="lg"
                            fullWidth
                            title={<FormattedMessage id="products.selectProduct" defaultMessage="Select Product" />}
                        >
                            <SelectProductFieldGrid
                                onSelect={(product) => {
                                    if (product) {
                                        setOpen(false);
                                        fieldProps.input.onChange(product);
                                    }
                                }}
                            />
                        </Dialog>
                        <InputBase
                            value={fieldProps.input.value ? fieldProps.input.value.title : ""}
                            readOnly
                            endAdornment={
                                <>
                                    {clearable && (
                                        <ClearInputAdornment
                                            position="end"
                                            hasClearableContent={Boolean(fieldProps.input.value)}
                                            onClick={() => fieldProps.input.onChange(null)}
                                        />
                                    )}
                                    <Tooltip title={<FormattedMessage id="products.selectProduct" defaultMessage="Select Product" />}>
                                        <IconButton
                                            onClick={async () => {
                                                setOpen(true);
                                            }}
                                        >
                                            <SelectSearch />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            }
                        />
                    </>
                );
            }}
        </Field>
    );
}
