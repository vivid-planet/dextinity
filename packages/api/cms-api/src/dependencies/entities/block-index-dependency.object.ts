import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

// Note: This file is intentionally not named *.entity.ts to exclude it from MikroORM's CLI migration glob pattern.
// The "block_index_dependencies" materialized view is created dynamically at startup by DependenciesService, not via migrations.

@Entity({ tableName: "block_index_dependencies" })
export class BlockIndexDependencyObject {
    @PrimaryKey({ type: "text" })
    rootId: string;

    @Property({ type: "text" })
    rootEntityName: string;

    @Property({ type: "text" })
    rootGraphqlObjectType: string;

    @PrimaryKey({ type: "text" })
    rootTableName: string;

    @PrimaryKey({ type: "text" })
    rootColumnName: string;

    @Property({ type: "text" })
    rootPrimaryKey: string;

    @PrimaryKey({ type: "text" })
    blockname: string;

    @PrimaryKey({ type: "text" })
    jsonPath: string;

    @Property({ type: "boolean" })
    blockVisible: boolean;

    @Property({ type: "boolean" })
    entityVisible: boolean;

    @Property({ type: "boolean" })
    visible: boolean;

    @Property({ type: "text" })
    targetEntityName: string;

    @Property({ type: "text" })
    targetGraphqlObjectType: string;

    @PrimaryKey({ type: "text" })
    targetTableName: string;

    @Property({ type: "text" })
    targetPrimaryKey: string;

    @PrimaryKey({ type: "text" })
    targetId: string;

    @Property({ type: "text", nullable: true })
    rootName?: string;

    @Property({ type: "text", nullable: true })
    rootSecondaryInformation?: string;

    @Property({ type: "text", nullable: true })
    targetName?: string;

    @Property({ type: "text", nullable: true })
    targetSecondaryInformation?: string;
}
