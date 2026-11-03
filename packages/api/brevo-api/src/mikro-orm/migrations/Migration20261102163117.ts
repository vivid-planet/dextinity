import { Migration } from "@mikro-orm/migrations";

export class Migration20261102163117 extends Migration {
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

        this.addSql(`alter table "BrevoTargetGroup" alter column "isMainList" type boolean using ("isMainList"::boolean);`);
        this.addSql(`update "BrevoTargetGroup" set "isMainList" = false where "isMainList" is null;`);
        this.addSql(`alter table "BrevoTargetGroup" alter column "isMainList" set not null;`);

        this.addSql(`alter table "BrevoEmailImportLog" add constraint "BrevoEmailImportLog_pkey" primary key ("id");`);
        this.addSql(`alter table "BrevoBlacklistedContacts" add constraint "BrevoBlacklistedContacts_pkey" primary key ("id");`);
    }
}
