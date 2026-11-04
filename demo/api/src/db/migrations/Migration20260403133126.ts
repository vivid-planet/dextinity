import { Migration } from '@mikro-orm/migrations';

export class Migration20260403133126 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "Page" add column "fullTextContent" tsvector null;`);
    this.addSql(`create index "Page_fullTextContent_index" on "public"."Page" using gin("fullTextContent");`);
    this.addSql(`alter table "Page" add column "fullTextSeo" tsvector null;`);
    this.addSql(`create index "Page_fullTextSeo_index" on "public"."Page" using gin("fullTextSeo");`);
    this.addSql(`alter table "Page" add column "fullTextStage" tsvector null;`);
    this.addSql(`create index "Page_fullTextStage_index" on "public"."Page" using gin("fullTextStage");`);
  }

  override async down(): Promise<void> {
  }

}
