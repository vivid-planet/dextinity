import { type CustomDecorator, SetMetadata } from "@nestjs/common";

export const DISABLE_DEXTINITY_GUARDS_METADATA_KEY = "disableDextinityGuards";

export const DisableDextinityGuards = (): CustomDecorator<string> => {
    return SetMetadata(DISABLE_DEXTINITY_GUARDS_METADATA_KEY, true);
};
