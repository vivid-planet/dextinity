import { Migration } from '@mikro-orm/migrations';

export class Migration20260203072412 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "Manufacturer" add column "productType" text check ("productType" in ('cap', 'shirt', 'tie', 'pants', 'jacket', 'shoes', 'socks', 'mug', 'pen', 'calendar', 'notebook', 'bag', 'watch', 'sunglasses', 'wallet')) null;`);
  }
}
