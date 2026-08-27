import { Search } from "@dextinity/admin-icons";
import { InputAdornment } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import type { ReactNode } from "react";
import type { FieldRenderProps } from "react-final-form";
import { useIntl } from "react-intl";

import { FinalFormInput, type FinalFormInputProps } from "./FinalFormInput";

export interface FinalFormSearchTextFieldProps extends FinalFormInputProps {
    icon?: ReactNode;
}

type FinalFormSearchTextFieldInternalProps = FieldRenderProps<string, HTMLInputElement | HTMLTextAreaElement>;

/**
 * Final Form-compatible SearchTextField component.
 *
 * @see {@link SearchField} – preferred for typical form use. Use this only if no Field wrapper is needed.
 */
export function FinalFormSearchTextField(inProps: FinalFormSearchTextFieldProps & FinalFormSearchTextFieldInternalProps) {
    const { icon = <Search />, placeholder, ...restProps } = useThemeProps({ props: inProps, name: "DextinityAdminFinalFormSearchTextField" });
    const intl = useIntl();

    return (
        <FinalFormInput
            {...restProps}
            placeholder={
                placeholder ?? intl.formatMessage({ id: "dextinity.finalformsearchtextfield.default.placeholder", defaultMessage: "Search" })
            }
            startAdornment={
                <InputAdornment position="start" disablePointerEvents>
                    {icon}
                </InputAdornment>
            }
            disableContentTranslation={true}
        />
    );
}

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminFinalFormSearchTextField: FinalFormSearchTextFieldProps;
    }

    interface Components {
        DextinityAdminFinalFormSearchTextField?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminFinalFormSearchTextField"]>;
        };
    }
}
