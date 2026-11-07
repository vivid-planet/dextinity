import {
    Assets,
    Company,
    Dashboard,
    Data,
    DextinityIcon,
    Favorite,
    ItemsGrouping,
    Mail,
    PageTree,
    Snips,
    Store,
    Tag,
    Wrench,
} from "@dextinity/admin-icons";
import {
    BrevoConfigPage,
    createBrevoContactsPage,
    createBrevoTestContactsPage,
    createEmailCampaignsPage,
    createTargetGroupsPage,
} from "@dextinity/brevo-admin";
import {
    CronJobsPage,
    DamPage,
    type DocumentInterface,
    type DocumentType,
    type MasterMenuData,
    MasterMenuRoutes,
    PageTreeDetailPage,
    PublisherPage,
    UserPermissionsPage,
    WarningsPage,
} from "@dextinity/cms-admin";
import { Chip } from "@mui/material";
import { type BrevoContactConfig, getBrevoContactConfig } from "@src/brevo/brevoModuleConfig/brevoContactsPageAttributesConfig";
import { getTargetGroupFormConfig } from "@src/brevo/brevoModuleConfig/targetGroupFormConfig";
import { EmailCampaignContentBlock } from "@src/brevo/emailCampaigns/blocks/EmailCampaignContentBlock";
import { DextinityUiPage } from "@src/dextinityUi/DextinityUiPage";
import { Link } from "@src/documents/links/Link";
import { Page } from "@src/documents/pages/Page";
import { PredefinedPage } from "@src/documents/predefinedPages/PredefinedPage";
import { EditFooterPage } from "@src/footer/EditFooterPage";
import type { GQLPageTreeNodeCategory } from "@src/graphql.generated";
import MainMenu from "@src/mainMenu/MainMenu";
import { NewsUiPage } from "@src/news/ui/NewsUiPage";
import { OverviewPage } from "@src/overview/OverviewPage";
import { categoryToUrlParam, pageTreeCategories, urlParamToCategory } from "@src/pageTree/pageTreeCategories";
import { ProductCategoriesPage } from "@src/products/categories/ProductCategoriesPage";
import { ProductHighlightsPage } from "@src/products/highlights/ProductHighlightsPage";
import { ManufacturersPage } from "@src/products/manufacturers/ManufacturersPage";
import { ProductTagsPage } from "@src/products/tags/ProductTagsPage";
import { ProductsUiPage } from "@src/products/ui/ProductsUiPage";
import { RedirectsPage } from "@src/redirects/RedirectsPage";
import { EditWelcomeEmailPage } from "@src/welcomeEmail/EditWelcomeEmailPage";
import { useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Redirect, type RouteComponentProps } from "react-router";

import { EditPageNode } from "./EditPageNode";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pageTreeDocumentTypes: Record<string, DocumentInterface<any, any>> = {
    Page,
    Link,
    PredefinedPage,
};

const getMasterMenuData = ({
    brevoContactConfig,
    targetGroupFormConfig,
}: {
    brevoContactConfig: BrevoContactConfig;
    targetGroupFormConfig: ReturnType<typeof getTargetGroupFormConfig>;
}): MasterMenuData => {
    const BrevoContactsPage = createBrevoContactsPage({
        additionalAttributesFragment: brevoContactConfig.additionalAttributesFragment,
        additionalGridFields: brevoContactConfig.additionalGridFields,
        additionalFormFields: brevoContactConfig.additionalFormFields,
        input2State: brevoContactConfig.input2State,
    });

    const TargetGroupsPage = createTargetGroupsPage({
        additionalFormFields: targetGroupFormConfig.additionalFormFields,
        exportTargetGroupOptions: {
            additionalAttributesFragment: brevoContactConfig.additionalAttributesFragment,
            exportFields: brevoContactConfig.exportFields,
        },
        nodeFragment: targetGroupFormConfig.nodeFragment,
        input2State: targetGroupFormConfig.input2State,
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
                component: OverviewPage,
            },
        },
        {
            type: "collapsible",
            primary: <FormattedMessage id="menu.pageTree" defaultMessage="Page tree" />,
            icon: <PageTree />,
            items: pageTreeCategories.map((category) => ({
                type: "route",
                primary: category.label,
                to: `/pages/pagetree/${categoryToUrlParam(category.category as GQLPageTreeNodeCategory)}`,
            })),
            route: {
                path: "/pages/pagetree/:category",
                render: ({ match }: RouteComponentProps<{ category: string }>) => {
                    const category = urlParamToCategory(match.params.category);

                    if (category === undefined) {
                        return <Redirect to={`${match.url}/dashboard`} />;
                    }

                    return (
                        <PageTreeDetailPage
                            path={`/pages/pagetree/${match.params.category}`}
                            eyebrow={pageTreeCategories.find((pageTreeCategory) => pageTreeCategory.category === category)?.label}
                            documentTypes={(category): Record<DocumentType, DocumentInterface> => {
                                if (category === "TopMenu") {
                                    return {
                                        Page,
                                        PredefinedPage,
                                    };
                                }

                                return {
                                    Page,
                                    PredefinedPage,
                                    Link,
                                };
                            }}
                            editPageNode={EditPageNode}
                            getCategoryUrl={(targetCategory) => `/pages/pagetree/${categoryToUrlParam(targetCategory)}`}
                            category={category}
                        />
                    );
                },
            },
            requiredPermission: "pageTree",
        },
        {
            type: "collapsible",
            primary: <FormattedMessage id="menu.structuredContent" defaultMessage="Structured Content" />,
            icon: <Data />,
            items: [
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.news" defaultMessage="News" />,
                    route: {
                        path: "/structured-content/news",
                        component: NewsUiPage,
                    },
                },
            ],
            requiredPermission: "news",
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
            primary: <FormattedMessage id="menu.project-snips" defaultMessage="Project Snips" />,
            icon: <Snips />,
            items: [
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.project-snips.mainMenu" defaultMessage="Main menu" />,
                    route: {
                        path: "/project-snips/main-menu",
                        component: MainMenu,
                    },
                    requiredPermission: "pageTree",
                },
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.project-snips.footer" defaultMessage="Footer" />,
                    route: {
                        path: "/project-snips/footer",
                        component: EditFooterPage,
                    },
                    requiredPermission: "pageTree",
                },
            ],
            requiredPermission: "pageTree",
        },
        {
            type: "collapsible",
            primary: <FormattedMessage id="menu.newsletter" defaultMessage="Newsletter" />,
            icon: <Mail />,
            items: [
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.newsletter.welcomeEmail" defaultMessage="Welcome email" />,
                    route: {
                        path: "/newsletter/welcome-email",
                        component: EditWelcomeEmailPage,
                    },
                    requiredPermission: "pageTree",
                },
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.newsletter.emailCampaigns" defaultMessage="Email campaigns" />,
                    route: {
                        path: "/newsletter/email-campaigns",
                        component: CampaignsPage,
                    },
                },
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.newsletter.contacts" defaultMessage="Contacts" />,
                    route: {
                        path: "/newsletter/contacts",
                        component: BrevoContactsPage,
                    },
                },
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.newsletter.testContacts" defaultMessage="Test contacts" />,
                    route: {
                        path: "/newsletter/test-contacts",
                        component: BrevoTestContactsPage,
                    },
                },
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.newsletter.targetGroups" defaultMessage="Target groups" />,
                    route: {
                        path: "/newsletter/target-groups",
                        component: TargetGroupsPage,
                    },
                },
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.newsletter.config" defaultMessage="Config" />,
                    route: {
                        path: "/newsletter/config",
                        component: BrevoConfigPage,
                    },
                    requiredPermission: "brevoNewsletterConfig",
                },
            ],
            requiredPermission: "brevoNewsletter",
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
                    primary: <FormattedMessage id="menu.cronJobs" defaultMessage="Cron Jobs" />,
                    route: {
                        path: "/system/cron-jobs",
                        component: CronJobsPage,
                    },
                    requiredPermission: "cronJobs",
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
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.warnings" defaultMessage="Warnings" />,
                    route: {
                        path: "/system/warnings",
                        component: WarningsPage,
                    },
                    requiredPermission: "warnings",
                },
            ],
        },
        {
            type: "route",
            primary: <FormattedMessage id="menu.userPermissions" defaultMessage="User Permissions" />,
            icon: <Snips />,
            route: {
                path: "/user-permissions",
                component: UserPermissionsPage,
            },
            requiredPermission: ["userPermissions", "impersonation"],
        },
        {
            type: "group",
            title: <FormattedMessage id="menu.products" defaultMessage="Products" />,
            items: [
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.products" defaultMessage="Products" />,
                    icon: <Store />,
                    route: {
                        path: "/products-handmade",
                        component: ProductsUiPage,
                    },
                },
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.manufacturers" defaultMessage="Manufacturers" />,
                    icon: <Company />,
                    route: {
                        path: "/manufacturers-handmade",
                        component: ManufacturersPage,
                    },
                },
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.productCategories" defaultMessage="Product Categories" />,
                    icon: <ItemsGrouping />,
                    route: {
                        path: "/product-categories-handmade",
                        component: ProductCategoriesPage,
                    },
                },
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.productTags" defaultMessage="Product Tags" />,
                    icon: <Tag />,
                    route: {
                        path: "/product-tags-handmade",
                        component: ProductTagsPage,
                    },
                },
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.productHighlights" defaultMessage="Product Highlights" />,
                    icon: <Favorite />,
                    route: {
                        path: "/product-highlights-handmade",
                        component: ProductHighlightsPage,
                    },
                },
            ],
            requiredPermission: "products",
        },
        {
            type: "group",
            title: <FormattedMessage id="menu.examples" defaultMessage="Examples" />,
            items: [
                {
                    type: "route",
                    primary: <FormattedMessage id="menu.dextinityUi" defaultMessage="Dextinity UI" />,
                    icon: <DextinityIcon />,
                    secondaryAction: <Chip size="small" label={<FormattedMessage id="menu.experimental" defaultMessage="Experimental" />} />,
                    route: {
                        path: "/dextinity-ui",
                        component: DextinityUiPage,
                    },
                },
            ],
        },
    ];
};

export const useAppMasterMenuData = (): MasterMenuData => {
    const intl = useIntl();

    return useMemo(
        () => getMasterMenuData({ brevoContactConfig: getBrevoContactConfig(intl), targetGroupFormConfig: getTargetGroupFormConfig(intl) }),
        [intl],
    );
};

export const AppMasterMenuRoutes = () => {
    const masterMenuData = useAppMasterMenuData();

    return <MasterMenuRoutes menu={masterMenuData} />;
};
