import { gql } from "@apollo/client";
import type { BrevoContactRow, EditBrevoContactFormValues } from "@dextinity/brevo-admin";
import type { DataGridColumn, SelectOption } from "@dextinity/ui";
import { InputField, SelectField } from "@dextinity/ui-react-final-form";
import type { GQLBrevoContactBranch, GQLBrevoContactSalutation } from "@src/graphql.generated";
import type { DocumentNode } from "graphql";
import type { ReactNode } from "react";
import type { IntlShape } from "react-intl";

import type { GQLBrevoContactAttributesFragment } from "./brevoContactsPageAttributesConfig.generated";

const attributesFragment = gql`
    fragment BrevoContactAttributes on BrevoContact {
        attributes {
            LASTNAME
            FIRSTNAME
            SALUTATION
            BRANCH
        }
    }
`;

interface AdditionalFormConfigInputProps extends EditBrevoContactFormValues {
    attributes: {
        BRANCH?: Array<GQLBrevoContactBranch>;
        SALUTATION?: GQLBrevoContactSalutation;
        FIRSTNAME?: string;
        LASTNAME?: string;
    };
}

type BrevoContactWithAttributes = BrevoContactRow<GQLBrevoContactAttributesFragment>;

export interface BrevoContactConfig {
    additionalGridFields: DataGridColumn<BrevoContactWithAttributes>[];
    additionalFormFields: ReactNode;
    additionalAttributesFragment: {
        fragment: DocumentNode;
        name: string;
    };
    input2State: (values?: AdditionalFormConfigInputProps) => {
        attributes: { BRANCH?: Array<GQLBrevoContactBranch>; SALUTATION?: GQLBrevoContactSalutation; FIRSTNAME?: string; LASTNAME?: string };
    };
    exportFields: DataGridColumn<BrevoContactWithAttributes>[];
}

export const getBrevoContactConfig = (intl: IntlShape): BrevoContactConfig => {
    const salutationOptions: SelectOption<GQLBrevoContactSalutation>[] = [
        { value: "MALE", label: intl.formatMessage({ id: "brevoContact.filters.salutation.male", defaultMessage: "Male" }) },
        { value: "FEMALE", label: intl.formatMessage({ id: "brevoContact.filters.salutation.female", defaultMessage: "Female" }) },
    ];
    const branchOptions: SelectOption<GQLBrevoContactBranch>[] = [
        { value: "PRODUCTS", label: intl.formatMessage({ id: "brevoContact.filters.branch.products", defaultMessage: "Products" }) },
        { value: "MARKETING", label: intl.formatMessage({ id: "brevoContact.filters.branch.marketing", defaultMessage: "Marketing" }) },
        { value: "NEWS", label: intl.formatMessage({ id: "brevoContact.filters.branch.news", defaultMessage: "News" }) },
    ];

    const nameColumns: DataGridColumn<BrevoContactWithAttributes>[] = [
        {
            key: "firstName",
            header: intl.formatMessage({ id: "brevoContact.firstName", defaultMessage: "First name" }),
            width: 150,
            render: (row) => row.attributes?.FIRSTNAME,
            getValue: (row) => row.attributes?.FIRSTNAME,
        },
        {
            key: "lastName",
            header: intl.formatMessage({ id: "brevoContact.lastName", defaultMessage: "Last name" }),
            width: 150,
            render: (row) => row.attributes?.LASTNAME,
            getValue: (row) => row.attributes?.LASTNAME,
        },
    ];

    return {
        additionalGridFields: nameColumns,
        exportFields: nameColumns,
        additionalFormFields: (
            <>
                <SelectField<false, GQLBrevoContactSalutation>
                    name="attributes.SALUTATION"
                    label={intl.formatMessage({ id: "brevoContact.fields.salutation", defaultMessage: "Salutation" })}
                    options={salutationOptions}
                />
                <SelectField<true, GQLBrevoContactBranch>
                    name="attributes.BRANCH"
                    label={intl.formatMessage({ id: "brevoContact.fields.branch", defaultMessage: "Branch" })}
                    options={branchOptions}
                    multiple
                />
                <InputField
                    name="attributes.FIRSTNAME"
                    label={intl.formatMessage({ id: "brevoContact.fields.firstName", defaultMessage: "First name" })}
                    required
                />
                <InputField
                    name="attributes.LASTNAME"
                    label={intl.formatMessage({ id: "brevoContact.fields.lastName", defaultMessage: "Last name" })}
                    required
                />
            </>
        ),
        input2State: (values?: AdditionalFormConfigInputProps) => {
            return {
                attributes: {
                    BRANCH: values?.attributes?.BRANCH ?? [],
                    SALUTATION: values?.attributes?.SALUTATION,
                    FIRSTNAME: values?.attributes?.FIRSTNAME ?? "",
                    LASTNAME: values?.attributes?.LASTNAME ?? "",
                },
            };
        },
        additionalAttributesFragment: {
            fragment: attributesFragment,
            name: "BrevoContactAttributes",
        },
    };
};
