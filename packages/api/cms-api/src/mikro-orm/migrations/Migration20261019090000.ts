import { Migration } from "@mikro-orm/migrations";

export class Migration20261019090000 extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            'create table "DamSettings" ("id" uuid not null, "scope" jsonb null, "invalidLicenseFallbackImageId" uuid null, constraint "DamSettings_pkey" primary key ("id"));',
        );
        this.addSql(
            'alter table "DamSettings" add constraint "DamSettings_invalidLicenseFallbackImageId_foreign" foreign key ("invalidLicenseFallbackImageId") references "DamFile" ("id") on update cascade on delete set null;',
        );
    }
}
