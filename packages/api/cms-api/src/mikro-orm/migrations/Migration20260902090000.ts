import { Migration } from "@mikro-orm/migrations";

export class Migration20260902090000 extends Migration {
    override async up(): Promise<void> {
        // Projects may have added these indexes manually to work around the slow bulk DAM operations.
        this.addSql('create index if not exists "DamFile_copyOfId_index" on "DamFile" ("copyOfId");');
        this.addSql('create index if not exists "DamMediaAlternative_for_index" on "DamMediaAlternative" ("for");');
        this.addSql('create index if not exists "DamMediaAlternative_alternative_index" on "DamMediaAlternative" ("alternative");');
    }
}
