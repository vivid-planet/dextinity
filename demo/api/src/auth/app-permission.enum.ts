import { registerEnumType } from "@nestjs/graphql";

export enum AppPermission {
    news = "news",
    products = "products",
    manufacturers = "manufacturers",
    aiHub = "aiHub",
}

registerEnumType(AppPermission, {
    name: "AppPermission",
});
