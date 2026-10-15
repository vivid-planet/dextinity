import { Migration } from "@mikro-orm/migrations";

export class Migration20260310111347 extends Migration {
    async up(): Promise<void> {
        // Required migrations for constraints due to adding Brevo prefix to tables
        this.addSql(`alter table "BrevoEmailCampaign_targetGroups" drop constraint "EmailCampaign_targetGroups_pkey";`);
        this.addSql(
            `alter table "BrevoEmailCampaign_targetGroups" add constraint "BrevoEmailCampaign_targetGroups_pkey" primary key ("brevoEmailCampaign", "brevoTargetGroup");`,
        );

        this.addSql(`alter table "BrevoEmailCampaign_targetGroups" drop constraint "EmailCampaign_targetGroups_emailCampaign_foreign";`);
        this.addSql(
            `alter table "BrevoEmailCampaign_targetGroups" add constraint "BrevoEmailCampaign_targetGroups_brevoEmailCampaign_foreign" foreign key ("brevoEmailCampaign") references "BrevoEmailCampaign" ("id") on update cascade on delete cascade;`,
        );

        this.addSql(`alter table "BrevoEmailCampaign_targetGroups" drop constraint "EmailCampaign_targetGroups_targetGroup_foreign";`);
        this.addSql(
            `alter table "BrevoEmailCampaign_targetGroups" add constraint "BrevoEmailCampaign_targetGroups_brevoTargetGroup_foreign" foreign key ("brevoTargetGroup") references "BrevoTargetGroup" ("id") on update cascade on delete cascade;`,
        );

        // Migrations for Brevo code column changes
        this.addSql(`alter table "BrevoTargetGroup" alter column "isMainList" type boolean using ("isMainList"::boolean);`);
        this.addSql(`alter table "BrevoTargetGroup" alter column "isMainList" set not null;`);
    }
}
