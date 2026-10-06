import { Module } from "@nestjs/common";

import { CronJobsResolver } from "./cron-jobs.resolver.js";
import { CronJobsService } from "./cron-jobs.service.js";
import { JobsResolver } from "./jobs.resolver.js";
import { JobsService } from "./jobs.service.js";

@Module({ providers: [CronJobsResolver, JobsResolver, CronJobsService, JobsService] })
export class CronJobsModule {}
