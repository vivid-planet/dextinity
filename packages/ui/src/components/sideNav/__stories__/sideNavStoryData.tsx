import { Icon } from "../../icon/Icon";
import type { SideNavGroup } from "../SideNav";

export const sideNavGroups: SideNavGroup[] = [
    {
        label: "Content",
        items: [
            { id: "dashboard", label: "Overview", icon: <Icon name="dash" />, href: "#dashboard" },
            {
                id: "website",
                label: "Website",
                icon: <Icon name="file" />,
                children: [
                    { id: "page-tree", label: "Page tree", href: "#page-tree" },
                    {
                        id: "careers",
                        label: "Careers",
                        children: [
                            { id: "job-ads", label: "Job ads", href: "#job-ads" },
                            { id: "locations", label: "Locations", href: "#locations" },
                        ],
                    },
                    { id: "redirects", label: "Redirects", href: "#redirects" },
                ],
            },
            { id: "submissions", label: "Submissions", icon: <Icon name="form" />, href: "#submissions", badge: 3 },
            { id: "assets", label: "Assets", icon: <Icon name="image" />, href: "#assets" },
        ],
    },
    {
        label: "Project",
        items: [
            {
                id: "structure",
                label: "Structure",
                icon: <Icon name="sitemap" />,
                children: [
                    { id: "main-navigation", label: "Main navigation", href: "#main-navigation" },
                    { id: "footer", label: "Footer and legal pages with a long label that wraps", href: "#footer" },
                ],
            },
            { id: "translations", label: "Translations", icon: <Icon name="translate" />, href: "#translations" },
        ],
    },
    {
        label: "Administration",
        items: [
            { id: "users", label: "Users", icon: <Icon name="user" />, href: "#users" },
            { id: "settings", label: "Settings", icon: <Icon name="gear" />, href: "#settings" },
        ],
    },
];
