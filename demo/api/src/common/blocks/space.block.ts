import { createSpaceBlock } from "@dextinity/cms-api";

export enum Spacing {
    d100 = "d100",
    d200 = "d200",
    d300 = "d300",
    d400 = "d400",
    s100 = "s100",
    s200 = "s200",
    s300 = "s300",
    s400 = "s400",
    s500 = "s500",
    s600 = "s600",
}

export const SpaceBlock = createSpaceBlock({ spacing: Spacing });
