import { Migration } from "@mikro-orm/migrations";

export class Migration20251126093305 extends Migration {
    override async up(): Promise<void> {
        this.addSql(`ALTER TABLE "Redirect" DROP CONSTRAINT IF EXISTS "Redirect_sourceType_check";`);
        this.addSql(`ALTER TABLE "Redirect" ADD CONSTRAINT "Redirect_sourceType_check" CHECK ("sourceType" IN ('path', 'domain'));`);
    }

    override async down(): Promise<void> {}
}
