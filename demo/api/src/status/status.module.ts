import { Module } from "@nestjs/common";

import { StatusController } from "./status.controller.js";

@Module({ controllers: [StatusController] })
export class StatusModule {}
