import { Assets, Dashboard, Data, Mail, PageTree, Snips, Wrench } from "@dextinity/admin-icons";
import {
    BrevoConfigPage,
    createBrevoContactsPage,
    createBrevoTestContactsPage,
    createEmailCampaignsPage,
    createTargetGroupsPage,
} from "@dextinity/brevo-admin";
import {
    ContentScopeIndicator,
    CronJobsPage,
    DamPage,
    type DocumentInterface,
    type DocumentType,
    MasterMenu,
    type MasterMenuData,
    MasterMenuRoutes,
    PagesPage,
    PublisherPage,
    UserPermissionsPage,
    WarningsPage,
} from "@dextinity/cms-admin";
import { type BrevoContactConfig, getBrevoContactConfig } from "@src/brevo/brevoModuleConfig/brevoContactsPageAttributesConfig";
import { additionalFormConfig } from "@src/brevo/brevoModuleConfig/targetGroupFormConfig";
import { EmailCampaignContentBlock } from "@src/brevo/emailCampaigns/blocks/EmailCampaignContentBlock";
import { ImportFromPicsum } from "@src/dam/ImportFromPicsum";
import { DashboardPage } from "@src/dashboard/DashboardPage";
import { Link } from "@src/documents/links/Link";
import { Page } from "@src/documents/pages/Page";
import { PredefinedPage } from "@src/documents/predefinedPages/PredefinedPage";
import { EditFooterPage } from "@src/footer/EditFooterPage";
import type { GQLPageTreeNodeCategory } from "@src/graphql.generated";
import MainMenu from "@src/mainMenu/MainMenu";
import { NewsPage } from "@src/news/NewsPage";
import { categoryToUrlParam, pageTreeCategories, urlParamToCategory } from "@src/pageTree/pageTreeCategories";
import { CreateCapProductPage } from "@src/products/generator/CreateCapProductPage";
import { ManufacturersPage } from "@src/products/generator/ManufacturersPage";
import { ProductCategoriesPage } from "@src/products/generator/ProductCategoriesPage";
import { ProductHighlightsPage } from "@src/products/generator/ProductHighlightsPage";
import { ProductsPage } from "@src/products/generator/ProductsPage";
import { ProductsWithLowPricePage } from "@src/products/generator/ProductsWithLowPricePage";
import { ProductTagsPage } from "@src/products/generator/ProductTagsPage";
import { ProductHighlightsPage as ProductHighlightsHandmadePage } from "@src/products/highlights/ProductHighlightsPage";
import { ManufacturersPage as ManufacturersHandmadePage } from "@src/products/ManufacturersPage";
import { ProductCategoriesPage as ProductCategoriesHandmadePage } from "@src/products/ProductCategoriesPage";
import ProductsHandmadePage from "@src/products/ProductsPage";
import { ProductTagsPage as ProductTagsHandmadePage } from "@src/products/tags/ProductTagsPage";
import { RedirectsPage } from "@src/redirects/RedirectsPage";
import type { ContentScope } from "@src/site-configs";
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

const getMasterMenuData = ({ brevoContactConfig }: { brevoContactConfig: BrevoContactConfig }): MasterMenuData => {
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
                        <PagesPage
                            path={`/pages/pagetree/${match.params.category}`}
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
                            category={category}
                            renderContentScopeIndicator={(scope: ContentScope) => <ContentScopeIndicator scope={scope} />}
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
                        component: NewsPage,
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
                render: () => <DamPage additionalToolbarItems={<ImportFromPicsum />} />,
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
                    type: "collapsible",
                    primary: <FormattedMessage id="menu.generator" defaultMessage="Generator" />,
                    icon: <Snips />,
                    items: [
                        {
                            type: "route",
                            primary: <FormattedMessage id="menu.products" defaultMessage="Products" />,
                            route: {
                                path: "/products",
                                component: ProductsPage,
                            },
                        },
                        {
                            type: "route",
                            primary: <FormattedMessage id="menu.createCapProduct" defaultMessage="Create Cap Product" />,
                            route: {
                                path: "/create-cap-product",
                                component: CreateCapProductPage,
                            },
                        },
                        {
                            type: "route",
                            primary: <FormattedMessage id="menu.manufacturers" defaultMessage="Manufacturers" />,
                            route: {
                                path: "/manufacturers",
                                component: ManufacturersPage,
                            },
                        },
                        {
                            type: "route",
                            primary: <FormattedMessage id="menu.productsWithLowPrice" defaultMessage="Products with low price" />,
                            route: {
                                path: "/products-with-low-price",
                                component: ProductsWithLowPricePage,
                            },
                        },
                        {
                            type: "route",
                            primary: <FormattedMessage id="menu.productCategories" defaultMessage="Product Categories" />,
                            route: {
                                path: "/product-categories",
                                component: ProductCategoriesPage,
                            },
                        },
                        {
                            type: "route",
                            primary: <FormattedMessage id="menu.productTags" defaultMessage="Product Tags" />,
                            route: {
                                path: "/product-tags",
                                component: ProductTagsPage,
                            },
                        },
                        {
                            type: "route",
                            primary: <FormattedMessage id="menu.productHighlights" defaultMessage="Product Highlights" />,
                            route: {
                                path: "/product-highlights",
                                component: ProductHighlightsPage,
                            },
                        },
                    ],
                },
                {
                    type: "collapsible",
                    primary: <FormattedMessage id="menu.handmade" defaultMessage="Handmade" />,
                    icon: <Snips />,
                    items: [
                        {
                            type: "route",
                            primary: <FormattedMessage id="menu.productsHandmade" defaultMessage="Products Handmade" />,
                            route: {
                                path: "/products-handmade",
                                component: ProductsHandmadePage,
                            },
                        },
                        {
                            type: "route",
                            primary: <FormattedMessage id="menu.manufacturersHandmade" defaultMessage="Manufacturers Handmade" />,
                            route: {
                                path: "/manufacturers-handmade",
                                component: ManufacturersHandmadePage,
                            },
                        },
                        {
                            type: "route",
                            primary: <FormattedMessage id="menu.productCategoriesHandmade" defaultMessage="Product Categories Handmade" />,
                            route: {
                                path: "/product-categories-handmade",
                                component: ProductCategoriesHandmadePage,
                            },
                        },
                        {
                            type: "route",
                            primary: <FormattedMessage id="menu.productTagsHandmade" defaultMessage="Product Tags Handmade" />,
                            route: {
                                path: "/product-tags-handmade",
                                component: ProductTagsHandmadePage,
                            },
                        },
                        {
                            type: "route",
                            primary: <FormattedMessage id="menu.productHighlightsHandmade" defaultMessage="Product Highlights Handmade" />,
                            route: {
                                path: "/product-highlights-handmade",
                                component: ProductHighlightsHandmadePage,
                            },
                        },
                    ],
                },
            ],
            requiredPermission: "products",
        },
    ];
};

export const AppMasterMenu = () => {
    const intl = useIntl();

    const masterMenuData = useMemo(() => getMasterMenuData({ brevoContactConfig: getBrevoContactConfig(intl) }), [intl]);

    return <MasterMenu menu={masterMenuData} />;
};

export const AppMasterMenuRoutes = () => {
    const intl = useIntl();

    const masterMenuData = useMemo(() => getMasterMenuData({ brevoContactConfig: getBrevoContactConfig(intl) }), [intl]);

    return <MasterMenuRoutes menu={masterMenuData} />;
};
