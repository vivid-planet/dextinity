import { MikroOrmModule } from "@dextinity/cms-api";
import { Module } from "@nestjs/common";
import { FixturesModule } from "@src/db/fixtures/fixtures.module";

import { MigrateCommand } from "./migrate.command";
import { ormConfig } from "./ormconfig";

@Module({
    imports: [MikroOrmModule.forRoot({ ormConfig }), FixturesModule],
    providers: [MigrateCommand],
})
export class DbModule {}
