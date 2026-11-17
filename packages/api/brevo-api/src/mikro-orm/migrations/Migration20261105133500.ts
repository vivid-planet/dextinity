import { Migration } from "@mikro-orm/migrations";

export class Migration20261105133500 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "BrevoEmailCampaign" drop constraint "BrevoEmailCampaign_sendingState_check";');
        this.addSql(
            "alter table \"BrevoEmailCampaign\" add constraint \"BrevoEmailCampaign_sendingState_check\" check (\"sendingState\" in ('DRAFT', 'SENT', 'SCHEDULED', 'FAILED'));",
        );
    }
}
