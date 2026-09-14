import { gql } from "@apollo/client";
import { Field, FinalFormSelect } from "@dextinity/admin";
import type { EditTargetGroupFinalFormValues } from "@dextinity/brevo-admin";
import { MenuItem } from "@mui/material";
import type { GQLBrevoContactBranch, GQLBrevoContactSalutation } from "@src/graphql.generated";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

const salutationOptions: Array<{ label: ReactNode; value: GQLBrevoContactSalutation }> = [
    {
        label: <FormattedMessage id="targetGroup.filters.salutation.male" defaultMessage="Male" />,
        value: "MALE",
    },
    {
        label: <FormattedMessage id="targetGroup.filters.salutation.female" defaultMessage="Female" />,
        value: "FEMALE",
    },
];

const branchOptions: Array<{ label: ReactNode; value: GQLBrevoContactBranch }> = [
    {
        label: <FormattedMessage id="brevoContact.filters.branch.products" defaultMessage="Products" />,
        value: "PRODUCTS",
    },
    {
        label: <FormattedMessage id="brevoContact.filters.branch.marketing" defaultMessage="Marketing" />,
        value: "MARKETING",
    },
    {
        label: <FormattedMessage id="brevoContact.filters.branch.news" defaultMessage="News" />,
        value: "NEWS",
    },
];

const additionalPageTreeNodeFieldsFragment = {
    fragment: gql`
        fragment TargetGroupFilters on BrevoTargetGroup {
            filters {
                SALUTATION
                BRANCH
            }
        }
    `,
    name: "TargetGroupFilters",
};

interface AdditionalFormConfigInputProps extends EditTargetGroupFinalFormValues {
    filters: {
        SALUTATION: Array<GQLBrevoContactSalutation>;
        BRANCH: Array<GQLBrevoContactBranch>;
    };
}

export const additionalFormConfig = {
    input2State: (values?: AdditionalFormConfigInputProps) => {
        return {
            title: values?.title ?? "",
            filters: {
                SALUTATION: values?.filters?.SALUTATION ?? [],
                BRANCH: values?.filters?.BRANCH ?? [],
            },
        };
    },
    nodeFragment: additionalPageTreeNodeFieldsFragment,
    additionalFormFields: (
        <>
            <Field label={<FormattedMessage id="targetGroup.fields.salutation" defaultMessage="Salutation" />} name="filters.SALUTATION" fullWidth>
                {(props) => (
                    <FinalFormSelect {...props} fullWidth multiple clearable>
                        {salutationOptions.map((option) => (
                            <MenuItem value={option.value} key={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </FinalFormSelect>
                )}
            </Field>
            <Field label={<FormattedMessage id="targetGroup.fields.branch" defaultMessage="Branch" />} name="filters.BRANCH" fullWidth>
                {(props) => (
                    <FinalFormSelect {...props} fullWidth clearable multiple>
                        {branchOptions.map((option) => (
                            <MenuItem value={option.value} key={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </FinalFormSelect>
                )}
            </Field>
        </>
    ),
};
