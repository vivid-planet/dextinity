---
title: Brevo Setup
---

# Setup

:::caution
This documentation refers to Brevo v3 or higher.
Make sure that your project uses Dextinity v7.0 or later.
:::

The Brevo Module provides three packages: `brevo-api`, `brevo-admin`, and the optional `brevo-mail-rendering` package. Please check the latest release [here](https://github.com/vivid-planet/comet-brevo-module/releases).

## API

### Installation

To add the Brevo API package, add the following to your `package.json` dependencies and install:

```json
"@vivid-planet/comet-brevo-api": "^3.0.0"
```

### Config

You need to provide configuration values so your application can connect to Brevo and related services.  
Replace the `envVars.*` placeholders with your actual environment variable names or values.

Example configuration:

```
brevo: {
    apiKey: envVars.BREVO_API_KEY,
    redirectUrlForImport: envVars.REDIRECT_URL_FOR_IMPORT,
},
campaign: {
    url: envVars.CAMPAIGN_URL,
    basicAuth: {
        username: envVars.CAMPAIGN_BASIC_AUTH_USERNAME,
        password: envVars.CAMPAIGN_BASIC_AUTH_PASSWORD,
    },
},
ecgRtrList: {
    apiKey: envVars.ECG_RTR_LIST_API_KEY,
},
```

See the table below for information on how to find the config values and what they are used for:

| Config Key                    | Description                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `brevo.apiKey`                | Your Brevo API key. Find it in your [Brevo account settings](https://app.brevo.com/settings/keys/api).                           |
| `brevo.redirectUrlForImport`  | The URL in your app to redirect to after importing contacts. Set this to a route in your application.                            |
| `campaign.url`                | The URL where the campaign is rendered, used both for admin preview and for generating the final HTML before it’s sent to Brevo. |
| `campaign.basicAuth.username` | Username for HTTP Basic Auth if your campaign frontend is protected. Set this yourself if needed.                                |
| `campaign.basicAuth.password` | Password for HTTP Basic Auth if your campaign frontend is protected. Set this yourself if needed.                                |
| `ecgRtrList.apiKey`           | API key for the ECG RTR List integration. Obtain this from the respective service or your administrator.                         |

### Register module

To use the Brevo Module in your project, you need to register it in your main `AppModule`.  
If your configuration varies by scope, pass the `scope` to the `resolveConfig` function to use the appropriate values for each scope.  
You can also register additional entities or features you want to use later on (see the section [Optional Brevo Features](http://localhost:3300/docs/features-modules/brevo-module/features/)).

Example implementation:

```typescript
BrevoModule.register({
    brevo: {
        resolveConfig: (scope: EmailCampaignContentScope) => {
            // Change config based on scope, for example, different sender email.
            // This demonstrates how you can use the scope to change the config, but it has no real use in this example.
            if (scope.domain === "main") {
                return {
                    apiKey: config.brevo.apiKey,
                    redirectUrlForImport: config.brevo.redirectUrlForImport,
                };
            } else if (scope.domain === "secondary") {
                return {
                    apiKey: config.brevo.apiKey,
                    redirectUrlForImport: config.brevo.redirectUrlForImport,
                };
            }

            throw Error("Invalid scope passed");
        },
        BrevoContactAttributes,
        BrevoContactFilterAttributes,
        EmailCampaign,
        TargetGroup,
    },
    emailCampaigns: {
        EmailCampaignContentBlock,
        Scope: EmailCampaignContentScope,
        frontend: {
            url: config.campaign.url,
            basicAuth: {
                username: config.campaign.basicAuth.username,
                password: config.campaign.basicAuth.password,
            },
        },
    },
}),
```

### Brevo Contact Attributes

Brevo contacts are managed and stored directly within the Brevo platform. However, attributes must be set in the application to allow adding contacts according to your project's needs.

Add `BrevoContactAttributes` to store information for each contact, such as names, salutations, or any other data relevant to your use case. All attribute names must be defined in **uppercase** to match Brevo's requirements.

`BrevoContactFilterAttributes` can be added for creating target groups that are used to create lists for sending emails to selected users.

:::caution
Be aware that at least one attribute in BrevoContactFilterAttributes must be set for technical reasons, even if filters are not needed in the project.
:::

To add custom contact attributes, add `BrevoContactAttributes` and `BrevoContactFilterAttributes` to your project, as shown in this example:

```typescript
import { IsUndefinable } from "@dextinity/cms-api";
import { Embeddable, Enum } from "@mikro-orm/core";
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

import { BrevoContactBranch, BrevoContactSalutation } from "./brevo-contact.enums";

@ObjectType()
@InputType("BrevoContactAttributesInput")
export class BrevoContactAttributes {
    @IsNotEmpty()
    @IsString()
    @Field()
    LASTNAME: string;

    @IsNotEmpty()
    @IsString()
    @Field()
    FIRSTNAME: string;

    @Field(() => BrevoContactSalutation, { nullable: true })
    @IsEnum(BrevoContactSalutation)
    @IsUndefinable()
    SALUTATION?: BrevoContactSalutation;

    @Field(() => [BrevoContactBranch], { nullable: true })
    @IsEnum(BrevoContactBranch, { each: true })
    @Enum({ items: () => BrevoContactBranch, array: true })
    @IsUndefinable()
    BRANCH?: BrevoContactBranch[];
}

@Embeddable()
@ObjectType()
@InputType("BrevoContactFilterAttributesInput")
export class BrevoContactFilterAttributes {
    // index signature to match Array<any> | undefined in BrevoContactFilterAttributesInterface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: Array<any> | undefined;

    @Field(() => [BrevoContactSalutation], { nullable: true })
    @IsEnum(BrevoContactSalutation, { each: true })
    @Enum({ items: () => BrevoContactSalutation, array: true })
    @IsUndefinable()
    SALUTATION?: BrevoContactSalutation[];

    @Field(() => [BrevoContactBranch], { nullable: true })
    @IsEnum(BrevoContactBranch, { each: true })
    @Enum({ items: () => BrevoContactBranch, array: true })
    @IsUndefinable()
    BRANCH?: BrevoContactBranch[];
}
```

## Admin

### Installation

To add the Brevo Admin package, add the following to your `package.json` dependencies and install:

```json
"@vivid-planet/comet-brevo-admin": "^3.0.0"
```

### BrevoContactsPageAttributesConfig

To use custom contact attributes in the `BrevoContactsPage`, you need to provide a configuration object. Therefore, create the config named `BrevoContactsPageAttributesConfig` like in this example:

```typescript
const attributesFragment = gql`
    fragment BrevoContactAttributesFragment on BrevoContact {
        attributes {
            LASTNAME
            FIRSTNAME
            SALUTATION
            BRANCH
        }
    }
`;

const salutationOptions: Array<{ label: React.ReactNode; value: GQLBrevoContactSalutation }> = [
    {
        label: <FormattedMessage id="brevoContact.filters.salutation.male" defaultMessage="Male" />,
        value: "MALE",
    },
    {
        label: (
            <FormattedMessage id="brevoContact.filters.salutation.female" defaultMessage="Female" />
        ),
        value: "FEMALE",
    },
];

const branchOptions: Array<{ label: React.ReactNode; value: GQLBrevoContactBranch }> = [
    {
        label: (
            <FormattedMessage id="brevoContact.filters.branch.products" defaultMessage="Products" />
        ),
        value: "PRODUCTS",
    },
    {
        label: (
            <FormattedMessage
                id="brevoContact.filters.branch.marketing"
                defaultMessage="Marketing"
            />
        ),
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

export const additionalFormConfig = {
    nodeFragment: attributesFragment,
};

export interface BrevoContactConfig {
    additionalGridFields: GridColDef<GQLBrevoContactAttributesFragmentFragment>[];
    additionalFormFields: React.ReactNode;
    additionalAttributesFragment: {
        fragment: DocumentNode;
        name: string;
    };
    input2State: (values?: AdditionalFormConfigInputProps) => {
        attributes: {
            BRANCH?: Array<GQLBrevoContactBranch>;
            SALUTATION?: GQLBrevoContactSalutation;
            FIRSTNAME?: string;
            LASTNAME?: string;
        };
    };
    exportFields: {
        renderValue: (row: GQLBrevoContactAttributesFragmentFragment) => string;
        headerName: string;
    }[];
}

export const getBrevoContactConfig = (intl: IntlShape): BrevoContactConfig => {
    return {
        additionalGridFields: [
            {
                field: "attributes.firstName",
                headerName: intl.formatMessage({
                    id: "brevoContact.firstName",
                    defaultMessage: "First name",
                }),
                filterable: false,
                sortable: false,
                width: 150,
                renderCell: ({ row }) => row.attributes?.FIRSTNAME,
            },
            {
                field: "attributes.lastName",
                headerName: intl.formatMessage({
                    id: "brevoContact.lastName",
                    defaultMessage: "Last name",
                }),
                filterable: false,
                sortable: false,
                width: 150,
                renderCell: ({ row }) => row.attributes?.LASTNAME,
            },
        ],
        additionalFormFields: (
            <>
                <Field
                    label={
                        <FormattedMessage
                            id="brevoContact.fields.salutation"
                            defaultMessage="Salutation"
                        />
                    }
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
                <Field
                    label={
                        <FormattedMessage id="brevoContact.fields.branch" defaultMessage="Branch" />
                    }
                    name="attributes.BRANCH"
                    fullWidth
                >
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
                    label={
                        <FormattedMessage
                            id="brevoContact.fields.salutation"
                            defaultMessage="First name"
                        />
                    }
                    name="attributes.FIRSTNAME"
                    fullWidth
                />
                <TextField
                    label={
                        <FormattedMessage
                            id="brevoContact.fields.salutation"
                            defaultMessage="Last name"
                        />
                    }
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
            name: "BrevoContactAttributesFragment",
        },
        exportFields: [
            {
                renderValue: (row: GQLBrevoContactAttributesFragmentFragment) =>
                    row.attributes?.FIRSTNAME,
                headerName: intl.formatMessage({
                    id: "brevoContact.firstName",
                    defaultMessage: "First name",
                }),
            },
            {
                renderValue: (row: GQLBrevoContactAttributesFragmentFragment) =>
                    row.attributes?.LASTNAME,
                headerName: intl.formatMessage({
                    id: "brevoContact.lastName",
                    defaultMessage: "Last name",
                }),
            },
        ],
    };
};
```

After creating the config, make sure, to pass it to the BrevoContactsPage.

:::caution
Attributes must also be added in the Brevo account. Please visit: https://my.brevo.com/lists/add-attributes for adding or editing contact attributes.
:::

### Target Group Form Config

The `TargetGroupFormConfig` is used to define the form fields and behavior for creating and editing target groups in the Brevo admin interface. Target groups enable you to segment your contacts based on specific attributes (such as salutation or branch), allowing you to send targeted email campaigns to selected users. The configuration is used, to define the fields for your `TargetGroupForm`.

```typescript
import { gql } from "@apollo/client";
import { Field, FinalFormSelect } from "@dextinity/admin";
import { EditTargetGroupFinalFormValues } from "@dextinity/brevo-admin";
import { MenuItem } from "@mui/material";
import { GQLBrevoContactBranch, GQLBrevoContactSalutation } from "@src/graphql.generated";
import * as React from "react";
import { FormattedMessage } from "react-intl";

const salutationOptions: Array<{ label: React.ReactNode; value: GQLBrevoContactSalutation }> = [
    {
        label: <FormattedMessage id="targetGroup.filters.salutation.male" defaultMessage="Male" />,
        value: "MALE",
    },
    {
        label: (
            <FormattedMessage id="targetGroup.filters.salutation.female" defaultMessage="Female" />
        ),
        value: "FEMALE",
    },
];

const branchOptions: Array<{ label: React.ReactNode; value: GQLBrevoContactBranch }> = [
    {
        label: (
            <FormattedMessage id="brevoContact.filters.branch.products" defaultMessage="Products" />
        ),
        value: "PRODUCTS",
    },
    {
        label: (
            <FormattedMessage
                id="brevoContact.filters.branch.marketing"
                defaultMessage="Marketing"
            />
        ),
        value: "MARKETING",
    },
    {
        label: <FormattedMessage id="brevoContact.filters.branch.news" defaultMessage="News" />,
        value: "NEWS",
    },
];

export const additionalPageTreeNodeFieldsFragment = {
    fragment: gql`
        fragment TargetGroupFilters on TargetGroup {
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
            <Field
                label={
                    <FormattedMessage
                        id="targetGroup.fields.salutation"
                        defaultMessage="Salutation"
                    />
                }
                name="filters.SALUTATION"
                fullWidth
            >
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
            <Field
                label={<FormattedMessage id="targetGroup.fields.branch" defaultMessage="Branch" />}
                name="filters.BRANCH"
                fullWidth
            >
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
```

### Add Brevo Pages to the `MasterMenu`

The Brevo module offers predefined admin pages. Add those to the `MasterMenu`. Also register the BrevoContactConfig in this step. This is an example implementation:

```typescript
import { Assets, Dashboard, Mail, PageTree, Wrench } from "@dextinity/admin-icons";
import {
    BrevoConfigPage,
    createBrevoContactsPage,
    createBrevoTestContactsPage,
    createEmailCampaignsPage,
    createTargetGroupsPage,
} from "@dextinity/brevo-admin";
import {
    AllCategories,
    ContentScopeIndicator,
    createRedirectsPage,
    DamPage,
    DocumentInterface,
    MasterMenu,
    MasterMenuData,
    MasterMenuRoutes,
    PagesPage,
    PublisherPage,
} from "@dextinity/cms-admin";
import {
    BrevoContactConfig,
    getBrevoContactConfig,
} from "@src/common/brevoModuleConfig/brevoContactsPageAttributesConfig";
import { additionalFormConfig } from "@src/common/brevoModuleConfig/targetGroupFormConfig";
import { DashboardPage } from "@src/dashboard/DashboardPage";
import { Link } from "@src/documents/links/Link";
import { Page } from "@src/documents/pages/Page";
import { EmailCampaignContentBlock } from "@src/emailCampaigns/blocks/EmailCampaignContentBlock";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

export const pageTreeCategories: AllCategories = [
    {
        category: "MainNavigation",
        label: (
            <FormattedMessage id="menu.pageTree.mainNavigation" defaultMessage="Main navigation" />
        ),
    },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pageTreeDocumentTypes: Record<string, DocumentInterface<any, any>> = {
    Page,
    Link,
};
const RedirectsPage = createRedirectsPage({ scopeParts: ["domain"] });

const getMasterMenuData = ({
    brevoContactConfig,
}: {
    brevoContactConfig: BrevoContactConfig;
}): MasterMenuData => {
    const BrevoContactsPage = createBrevoContactsPage({
        additionalAttributesFragment: brevoContactConfig.additionalAttributesFragment,
        additionalGridFields: brevoContactConfig.additionalGridFields,
        additionalFormFields: brevoContactConfig.additionalFormFields,
        input2State: brevoContactConfig.input2State,
    });

    const TargetGroupsPage = createTargetGroupsPage({
        additionalFormFields: additionalFormConfig.additionalFormFields,
        exportTargetGroupOptions: {
            additionalAttributesFragment: brevoContactConfig.additionalAttributesFragment,
            exportFields: brevoContactConfig.exportFields,
        },
        nodeFragment: additionalFormConfig.nodeFragment,
        input2State: additionalFormConfig.input2State,
    });

    const CampaignsPage = createEmailCampaignsPage({
        EmailCampaignContentBlock,
    });

    const BrevoTestContactsPage = createBrevoTestContactsPage({
        additionalAttributesFragment: brevoContactConfig.additionalAttributesFragment,
        additionalGridFields: brevoContactConfig.additionalGridFields,
        additionalFormFields: brevoContactConfig.additionalFormFields,
        input2State: brevoContactConfig.input2State,
    });

    return [
        {
            type: "route",
            primary: <FormattedMessage id="menu.dashboard" defaultMessage="Dashboard" />,
            icon: <Dashboard />,
            route: {
                path: "/dashboard",
                component: DashboardPage,
            },
        },
        {
            type: "route",
            primary: <FormattedMessage id="menu.pageTree" defaultMessage="Page tree" />,
            icon: <PageTree />,
            route: {
                path: "/pages/pagetree/main-navigation",
                render: () => (
                    <PagesPage
                        path="/pages/pagetree/main-navigation"
                        allCategories={pageTreeCategories}
                        documentTypes={pageTreeDocumentTypes}
                        category="MainNavigation"
                        renderContentScopeIndicator={(scope) => (
                            <ContentScopeIndicator scope={scope} />
                        )}
                    />
                ),
            },
            requiredPermission: "pageTree",
        },
        {
            type: "collapsible",
            primary: <FormattedMessage id="menu.newsletter" defaultMessage="Newsletter" />,
            icon: <Mail />,
            items: [
                {
                    type: "route",
                    primary: (
                        <FormattedMessage
                            id="menu.newsletter.emailCampaigns"
                            defaultMessage="Email campaigns"
                        />
                    ),
                    route: {
                        path: "/newsletter/email-campaigns",
                        component: CampaignsPage,
                    },
                },
                {
                    type: "route",
                    primary: (
                        <FormattedMessage
                            id="menu.newsletter.emailCampaigns"
                            defaultMessage="Contacts"
                        />
                    ),
                    route: {
                        path: "/newsletter/contacts",
                        render: () => <BrevoContactsPage />,
                    },
                },
                {
                    type: "route",
                    primary: (
                        <FormattedMessage
                            id="menu.newsletter.testContacts"
                            defaultMessage="Test contacts"
                        />
                    ),
                    route: {
                        path: "/newsletter/test-contacts",
                        render: () => <BrevoTestContactsPage />,
                    },
                },
                {
                    type: "route",
                    primary: (
                        <FormattedMessage
                            id="menu.newsletter.targetGroups"
                            defaultMessage="Target groups"
                        />
                    ),
                    route: {
                        path: "/newsletter/target-groups",
                        render: () => <TargetGroupsPage />,
                    },
                },
                {
                    type: "route",
                    primary: (
                        <FormattedMessage id="menu.newsletter.config" defaultMessage="Config" />
                    ),
                    route: {
                        path: "/newsletter/config",
                        render: () => <BrevoConfigPage />,
                    },
                    requiredPermission: "brevo-newsletter-config",
                },
            ],
            requiredPermission: "brevo-newsletter",
        },
        {
            type: "route",
            primary: <FormattedMessage id="menu.dam" defaultMessage="Assets" />,
            icon: <Assets />,
            route: {
                path: "/assets",
                component: DamPage,
            },
            requiredPermission: "dam",
        },
        {
            type: "collapsible",
            primary: <FormattedMessage id="menu.system" defaultMessage="System" />,
            icon: <Wrench />,
            items: [
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.publisher" defaultMessage="Publisher" />,
                    route: {
                        path: "/system/publisher",
                        component: PublisherPage,
                    },
                    requiredPermission: "builds",
                },
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.redirects" defaultMessage="Redirects" />,
                    route: {
                        path: "/system/redirects",
                        render: () => <RedirectsPage redirectPathAfterChange="/system/redirects" />,
                    },
                    requiredPermission: "pageTree",
                },
            ],
            requiredPermission: "pageTree",
        },
    ];
};

export const AppMasterMenu = () => {
    const intl = useIntl();

    const masterMenuDataForScope = React.useMemo(
        () => getMasterMenuData({ brevoContactConfig: getBrevoContactConfig(intl) }),
        [intl],
    );

    return <MasterMenu menu={masterMenuDataForScope} />;
};

export const MasterRoutes = () => {
    const intl = useIntl();

    const masterMenuDataForScope = React.useMemo(
        () => getMasterMenuData({ brevoContactConfig: getBrevoContactConfig(intl) }),
        [intl],
    );

    return <MasterMenuRoutes menu={masterMenuDataForScope} />;
};
```

### Brevo configuration

Brevo must be configured using the `BrevoConfigPage` in your admin interface.

| Form Field                | Description                                                                                                                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sender                    | The email address and name that will appear as the sender of your email campaigns. The sender address must be verified in your Brevo account.                                                                           |
| Double Opt-In Template ID | The ID of your double opt-in template. You can create a template and find its ID at [Brevo Templates](https://app.brevo.com/templates/listing).                                                                         |
| Folder ID                 | The ID of the folder in Brevo where your contacts or campaigns are organized. You can find this in your Brevo account under Contacts > Folders. If you have not changed your folder structure, this is usually `1`.     |
| Allowed Redirection URL   | Defines the pattern for valid redirection URLs used when creating or importing contacts. Only URLs starting with this value will be accepted.                                                                           |
| Unsubscription Page ID    | The 24-digit ID of your configured unsubscription page. Go to [Brevo Unsubscription Pages](https://app.brevo.com/campaign/pages/unsubscription), add or edit a page, and copy the ID from the page URL into the config. |

## Mail Rendering

The optional **Brevo Mail Rendering** package provides frontend components for rendering newsletters in your application.

:::caution
The mail rendering package is currently a work in progress.
At the moment, it only includes the `NewsletterImageBlock`, which is optimized for displaying images in newsletter campaigns.
Additional blocks and features will be added in future releases.
:::

### Installation

To add the Brevo Mail Rendering package, add the following to your `package.json` dependencies and install:

```json
"@vivid-planet/comet-brevo-mail-rendering": "^3.0.0"
```

### Register blocks

To use a block from the package, register it in your `NewsletterContentBlock` (or any `BlocksBlock` you use for creating email campaigns).  
Make sure to register the block in your API, admin, and site projects.  
For detailed instructions on working with blocks in Dextinity, see https://cms-docs.dextinity.com/docs/core-concepts/blocks/your-first-block
