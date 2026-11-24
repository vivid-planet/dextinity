import { registerEnumType } from "@nestjs/graphql";

export enum AppPermission {
    news = "news",
    products = "products",
    manufacturers = "manufacturers",
}

registerEnumType(AppPermission, {
    name: "AppPermission",
});
