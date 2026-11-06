import type { GQLNewsCategory, GQLNewsStatus } from "@src/graphql.generated";
import type { IntlShape } from "react-intl";

export const newsCategories: GQLNewsCategory[] = ["events", "company", "awards"];

export function getNewsCategoryLabel(intl: IntlShape, category: GQLNewsCategory) {
    switch (category) {
        case "events":
            return intl.formatMessage({ id: "uiDemo.news.category.events", defaultMessage: "Events" });
        case "company":
            return intl.formatMessage({ id: "uiDemo.news.category.company", defaultMessage: "Company" });
        case "awards":
            return intl.formatMessage({ id: "uiDemo.news.category.awards", defaultMessage: "Awards" });
    }
}

export function getNewsStatusLabel(intl: IntlShape, status: GQLNewsStatus) {
    return status === "active"
        ? intl.formatMessage({ id: "uiDemo.news.status.active", defaultMessage: "Active" })
        : intl.formatMessage({ id: "uiDemo.news.status.deleted", defaultMessage: "Deleted" });
}

export function getNewsStatusIndicator(status: GQLNewsStatus) {
    return status === "active" ? "published" : "archived";
}
