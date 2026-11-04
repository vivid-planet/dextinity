import type { Options } from "@mikro-orm/postgresql";
import { PageTreeNodeScope } from "@src/page-tree/dto/page-tree-node-scope";

import { ormConfig } from "./ormconfig";

const config: Options = {
    ...ormConfig,
    entities: ["./dist/**/*.entity.js", PageTreeNodeScope],
    entitiesTs: ["./src/**/*.entity.ts", PageTreeNodeScope],
};

export = config;
