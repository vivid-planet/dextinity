import { Migration } from "@mikro-orm/migrations";

export class Migration20260812121540 extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            'create table "WelcomeEmail" ("id" uuid not null, "content" json not null, "scope_domain" text not null, "scope_language" text not null, "createdAt" timestamp with time zone not null, "updatedAt" timestamp with time zone not null);',
        );
        this.addSql('alter table "WelcomeEmail" add constraint "WelcomeEmail_pkey" primary key ("id");');
    }

    override async down(): Promise<void> {
        this.addSql('drop table if exists "WelcomeEmail" cascade;');
    }
}
