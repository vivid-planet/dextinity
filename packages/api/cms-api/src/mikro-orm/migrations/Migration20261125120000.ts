import { Migration } from "@mikro-orm/migrations";

export class Migration20261125120000 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`DROP TABLE IF EXISTS "ChangesSinceLastBuild";`);
    }
}
