import { AnyEntity, EntityClass, EntityMetadata, EntityRepository, MikroORM } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { TypeMetadataStorage } from "@nestjs/graphql";
import { ObjectTypeMetadata } from "@nestjs/graphql/dist/schema-builder/metadata/object-type.metadata.js";

import { Block } from "../blocks/block";
import { ROOT_BLOCK_KEYS_METADATA_KEY, ROOT_BLOCK_METADATA_KEY } from "../blocks/decorators/root-block";
import { ROOT_BLOCK_ENTITY_METADATA_KEY, RootBlockEntityOptions } from "../blocks/decorators/root-block-entity";

interface DiscoverRootBlocksResult {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    repository: EntityRepository<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: EntityMetadata<any>;
    graphqlObjectType?: string;
    column: string;
    block: Block;
    options: RootBlockEntityOptions;
}

interface DiscoverTargetEntitiesResult {
    entity: AnyEntity;
    entityName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    repository: EntityRepository<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: EntityMetadata<any>;
    graphqlObjectType?: string;
}

@Injectable()
export class DiscoverService {
    objectTypesMetadata: ObjectTypeMetadata[];

    constructor(private readonly orm: MikroORM) {
        this.objectTypesMetadata = TypeMetadataStorage.getObjectTypesMetadata();
    }

    discoverRootBlocks(): DiscoverRootBlocksResult[] {
        const ret: DiscoverRootBlocksResult[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entities = this.orm.config.get("entities") as EntityClass<any>[];
        const metadataStorage = this.orm.em.getMetadata();

        entities.forEach((entity) => {
            const rootBlockEntityOptions = Reflect.getMetadata(ROOT_BLOCK_ENTITY_METADATA_KEY, entity);

            if (rootBlockEntityOptions) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const keys = Reflect.getMetadata(ROOT_BLOCK_KEYS_METADATA_KEY, (entity as any).prototype) || [];
                for (const key of keys) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const block = Reflect.getMetadata(ROOT_BLOCK_METADATA_KEY, (entity as any).prototype, key);
                    ret.push({
                        repository: this.orm.em.getRepository(entity),
                        metadata: metadataStorage.get(entity.name),
                        graphqlObjectType: this.objectTypesMetadata.find((item) => item.target.name === entity.name)?.name,
                        options: rootBlockEntityOptions,
                        column: key,
                        block,
                    });
                }
            }
        });
        return ret;
    }

    discoverTargetEntities(): DiscoverTargetEntitiesResult[] {
        const ret: DiscoverTargetEntitiesResult[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entities = this.orm.config.get("entities") as EntityClass<any>[];
        const metadataStorage = this.orm.em.getMetadata();

        entities.forEach((entity) => {
            ret.push({
                entity,
                entityName: entity.name,
                repository: this.orm.em.getRepository(entity.name),
                metadata: metadataStorage.get(entity.name),
                graphqlObjectType: this.objectTypesMetadata.find((item) => item.target.name === entity.name)?.name,
            });
        });

        return ret;
    }
}
