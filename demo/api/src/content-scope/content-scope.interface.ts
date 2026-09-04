// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import { ContentScope } from "@comet/cms-api";
import { type ContentScope as BaseContentScope } from "@src/site-configs";

declare module "@comet/cms-api" {
    interface ContentScope extends BaseContentScope {
        // Optional dimension used only by certain resolvers. Not part of `availableContentScopes` as there can be thousands of product ids.
        product?: string;
    }
}
