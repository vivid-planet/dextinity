import type { EntityMetadata, EntityProperty } from "@mikro-orm/postgresql";

import { isEntityScopeMapping, type ScopedEntityMeta, type SingleEntityScopeMapping } from "../user-permissions/decorators/scoped-entity.decorator";
import { resolveFieldToSql } from "./resolve-field-to-sql";

/**
 * Resolves the scope(s) of an entity to a SQL expression returning a `jsonb` array of scopes (or `NULL::jsonb`).
 *
 * The scopes are taken from (in order of precedence):
 * 1. a `scope` property on the entity (simple case)
 * 2. a SQL-convertible `@ScopedEntity` mapping (string field path, object mapping, or an array of these for multiple scopes)
 *
 * A callback or service `@ScopedEntity` cannot be converted to SQL and therefore throws.
 */
export function resolveScopesToSql({ metadata, scopedEntity }: { metadata: EntityMetadata; scopedEntity: ScopedEntityMeta | undefined }): string {
    const scopeProp = metadata.props.find((prop) => prop.name === "scope");
    if (scopeProp) {
        return `jsonb_build_array(${scopePropertyToJsonbSql(scopeProp, metadata.tableName)})`;
    }

    if (scopedEntity) {
        if (!isEntityScopeMapping(scopedEntity)) {
            throw new Error(
                `Entity "${metadata.className}" uses a @ScopedEntity callback or service that cannot be converted to SQL, which the FullTextSearchModule requires. ` +
                    `Use the field-path string (e.g. @ScopedEntity("company.scope")) or the object mapping (e.g. @ScopedEntity({ companyId: "company.id" })) variant instead.`,
            );
        }
        const mappings = Array.isArray(scopedEntity) ? scopedEntity : [scopedEntity];
        const scopeSqls = mappings.map((mapping) => resolveScopeMappingToSql(mapping, metadata, metadata.tableName));
        return `jsonb_build_array(${scopeSqls.join(", ")})`;
    }

    return "NULL::jsonb";
}

function resolveScopeMappingToSql(mapping: SingleEntityScopeMapping, metadata: EntityMetadata, tableName: string): string {
    if (typeof mapping === "string") {
        return resolveScopePathToSql(mapping, metadata, tableName);
    }

    const pairs = Object.entries(mapping).map(([key, fieldPath]) => `'${key}', ${resolveFieldToSql(fieldPath, metadata, tableName)}`);
    return `jsonb_build_object(${pairs.join(", ")})`;
}

/**
 * Resolves a field path pointing to a scope object (an embeddable) to a `jsonb` expression.
 * Supports n-level deep ManyToOne/OneToOne relations using subqueries, analogous to {@link resolveFieldToSql}.
 */
function resolveScopePathToSql(path: string, metadata: EntityMetadata, tableName: string): string {
    const [first, ...remainingParts] = path.split(".");
    const prop = metadata.props.find((p) => p.name === first);
    if (!prop) {
        throw new Error(`Field "${first}" not found in entity "${metadata.className}"`);
    }

    if (remainingParts.length === 0) {
        return scopePropertyToJsonbSql(prop, tableName);
    }

    if (prop.kind !== "m:1" && prop.kind !== "1:1") {
        throw new Error(`Only ManyToOne and OneToOne relations are supported for @ScopedEntity scope paths. "${first}" is "${prop.kind}"`);
    }
    if (!prop.targetMeta) {
        throw new Error(`Relation "${first}" has no target metadata`);
    }

    const joinColumn = prop.joinColumns[0];
    const targetTableName = prop.targetMeta.tableName;
    const targetPrimaryKey = prop.targetMeta.primaryKeys[0];
    const innerSql = resolveScopePathToSql(remainingParts.join("."), prop.targetMeta, targetTableName);

    return `(SELECT ${innerSql} FROM "${targetTableName}" WHERE "${targetTableName}"."${targetPrimaryKey}" = "${tableName}"."${joinColumn}")`;
}

function scopePropertyToJsonbSql(prop: EntityProperty, tableName: string): string {
    if (prop.kind === "embedded") {
        return embeddableToJsonbSql(prop, tableName);
    }
    return `to_jsonb("${tableName}"."${prop.fieldNames[0]}")`;
}

function embeddableToJsonbSql(embeddedProp: EntityProperty, tableName: string): string {
    const pairs = Object.entries(embeddedProp.embeddedProps).map(([name, childProp]) => {
        if (childProp.kind === "embedded") {
            return `'${name}', ${embeddableToJsonbSql(childProp, tableName)}`;
        }
        return `'${name}', "${tableName}"."${childProp.fieldNames[0]}"`;
    });
    return `jsonb_build_object(${pairs.join(", ")})`;
}
