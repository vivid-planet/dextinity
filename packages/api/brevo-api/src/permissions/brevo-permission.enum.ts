import { registerAdditionalPermissions } from "@dextinity/cms-api";
import { registerEnumType } from "@nestjs/graphql";

export enum BrevoPermission {
    brevoNewsletterConfig = "brevoNewsletterConfig",
    brevoNewsletter = "brevoNewsletter",
}

registerEnumType(BrevoPermission, {
    name: "BrevoPermission",
});

registerAdditionalPermissions(BrevoPermission);
