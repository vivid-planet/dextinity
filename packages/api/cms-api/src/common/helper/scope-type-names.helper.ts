import type { Type } from "@nestjs/common";
import { TypeMetadataStorage } from "@nestjs/graphql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";

interface ValidateScopeTypeNamesOptions {
    label: string;
    objectTypeName: string;
    inputTypeName: string;
}

/**
 * Validates that a scope class is decorated with the GraphQL type names Dextinity expects.
 *
 * `@ObjectType()` registers its metadata immediately, `@InputType()` only queues the registration in
 * `LazyMetadataStorage` and it is executed once a GraphQL schema is built. Modules validate their scope while they are
 * being defined, so the queued registrations have to be executed upfront. Only the registrations without a target are
 * executed (they contain the input type metadata), because executing field metadata this early can fail for types that
 * aren't fully defined yet.
 */
export function validateScopeTypeNames(Scope: Type<unknown>, { label, objectTypeName, inputTypeName }: ValidateScopeTypeNamesOptions): void {
    LazyMetadataStorage.load([], { skipFieldLazyMetadata: true });

    const scopeObjectType = TypeMetadataStorage.getObjectTypeMetadataByTarget(Scope);

    if (scopeObjectType?.name !== objectTypeName) {
        throw new Error(
            `Invalid object type name for provided ${label} scope class. Make sure to decorate the class with @ObjectType("${objectTypeName}")`,
        );
    }

    const scopeInputType = TypeMetadataStorage.getInputTypeMetadataByTarget(Scope);

    if (scopeInputType?.name !== inputTypeName) {
        throw new Error(
            `Invalid input type name for provided ${label} scope class. Make sure to decorate the class with @InputType("${inputTypeName}")`,
        );
    }
}
