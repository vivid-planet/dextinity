import { gql } from "@apollo/client";
import { Field, FinalFormSelect, type GridColDef, TextField } from "@dextinity/admin";
import type { EditBrevoContactFormValues } from "@dextinity/brevo-admin";
import { MenuItem } from "@mui/material";
import type { GQLBrevoContactBranch, GQLBrevoContactSalutation } from "@src/graphql.generated";
import type { DocumentNode } from "graphql";
import type { ReactNode } from "react";
import { FormattedMessage, type IntlShape } from "react-intl";

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

const salutationOptions: Array<{ label: ReactNode; value: GQLBrevoContactSalutation }> = [
    {
        label: <FormattedMessage id="brevoContact.filters.salutation.male" defaultMessage="Male" />,
        value: "MALE",
    },
    {
        label: <FormattedMessage id="brevoContact.filters.salutation.female" defaultMessage="Female" />,
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

interface AdditionalFormConfigInputProps extends EditBrevoContactFormValues {
    attributes: {
        BRANCH?: Array<GQLBrevoContactBranch>;
        SALUTATION?: GQLBrevoContactSalutation;
        FIRSTNAME?: string;
        LASTNAME?: string;
    };
}

export interface BrevoContactConfig {
    additionalGridFields: GridColDef<GQLBrevoContactAttributesFragment>[];
    additionalFormFields: ReactNode;
    additionalAttributesFragment: {
        fragment: DocumentNode;
        name: string;
    };
    input2State: (values?: AdditionalFormConfigInputProps) => {
        attributes: { BRANCH?: Array<GQLBrevoContactBranch>; SALUTATION?: GQLBrevoContactSalutation; FIRSTNAME?: string; LASTNAME?: string };
    };
    exportFields: {
        renderValue: (row: GQLBrevoContactAttributesFragment) => string;
        headerName: string;
    }[];
}

export const getBrevoContactConfig = (intl: IntlShape): BrevoContactConfig => {
    return {
        additionalGridFields: [
            {
                field: "attributes.firstName",
                headerName: intl.formatMessage({ id: "brevoContact.firstName", defaultMessage: "First name" }),
                filterable: false,
                sortable: false,
                width: 150,
                renderCell: ({ row }) => row.attributes?.FIRSTNAME,
            },
            {
                field: "attributes.lastName",
                headerName: intl.formatMessage({ id: "brevoContact.lastName", defaultMessage: "Last name" }),
                filterable: false,
                sortable: false,
                width: 150,
                renderCell: ({ row }) => row.attributes?.LASTNAME,
            },
        ],
        additionalFormFields: (
            <>
                <Field
                    label={<FormattedMessage id="brevoContact.fields.salutation" defaultMessage="Salutation" />}
                    name="attributes.SALUTATION"
                    fullWidth
                >
                    {(props) => (
                        <FinalFormSelect {...props} fullWidth>
                            {salutationOptions.map((option) => (
                                <MenuItem value={option.value} key={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </FinalFormSelect>
                    )}
                </Field>
                <Field label={<FormattedMessage id="brevoContact.fields.branch" defaultMessage="Branch" />} name="attributes.BRANCH" fullWidth>
                    {(props) => (
                        <FinalFormSelect {...props} fullWidth multiple>
                            {branchOptions.map((option) => (
                                <MenuItem value={option.value} key={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </FinalFormSelect>
                    )}
                </Field>
                <TextField
                    label={<FormattedMessage id="brevoContact.fields.firstName" defaultMessage="First name" />}
                    name="attributes.FIRSTNAME"
                    fullWidth
                />
                <TextField
                    label={<FormattedMessage id="brevoContact.fields.lastName" defaultMessage="Last name" />}
                    name="attributes.LASTNAME"
                    fullWidth
                />
            </>
        ),
        input2State: (values?: AdditionalFormConfigInputProps) => {
            return {
                attributes: {
                    BRANCH: values?.attributes?.BRANCH ?? [],
                    SALUTATION: values?.attributes?.SALUTATION,
                    FIRSTNAME: values?.attributes?.FIRSTNAME,
                    LASTNAME: values?.attributes?.LASTNAME,
                },
            };
        },
        additionalAttributesFragment: {
            fragment: attributesFragment,
            name: "BrevoContactAttributes",
        },
        exportFields: [
            {
                renderValue: (row: GQLBrevoContactAttributesFragment) => row.attributes?.FIRSTNAME,
                headerName: intl.formatMessage({ id: "brevoContact.firstName", defaultMessage: "First name" }),
            },
            {
                renderValue: (row: GQLBrevoContactAttributesFragment) => row.attributes?.LASTNAME,
                headerName: intl.formatMessage({ id: "brevoContact.lastName", defaultMessage: "Last name" }),
            },
        ],
    };
};
