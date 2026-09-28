import { MasterLayout } from "@dextinity/admin";
import { Dashboard } from "@dextinity/admin-icons";

import { MasterMenu, type MasterMenuData } from "../MasterMenu";
import { MasterMenuRoutes } from "../MasterMenuRoutes";

export default {
    title: "common/MasterMenuInMasterLayout",
};

// --------------- One item ------------------------

export const MasterMenuInMasterLayoutOneItem = () => {
    return (
        <MasterLayout menuComponent={AppMasterMenuOneItem}>
            <AppMasterMenuRoutesOneItem />
        </MasterLayout>
    );
};

const AppMasterMenuOneItem = () => {
    return <MasterMenu menu={masterMenuDataOneItem} />;
};

const AppMasterMenuRoutesOneItem = () => {
    return <MasterMenuRoutes menu={masterMenuDataOneItem} />;
};

const masterMenuDataOneItem: MasterMenuData = [
    {
        type: "route",
        primary: "Only page",
        icon: <Dashboard />,
        route: {
            path: "/only-page",
            component: OnlyPage,
        },
    },
];

function OnlyPage() {
    return "Only page";
}

// --------------- Two items ------------------------

export const MasterMenuInMasterLayoutTwoItems = () => {
    return (
        <MasterLayout menuComponent={AppMasterMenuTwoItems}>
            <AppMasterMenuRoutesTwoItems />
        </MasterLayout>
    );
};

const AppMasterMenuTwoItems = () => {
    return <MasterMenu menu={masterMenuDataTwoItems} />;
};

const AppMasterMenuRoutesTwoItems = () => {
    return <MasterMenuRoutes menu={masterMenuDataTwoItems} />;
};

const masterMenuDataTwoItems: MasterMenuData = [
    {
        type: "route",
        primary: "Page 1",
        icon: <Dashboard />,
        route: {
            path: "/page-1",
            render: () => <Page num={1} />,
        },
    },
    {
        type: "route",
        primary: "Page 2",
        icon: <Dashboard />,
        route: {
            path: "/page-2",
            component: () => <Page num={2} />,
        },
    },
];

function Page({ num }: { num: number }) {
    return `Page ${num}`;
}
