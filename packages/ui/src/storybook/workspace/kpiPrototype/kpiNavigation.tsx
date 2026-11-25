import { Icon } from "../../../components/icon/Icon";
import type { SideNavGroup } from "../../../components/sideNav/SideNav";

export const kpiNavGroups: SideNavGroup[] = [
    { label: "Business", items: [{ id: "overview", label: "Overview", icon: <Icon name="dashboard" />, href: "#overview" }] },
];

export function getKpiPageLabel(pageId: string) {
    return pageId === "overview" ? "Overview" : undefined;
}
