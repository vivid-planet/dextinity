import { Migration } from "@mikro-orm/migrations";

export class Migration20260504092659 extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            'create table "Product_relatedImages" ("product" uuid not null, "damFile" uuid not null, constraint "Product_relatedImages_pkey" primary key ("product", "damFile"));',
        );
        this.addSql(
            'alter table "Product_relatedImages" add constraint "Product_relatedImages_product_foreign" foreign key ("product") references "Product" ("id") on update cascade on delete cascade;',
        );
        this.addSql(
            'alter table "Product_relatedImages" add constraint "Product_relatedImages_damFile_foreign" foreign key ("damFile") references "DamFile" ("id") on update cascade on delete cascade;',
        );
    }

    override async down(): Promise<void> {
        this.addSql('drop table if exists "Product_relatedImages";');
    }
}
