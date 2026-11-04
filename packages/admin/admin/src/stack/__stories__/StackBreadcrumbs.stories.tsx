import { useStackApi } from "../Api";
import { StackBreadcrumbs } from "../breadcrumbs/StackBreadcrumbs";
import { type BreadcrumbItem, Stack } from "../Stack";

const singleItem: BreadcrumbItem[] = [{ id: "one", parentId: "", url: "/one", title: "Breadcrumb One" }];
const twoItems: BreadcrumbItem[] = [...singleItem, { id: "two", parentId: "one", url: "/two", title: "BC 2" }];
const threeItems: BreadcrumbItem[] = [...twoItems, { id: "three", parentId: "two", url: "/three", title: "BrdCrmb 3" }];
const fiveItems: BreadcrumbItem[] = [
    ...threeItems,
    { id: "four", parentId: "three", url: "/four", title: "Really long Breadcrumb Number Four" },
    { id: "five", parentId: "four", url: "/five", title: "Breadcrumb Five" },
];
const eightItems: BreadcrumbItem[] = [
    ...fiveItems,
    { id: "six", parentId: "five", url: "/six", title: "Breadcrumb Six" },
    { id: "seven", parentId: "six", url: "/seven", title: "BrdCrmb 7" },
    { id: "eight", parentId: "seven", url: "/eight", title: "Breadcrumb Eight" },
];

const allBradcrumbItemsGroupOne: Record<string, BreadcrumbItem[]> = {
    Single: singleItem,
    Two: twoItems,
    Three: threeItems,
    Five: fiveItems,
    Eight: eightItems,
};

const allBradcrumbItemsGroupTwo: Record<string, BreadcrumbItem[]> = {
    Single: singleItem.map((item) => ({ ...item, title: `${item.title} group 2` })),
    Two: twoItems.map((item) => ({ ...item, title: `${item.title} group 2` })),
    Three: threeItems.map((item) => ({ ...item, title: `${item.title} group 2` })),
    Five: fiveItems.map((item) => ({ ...item, title: `${item.title} group 2` })),
    Eight: eightItems.map((item) => ({ ...item, title: `${item.title} group 2` })),
};

const allBreadcrumbGroups: Record<string, Record<string, BreadcrumbItem[]>> = {
    Normal: allBradcrumbItemsGroupOne,
    "Increased length": allBradcrumbItemsGroupTwo,
};

type Args = {
    selectedBreadcrumbsNumber: string;
    selectedBreadcrumbsGroup: string;
};

function Story({ selectedBreadcrumbsNumber, selectedBreadcrumbsGroup }: Args) {
    const stackApi = useStackApi();
    if (!stackApi) {
        return null;
    }
    stackApi.breadCrumbs = allBreadcrumbGroups[selectedBreadcrumbsGroup][selectedBreadcrumbsNumber];
    return <StackBreadcrumbs />;
}

export default {
    title: "components/stack/StackBreadcrumbs",
    args: {
        selectedBreadcrumbsNumber: "Three",
        selectedBreadcrumbsGroup: "Normal",
    },
    argTypes: {
        selectedBreadcrumbsNumber: {
            name: "Number of items",
            control: "select",
            options: Object.keys(allBradcrumbItemsGroupOne),
        },
        selectedBreadcrumbsGroup: {
            name: "Item group",
            control: "select",
            options: Object.keys(allBreadcrumbGroups),
        },
    },
};

export const _StackBreadcrumbs = {
    render: ({ selectedBreadcrumbsGroup, selectedBreadcrumbsNumber }: Args) => (
        <Stack topLevelTitle="Stack">
            <Story selectedBreadcrumbsGroup={selectedBreadcrumbsGroup} selectedBreadcrumbsNumber={selectedBreadcrumbsNumber} />
        </Stack>
    ),
};
