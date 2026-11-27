import { Migration } from '@mikro-orm/migrations';

export class Migration20250827053944 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "ActionLog" ("id" uuid not null, "scope" jsonb null, "userId" text not null, "entityName" text not null, "entityId" uuid not null, "version" int not null, "snapshot" jsonb null, "createdAt" timestamp with time zone not null, constraint "ActionLog_pkey" primary key ("id"));`);
    this.addSql(`create index "ActionLog_userId_index" on "ActionLog" ("userId");`);
    this.addSql(`create index "ActionLog_scope_index" on "ActionLog" using gin ("scope");`);
    this.addSql(`create index "ActionLog_entityName_entityId_index" on "ActionLog" ("entityName", "entityId");`);
  }

  override async down(): Promise<void> {
    throw new Error("Unsupported");
  }

}
