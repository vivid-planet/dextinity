import type { MasterMenuData, Permission } from "@dextinity/cms-admin";
import { createIntl, FormattedMessage } from "react-intl";
import { describe, expect, it } from "vitest";

import { findOpenAdminPage, getAdminPages } from "./adminPages";

const intl = createIntl({ locale: "en", messages: {} });

const icon = <span />;

const menu: MasterMenuData = [
    {
        type: "route",
        primary: <FormattedMessage id="menu.dashboard" defaultMessage="Dashboard" />,
        icon,
        route: { path: "/dashboard", element: null },
    },
    {
        type: "collapsible",
        primary: <FormattedMessage id="menu.pageTree" defaultMessage="Page tree" />,
        icon,
        items: [{ type: "route", primary: "Main navigation", to: "/pages/pagetree/main-navigation" }],
        route: { path: "/pages/pagetree/:category", element: null },
        requiredPermission: "pageTree",
    },
    {
        type: "collapsible",
        primary: <FormattedMessage id="menu.system" defaultMessage="System" />,
        icon,
        items: [
            {
                type: "route",
                primary: <FormattedMessage id="menu.redirects" defaultMessage="Redirects" />,
                route: { path: "/system/redirects", element: null },
                requiredPermission: "pageTree",
            },
            {
                type: "route",
                primary: <FormattedMessage id="menu.cronJobs" defaultMessage="Cron Jobs" />,
                route: { path: "/system/cron-jobs", element: null },
                requiredPermission: "cronJobs",
            },
        ],
    },
    { type: "externalLink", primary: "Docs", icon, href: "https://docs.example.com" },
    {
        type: "group",
        title: "Examples",
        items: [{ type: "route", primary: "Dextinity UI", icon, route: { path: "/dextinity-ui", element: null } }],
    },
];

const allowing =
    (...permissions: Permission[]) =>
    (permission: Permission) =>
        permissions.includes(permission);

describe("getAdminPages", () => {
    it("lists the pages of the menu the user may open, labeled with their sections", () => {
        expect(getAdminPages(menu, { isAllowed: allowing("pageTree", "cronJobs"), intl })).toEqual([
            { path: "/dashboard", label: "Dashboard" },
            { path: "/pages/pagetree/main-navigation", label: "Page tree › Main navigation" },
            { path: "/system/redirects", label: "System › Redirects" },
            { path: "/system/cron-jobs", label: "System › Cron Jobs" },
            { path: "/dextinity-ui", label: "Dextinity UI" },
        ]);
    });

    it("leaves out a page the user lacks the permission for, also through its section", () => {
        const paths = getAdminPages(menu, { isAllowed: allowing("cronJobs"), intl }).map(({ path }) => path);

        expect(paths).not.toContain("/pages/pagetree/main-navigation");
        expect(paths).not.toContain("/system/redirects");
        expect(paths).toContain("/system/cron-jobs");
    });
});

describe("findOpenAdminPage", () => {
    const pages = [
        { path: "/system", label: "System" },
        { path: "/system/redirects", label: "System › Redirects" },
    ];

    it("finds the page a path is on, also below it, preferring the most specific one", () => {
        expect(findOpenAdminPage(pages, "/system/redirects/1/edit")).toEqual({ path: "/system/redirects", label: "System › Redirects" });
    });

    it("doesn't take a page whose path is only a prefix of another segment", () => {
        expect(findOpenAdminPage(pages, "/systems")).toBeNull();
    });
});
