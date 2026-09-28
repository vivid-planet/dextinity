import { SetMetadata } from "@nestjs/common";

import type { ContentScope } from "../../user-permissions/interfaces/content-scope.interface";

export type AffectedScopeMeta = {
    argsToScope: (args: Record<string, unknown>) => ContentScope | ContentScope[];
};

export const AFFECTED_SCOPE_METADATA_KEY = "affectedScope";

export const AffectedScope = <T>(argsToScope: (args: T) => ContentScope | ContentScope[]): MethodDecorator => {
    return SetMetadata<string, AffectedScopeMeta>(AFFECTED_SCOPE_METADATA_KEY, { argsToScope: argsToScope as AffectedScopeMeta["argsToScope"] });
};
