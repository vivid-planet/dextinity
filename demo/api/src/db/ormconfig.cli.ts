import type { Options } from "@mikro-orm/postgresql";
import { PageTreeNodeScope } from "@src/page-tree/dto/page-tree-node-scope.js";

import { ormConfig } from "./ormconfig.js";

const config: Options = {
    ...ormConfig,
    entities: ["./dist/**/*.entity.js", PageTreeNodeScope],
    entitiesTs: ["./src/**/*.entity.ts", PageTreeNodeScope],
};

export default config;
