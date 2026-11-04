import { Migration } from '@mikro-orm/migrations';

export class Migration20260413095032 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "Manufacturer" add column "fullText" tsvector null;`);
    this.addSql(`create index "Manufacturer_fullText_index" on "public"."Manufacturer" using gin("fullText");`);

    this.addSql(`alter table "News" add column "fullText" tsvector null;`);
    this.addSql(`create index "News_fullText_index" on "public"."News" using gin("fullText");`);

    this.addSql(`alter table "Product" add column "fullText" tsvector null;`);
    this.addSql(`create index "Product_fullText_index" on "public"."Product" using gin("fullText");`);
  }

  override async down(): Promise<void> {
  }

}
