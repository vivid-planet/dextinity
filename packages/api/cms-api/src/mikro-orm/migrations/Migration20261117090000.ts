import { Migration } from "@mikro-orm/migrations";

export class Migration20261117090000 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`CREATE INDEX "ActionLog_entityName_entityId_version_index" ON "ActionLog" ("entityName", "entityId", "version");`);
        this.addSql(`DROP INDEX "ActionLog_entityName_entityId_index";`);
    }
}
