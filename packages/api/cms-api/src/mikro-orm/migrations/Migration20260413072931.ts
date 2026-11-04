import { Migration } from '@mikro-orm/migrations';

export class Migration20260413072931 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "PageTreeNode" add column "fullText" tsvector null;`);
    this.addSql(`create index "PageTreeNode_fullText_index" on "public"."PageTreeNode" using gin("fullText");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index "PageTreeNode_fullText_index";`);
    this.addSql(`alter table "PageTreeNode" drop column "fullText";`);
  }
}
