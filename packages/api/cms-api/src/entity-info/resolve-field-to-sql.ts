import type { EntityMetadata } from "@mikro-orm/postgresql";

/**
 * Resolves a field path (e.g., "title" or "manufacturer.name") to a SQL expression.
 * Supports direct fields, embeddables, and n-level deep ManyToOne/OneToOne relations using subqueries.
 */
export function resolveFieldToSql(fieldPath: string, metadata: EntityMetadata, tableName: string): string {
    const parts = fieldPath.split(".");

    if (parts.length === 1) {
        const fieldProp = metadata.props.find((p) => p.name === parts[0]);
        if (!fieldProp) {
            throw new Error(`Field "${parts[0]}" not found in entity "${metadata.className}"`);
        }

        return `"${tableName}"."${fieldProp.fieldNames[0]}"`;
    }

    const [relationName, ...remainingParts] = parts;

    const relationProp = metadata.props.find((p) => p.name === relationName);

    if (!relationProp) {
        throw new Error(`Relation "${relationName}" not found in entity "${metadata.className}"`);
    }

    if (relationProp.kind === "embedded") {
        let currentProp = relationProp;
        let currentName = relationName;
        for (const part of remainingParts) {
            const childProp = currentProp.embeddedProps?.[part];
            if (!childProp) {
                throw new Error(`Embedded field "${part}" not found in embeddable "${currentName}" of entity "${metadata.className}"`);
            }
            currentName = part;
            currentProp = childProp;
        }
        return `"${tableName}"."${currentProp.fieldNames[0]}"`;
    }

    if (relationProp.kind !== "m:1" && relationProp.kind !== "1:1") {
        throw new Error(
            `Only ManyToOne, OneToOne relations and embeddables are supported for EntityInfo. "${relationName}" is "${relationProp.kind}"`,
        );
    }

    if (!relationProp.targetMeta) {
        throw new Error(`Relation "${relationName}" has no target metadata`);
    }

    const joinColumn = relationProp.joinColumns[0];
    const targetTableName = relationProp.targetMeta.tableName;
    const targetPrimaryKey = relationProp.targetMeta.primaryKeys[0];

    const innerSql = resolveFieldToSql(remainingParts.join("."), relationProp.targetMeta, targetTableName);

    return `(SELECT ${innerSql} FROM "${targetTableName}" WHERE "${targetTableName}"."${targetPrimaryKey}" = "${tableName}"."${joinColumn}")`;
}
