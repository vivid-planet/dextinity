import { Migration } from '@mikro-orm/migrations';

export class Migration20260310094014 extends Migration {

  override async up(): Promise<void> {  
    // Migrations for demo code changes
    this.addSql(`alter table "News" alter column "category" drop default;`);
    this.addSql(`alter table "News" alter column "category" type text using ("category"::text);`);

    this.addSql(`alter table "PageTreeNode" drop constraint if exists "PageTreeNode_userGroup_check";`);
    this.addSql(`alter table "PageTreeNode" add constraint "PageTreeNode_userGroup_check" check("userGroup" in ('all', 'admin', 'editor'));`);
  }

}
