import { gql } from "@apollo/client";
import type { EditTargetGroupFinalFormValues } from "@dextinity/brevo-admin";
import type { SelectOption } from "@dextinity/ui";
import { SelectField } from "@dextinity/ui-react-final-form";
import type { GQLBrevoContactBranch, GQLBrevoContactSalutation } from "@src/graphql.generated";
import type { ReactNode } from "react";
import type { IntlShape } from "react-intl";

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

export const getTargetGroupFormConfig = (intl: IntlShape) => {
    const salutationOptions: SelectOption<GQLBrevoContactSalutation>[] = [
        { value: "MALE", label: intl.formatMessage({ id: "targetGroup.filters.salutation.male", defaultMessage: "Male" }) },
        { value: "FEMALE", label: intl.formatMessage({ id: "targetGroup.filters.salutation.female", defaultMessage: "Female" }) },
    ];
    const branchOptions: SelectOption<GQLBrevoContactBranch>[] = [
        { value: "PRODUCTS", label: intl.formatMessage({ id: "brevoContact.filters.branch.products", defaultMessage: "Products" }) },
        { value: "MARKETING", label: intl.formatMessage({ id: "brevoContact.filters.branch.marketing", defaultMessage: "Marketing" }) },
        { value: "NEWS", label: intl.formatMessage({ id: "brevoContact.filters.branch.news", defaultMessage: "News" }) },
    ];
    const additionalFormFields: ReactNode = (
        <>
            <SelectField<true, GQLBrevoContactSalutation>
                name="filters.SALUTATION"
                label={intl.formatMessage({ id: "targetGroup.fields.salutation", defaultMessage: "Salutation" })}
                options={salutationOptions}
                multiple
            />
            <SelectField<true, GQLBrevoContactBranch>
                name="filters.BRANCH"
                label={intl.formatMessage({ id: "targetGroup.fields.branch", defaultMessage: "Branch" })}
                options={branchOptions}
                multiple
            />
        </>
    );

    return {
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
        additionalFormFields,
    };
};
