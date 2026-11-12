import { Migration } from "@mikro-orm/migrations";

export class Migration20261103090000 extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            `ALTER TABLE "Redirect" ADD COLUMN "redirectType" text NOT NULL DEFAULT 'temporary' CHECK ("redirectType" IN ('temporary', 'permanent'));`,
        );
        this.addSql(`ALTER TABLE "Redirect" ALTER COLUMN "redirectType" DROP DEFAULT;`);
    }
}
