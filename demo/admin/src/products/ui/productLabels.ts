import type { StatusIndicatorStatus } from "@dextinity/ui";
import type { GQLProductStatus, GQLProductType } from "@src/graphql.generated";
import { defineMessages, type IntlShape } from "react-intl";

export const productStatuses: GQLProductStatus[] = ["Published", "Unpublished", "Deleted"];

const statusMessages = defineMessages<GQLProductStatus>({
    Published: { id: "uiDemo.products.status.published", defaultMessage: "Published" },
    Unpublished: { id: "uiDemo.products.status.unpublished", defaultMessage: "Unpublished" },
    Deleted: { id: "uiDemo.products.status.deleted", defaultMessage: "Deleted" },
});

export function getProductStatusLabel(intl: IntlShape, status: GQLProductStatus) {
    return intl.formatMessage(statusMessages[status]);
}

export function getProductStatusIndicator(status: GQLProductStatus): StatusIndicatorStatus {
    switch (status) {
        case "Published":
            return "published";
        case "Unpublished":
            return "unpublished";
        case "Deleted":
            return "archived";
    }
}

const typeMessages = defineMessages<GQLProductType>({
    bag: { id: "uiDemo.products.type.bag", defaultMessage: "Bag" },
    calendar: { id: "uiDemo.products.type.calendar", defaultMessage: "Calendar" },
    cap: { id: "uiDemo.products.type.cap", defaultMessage: "Cap" },
    jacket: { id: "uiDemo.products.type.jacket", defaultMessage: "Jacket" },
    mug: { id: "uiDemo.products.type.mug", defaultMessage: "Mug" },
    notebook: { id: "uiDemo.products.type.notebook", defaultMessage: "Notebook" },
    pants: { id: "uiDemo.products.type.pants", defaultMessage: "Pants" },
    pen: { id: "uiDemo.products.type.pen", defaultMessage: "Pen" },
    shirt: { id: "uiDemo.products.type.shirt", defaultMessage: "Shirt" },
    shoes: { id: "uiDemo.products.type.shoes", defaultMessage: "Shoes" },
    socks: { id: "uiDemo.products.type.socks", defaultMessage: "Socks" },
    sunglasses: { id: "uiDemo.products.type.sunglasses", defaultMessage: "Sunglasses" },
    tie: { id: "uiDemo.products.type.tie", defaultMessage: "Tie" },
    wallet: { id: "uiDemo.products.type.wallet", defaultMessage: "Wallet" },
    watch: { id: "uiDemo.products.type.watch", defaultMessage: "Watch" },
});

export const productTypes = Object.keys(typeMessages) as GQLProductType[];

export function getProductTypeLabel(intl: IntlShape, type: GQLProductType) {
    return intl.formatMessage(typeMessages[type]);
}
