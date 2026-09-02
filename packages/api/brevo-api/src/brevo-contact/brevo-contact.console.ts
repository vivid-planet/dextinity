import { CreateRequestContext, MikroORM } from "@mikro-orm/postgresql";
import { Command, CommandRunner } from "nest-commander";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { TargetGroupsService } from "../target-group/target-groups.service";

@Command({
    name: "delete-unsubscribed-brevo-contacts",
    description: "deletes unsubscribed contacts",
})
export class DeleteUnsubscribedBrevoContactsConsole extends CommandRunner {
    constructor(
        private readonly brevoApiContactsService: BrevoApiContactsService,
        private readonly targetGroupsService: TargetGroupsService,
        private readonly orm: MikroORM,
    ) {
        super();
    }

    @CreateRequestContext()
    async run(): Promise<void> {
        const offset = 0;
        const limit = 50;
        const where = { isMainList: true };

        const [targetGroups] = await this.targetGroupsService.findTargetGroups({ offset, limit, where });

        for (const targetGroup of targetGroups) {
            let hasMoreContacts = false;
            let offset = 0;

            do {
                const contacts = await this.brevoApiContactsService.findContacts(limit, offset, targetGroup.scope);

                const blacklistedContacts = contacts.filter((contact) => contact.emailBlacklisted === true);

                if (blacklistedContacts.length > 0) {
                    await this.brevoApiContactsService.deleteContacts(blacklistedContacts, targetGroup.scope);
                }

                hasMoreContacts = !(contacts.length < limit);
                offset += limit;
            } while (hasMoreContacts);
        }
    }
}
