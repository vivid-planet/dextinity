import { Migration } from "@mikro-orm/migrations";

export class Migration20260803090000 extends Migration {
    override async up(): Promise<void> {
        this.addSql('alter table if exists "CometFileUpload" rename to "DextinityFileUpload";');
        this.addSql('alter index if exists "CometFileUpload_contentHash_index" rename to "DextinityFileUpload_contentHash_index";');
        this.addSql('alter table if exists "CometUserPermission" rename to "DextinityUserPermission";');
        this.addSql('alter table if exists "CometUserContentScopes" rename to "DextinityUserContentScopes";');
    }
}
