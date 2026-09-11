import type { AllCategories } from "@dextinity/cms-admin";
import type { GQLPageTreeNodeCategory } from "@src/graphql.generated";
import { camelCase, kebabCase } from "change-case";
import { FormattedMessage } from "react-intl";

export const pageTreeCategories: AllCategories = [
    {
        category: "mainNavigation",
        label: <FormattedMessage id="menu.pageTree.mainNavigation" defaultMessage="Main navigation" />,
    },
    {
        category: "topMenu",
        label: <FormattedMessage id="menu.pageTree.topMenu" defaultMessage="Top menu" />,
    },
];

const isCategory = (category: string): category is GQLPageTreeNodeCategory => {
    return pageTreeCategories.some((c) => c.category === category);
};

export function categoryToUrlParam(category: GQLPageTreeNodeCategory | string): string {
    return kebabCase(category);
}

export function urlParamToCategory(param: string): GQLPageTreeNodeCategory | undefined {
    const category = camelCase(param);
    return isCategory(category) ? category : undefined;
}
