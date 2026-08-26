import { Migration } from "@mikro-orm/migrations";

export class Migration20260715090000 extends Migration {
    override async up(): Promise<void> {
        this.addSql('alter table "DamFile" add column "aiContentType" text check ("aiContentType" in (\'Generated\', \'Modified\')) null;');
    }
}
