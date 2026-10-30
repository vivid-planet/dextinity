import { MikroOrmModule } from "@dextinity/cms-api";
import { Module } from "@nestjs/common";
import { FixturesModule } from "@src/db/fixtures/fixtures.module.js";

import { MigrateCommand } from "./migrate.command.js";
import { ormConfig } from "./ormconfig.js";

@Module({
    imports: [MikroOrmModule.forRoot({ ormConfig }), FixturesModule],
    providers: [MigrateCommand],
})
export class DbModule {}
