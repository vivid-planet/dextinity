import { Module } from "@nestjs/common";

import { BrevoContactSubscribeController } from "./brevo-contact-subscribe.controller.js";

@Module({
    controllers: [BrevoContactSubscribeController],
})
export class BrevoContactSubscribeModule {}
