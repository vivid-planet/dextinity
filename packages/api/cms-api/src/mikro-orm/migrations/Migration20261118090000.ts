import { Migration } from "@mikro-orm/migrations";

export class Migration20261118090000 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`ALTER TABLE "ActionLog" ADD COLUMN "type" text NULL CHECK ("type" IN ('created', 'updated', 'deleted'));`);
        this.addSql(
            `UPDATE "ActionLog" SET "type" = CASE WHEN "snapshot" IS NULL THEN 'deleted' WHEN "version" = 1 THEN 'created' ELSE 'updated' END;`,
        );
        this.addSql(`ALTER TABLE "ActionLog" ALTER COLUMN "type" SET NOT NULL;`);
    }
}
