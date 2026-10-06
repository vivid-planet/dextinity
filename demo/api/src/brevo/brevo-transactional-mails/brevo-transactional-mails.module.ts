import { Module } from "@nestjs/common";

import { BrevoTransactionalMailsController } from "./brevo-transactional-mails.controller.js";

@Module({
    controllers: [BrevoTransactionalMailsController],
})
export class BrevoTransactionalMailsModule {}
