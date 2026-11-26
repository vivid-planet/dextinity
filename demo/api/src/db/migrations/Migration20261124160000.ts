import { Migration } from '@mikro-orm/migrations';

export class Migration20261124160000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "Manufacturer" add column "description" jsonb null;`);
  }

}
