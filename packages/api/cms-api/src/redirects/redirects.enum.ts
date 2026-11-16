import { registerEnumType } from "@nestjs/graphql";

export enum RedirectSourceType {
    path = "path",
    domain = "domain",
}
registerEnumType(RedirectSourceType, { name: "RedirectSourceType" });

export enum RedirectGenerationType {
    manual = "manual",
    automatic = "automatic",
}
registerEnumType(RedirectGenerationType, { name: "RedirectGenerationType" });

export enum RedirectType {
    temporary = "temporary",
    permanent = "permanent",
}
registerEnumType(RedirectType, { name: "RedirectType" });
