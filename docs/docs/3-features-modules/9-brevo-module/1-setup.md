---
title: Brevo Setup
---

# Setup

The Brevo Module provides two packages: `@dextinity/brevo-api` and `@dextinity/brevo-admin`. Please check the [latest Dextinity release](https://github.com/vivid-planet/dextinity/releases).

Email campaigns are not rendered by the Brevo Module itself. Their content is rendered by your site, which the API requests before the campaign is sent to Brevo, see [Email Rendering](#email-rendering). We recommend [`@dextinity/mail-react`](../13-building-html-emails/index.md) for building the markup. Double opt-in mails are not affected: they are rendered by Brevo from a Brevo template.

## API

### Installation

To add the Brevo API package, add the following to your `package.json` dependencies and install:

```json
"@dextinity/brevo-api": "^10.0.0"
```

:::caution
Use the same version range as for the other `@dextinity/*` packages in your project.
:::

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

| Config Key                    | Description                                                                                                                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brevo.apiKey`                | Your Brevo API key. Find it in your [Brevo account settings](https://app.brevo.com/settings/keys/api).                                                                                                                 |
| `brevo.redirectUrlForImport`  | The URL in your app to redirect to after importing contacts. Set this to a route in your application.                                                                                                                  |
| `campaign.url`                | The URL of the render endpoint in your site. The API calls it to generate the final HTML before the campaign is sent to Brevo. The admin preview does not use this value, it is resolved by the `BrevoConfigProvider`. |
| `campaign.basicAuth.username` | Username for HTTP Basic Auth if your campaign frontend is protected. Set this yourself if needed.                                                                                                                      |
| `campaign.basicAuth.password` | Password for HTTP Basic Auth if your campaign frontend is protected. Set this yourself if needed.                                                                                                                      |
| `ecgRtrList.apiKey`           | API key for the ECG RTR List integration. Obtain this from the respective service or your administrator.                                                                                                               |

### Scope and entities

Email campaigns and target groups are scoped. Define the scope of your project as an embeddable, for example:

```typescript title="api/src/brevo/email-campaign/email-campaign-content-scope.ts"
import { Embeddable, Property } from "@mikro-orm/core";
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@Embeddable()
@ObjectType()
@InputType("EmailCampaignContentScopeInput")
export class EmailCampaignContentScope {
    @Property({ columnType: "text" })
    @Field()
    @IsString()
    domain: string;

    @Property({ columnType: "text" })
    @Field()
    @IsString()
    language: string;
}
```

The entities of the Brevo Module are created in your project using entity factories, since they depend on project-specific types such as the scope or the filter attributes:

```typescript title="api/src/brevo/target-group/entity/target-group.entity.ts"
import { createTargetGroupEntity } from "@dextinity/brevo-api";
import { BrevoContactFilterAttributes } from "@src/brevo/brevo-contact/dto/brevo-contact-attributes";
import { EmailCampaignContentScope } from "@src/brevo/email-campaign/email-campaign-content-scope";

export const TargetGroup = createTargetGroupEntity({
    Scope: EmailCampaignContentScope,
    BrevoFilterAttributes: BrevoContactFilterAttributes,
});
```

```typescript title="api/src/brevo/email-campaign/entities/email-campaign.entity.ts"
import { createEmailCampaignEntity } from "@dextinity/brevo-api";
import { EmailCampaignContentBlock } from "@src/brevo/email-campaign/blocks/email-campaign-content.block";
import { EmailCampaignContentScope } from "@src/brevo/email-campaign/email-campaign-content-scope";
import { TargetGroup } from "@src/brevo/target-group/entity/target-group.entity";

export const EmailCampaign = createEmailCampaignEntity({
    EmailCampaignContentBlock,
    Scope: EmailCampaignContentScope,
    TargetGroup,
});
```

`EmailCampaignContentBlock` is a `BlocksBlock` containing the blocks that can be used in a campaign. `NewsletterImageBlock` is provided by `@dextinity/brevo-api`:

```typescript title="api/src/brevo/email-campaign/blocks/email-campaign-content.block.ts"
import { NewsletterImageBlock } from "@dextinity/brevo-api";
import { createBlocksBlock } from "@dextinity/cms-api";

import { EmailCampaignRichTextBlock } from "./email-campaign-rich-text.block";

export const EmailCampaignContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            text: EmailCampaignRichTextBlock,
            image: NewsletterImageBlock,
        },
    },
    {
        name: "EmailCampaignContent",
    },
);
```

:::caution
Don't forget to generate and run a migration after adding the entities.
:::

### Register module

To use the Brevo Module in your project, you need to register it in your main `AppModule`.  
If your configuration varies by scope, pass the `scope` to the `resolveConfig` function to use the appropriate values for each scope.  
You can also register additional entities (see [Optional entities](#optional-entities)) or features you want to use later on (see the section [Optional Brevo Features](./2-features/index.md)).

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
    ecgRtrList: {
        apiKey: config.ecgRtrList.apiKey,
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

:::caution
Contacts can be imported via CSV. Therefore, the Brevo Module requires `text/csv` to be part of the `acceptedMimeTypes` of the `FileUploadsModule`.
The application fails to start otherwise.
:::

`frontend` can also be a function receiving the scope, if the campaign is rendered by a different site per scope:

```typescript
emailCampaigns: {
    EmailCampaignContentBlock,
    Scope: EmailCampaignContentScope,
    frontend: (scope: EmailCampaignContentScope) => {
        const siteConfig = config.siteConfigs.find((siteConfig) => siteConfig.scope.domain === scope.domain);

        if (!siteConfig) {
            throw new Error(`No site config found for scope ${scope.domain}`);
        }

        return {
            url: `${siteConfig.url}/api/render-brevo-email-campaign`,
            basicAuth: {
                username: config.campaign.basicAuth.username,
                password: config.campaign.basicAuth.password,
            },
        };
    },
},
```

### Optional entities

Besides `EmailCampaign` and `TargetGroup`, two optional entities can be registered. They are created with factories from `@dextinity/brevo-api` as well and only need the scope:

```typescript title="api/src/brevo/blacklisted-contacts/entity/blacklisted-contacts.entity.ts"
import { createBlacklistedContactsEntity } from "@dextinity/brevo-api";
import { EmailCampaignContentScope } from "@src/brevo/email-campaign/email-campaign-content-scope";

export const BlacklistedContacts = createBlacklistedContactsEntity({
    Scope: EmailCampaignContentScope,
});
```

```typescript title="api/src/brevo/brevo-email-import-log/entity/brevo-email-import-log.entity.ts"
import { createBrevoEmailImportLogEntity } from "@dextinity/brevo-api";
import { EmailCampaignContentScope } from "@src/brevo/email-campaign/email-campaign-content-scope";

export const BrevoEmailImportLog = createBrevoEmailImportLogEntity({
    Scope: EmailCampaignContentScope,
});
```

Pass them to `BrevoModule.register` to enable them:

```typescript
brevo: {
    // ...
    BlacklistedContacts,
    BrevoEmailImportLog,
},
```

| Entity                | Description                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `BlacklistedContacts` | Stores the hashed email address of contacts that were deleted, so they cannot be added again without giving their consent.                                   |
| `BrevoEmailImportLog` | Logs every contact that was added without a double opt-in, together with the responsible user and the source of the contact (manual creation or CSV import). |

:::caution
Both entities are required for [Add contacts without sending double opt-in](./2-features/contacts-without-doi.md). Without them, adding contacts without a double opt-in fails at runtime.
:::

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
"@dextinity/brevo-admin": "^10.0.0"
```

### BrevoConfigProvider

The admin pages of the Brevo Module read their configuration from the `BrevoConfigProvider`. Add it to your `App.tsx`:

```tsx title="admin/src/App.tsx"
import { BrevoConfigProvider } from "@dextinity/brevo-admin";

<BrevoConfigProvider
    value={{
        scopeParts: ["domain", "language"],
        apiUrl: config.apiUrl,
        resolvePreviewUrlForScope: (scope: ContentScope) => {
            return `${config.campaignUrl}/block-preview/${scope.domain}/${scope.language}/brevo-email-campaign`;
        },
    }}
>
    {/* Other providers and the MasterLayout */}
</BrevoConfigProvider>;
```

| Value                           | Description                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `apiUrl`                        | The URL of your API. Used for uploading the CSV file when importing contacts.                                |
| `scopeParts`                    | The parts of the content scope the Brevo Module is scoped by. Must match the scope registered in the API.    |
| `resolvePreviewUrlForScope`     | Returns the URL of the block preview in your site. This is used to render the campaign preview in the admin. |
| `allowAddingContactsWithoutDoi` | Optional. See [Add contacts without sending double opt-in](./2-features/contacts-without-doi.md).            |

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

## Email Rendering

The Brevo Module does not render emails itself. The content of an email campaign is rendered by your site and requested by the API before the campaign is sent to Brevo. Use [`@dextinity/mail-react`](../13-building-html-emails/index.md) to build the email markup.

:::info
There is no dedicated mail rendering package anymore. The former `@comet/brevo-mail-rendering` package was removed, see the [migration guide](./3-migration-guide/migration-from-brevo-v3-to-v8.md).
Its only block, `NewsletterImageBlock`, is still provided by the module: the block definition by `@dextinity/brevo-api` and the admin block by `@dextinity/brevo-admin`. Only the site-side rendering of the block lives in your project.
:::

### Installation

To add `@dextinity/mail-react` to your site, add the following to your `package.json` dependencies and install:

```json
"@dextinity/mail-react": "^10.0.0"
```

### Render the campaign content

Implement a site component for every block registered in your `EmailCampaignContentBlock`, then render the block data to HTML using `renderMailHtml`. For detailed instructions on working with blocks in Dextinity, see [Your first block](../../2-core-concepts/2-blocks/1-your-first-block.mdx). Everything regarding the email markup itself — theme, base components, block components, and layout patterns — is covered in [Building HTML Emails](../13-building-html-emails/index.md).

```tsx title="site/src/brevo/EmailCampaignMail.tsx"
import { type Config, MjmlMailRoot } from "@dextinity/mail-react";
import type { EmailCampaignContentBlockData } from "@src/blocks.generated";
import { EmailCampaignContentBlock } from "@src/brevo/blocks/EmailCampaignContentBlock";
import { theme } from "@src/mail/theme";

type EmailCampaignMailProps = {
    content: EmailCampaignContentBlockData;
    config: Config;
};

export const EmailCampaignMail = ({ content, config }: EmailCampaignMailProps) => (
    <MjmlMailRoot theme={theme} config={config}>
        <EmailCampaignContentBlock content={content} />
    </MjmlMailRoot>
);
```

This is a minimal example without localization: it renders `MjmlMailRoot` directly and only needs the block data and the mail config.
Depending on your project, the component also wraps the content in your site's own mail root and provides the contexts your block components rely on, for instance an `IntlProvider` for translations.
See Demo's [`EmailCampaignMail`](https://github.com/vivid-planet/dextinity/blob/main/demo/site/src/brevo/EmailCampaignMail.tsx) for such an implementation.

Render that component to HTML with `renderMailHtml` from `@dextinity/mail-react/server`, passing the mail config of the campaign's scope:

```tsx
import { renderMailHtml } from "@dextinity/mail-react/server";

const { html } = renderMailHtml(
    <EmailCampaignMail content={content} config={getMailConfig(scope)} />,
);
```

:::caution
`MjmlMailRoot` requires a `config` as soon as the campaign contains pixel-image blocks — `NewsletterImageBlock` as well as any block built on `MjmlPixelImageBlock` or `HtmlPixelImageBlock`.
See [Pixel-image blocks](../13-building-html-emails/3-blocks.md#configuration) for how to build it.
:::

Your site must provide two endpoints:

- **The render endpoint**, configured as `emailCampaigns.frontend.url` in the API. The API sends the campaign's `id`, `title`, `content` and `scope` to it via `POST` and expects the final email HTML in return. Protect it with the basic auth credentials configured in `emailCampaigns.frontend.basicAuth`.
  See [`demo/site/src/pages/api/render-brevo-email-campaign.tsx`](https://github.com/vivid-planet/dextinity/blob/main/demo/site/src/pages/api/render-brevo-email-campaign.tsx).
- **The block preview**, configured as `resolvePreviewUrlForScope` in the `BrevoConfigProvider`. It renders the campaign preview shown in the admin.
  See [`demo/site/src/app/block-preview/[domain]/[language]/brevo-email-campaign`](https://github.com/vivid-planet/dextinity/tree/main/demo/site/src/app/block-preview/%5Bdomain%5D/%5Blanguage%5D/brevo-email-campaign).

Both render the same component, which is where the campaign content is turned into MJML. In Demo, this is [`EmailCampaignMail`](https://github.com/vivid-planet/dextinity/blob/main/demo/site/src/brevo/EmailCampaignMail.tsx).
