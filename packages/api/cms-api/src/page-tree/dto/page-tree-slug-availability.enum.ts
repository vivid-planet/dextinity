import { registerEnumType } from "@nestjs/graphql";

export enum PageTreeSlugAvailability {
    Available = "Available",
    Taken = "Taken",
    Reserved = "Reserved",
}

registerEnumType(PageTreeSlugAvailability, { name: "SlugAvailability" });
