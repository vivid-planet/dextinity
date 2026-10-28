import type { EntityName, EventArgs, EventSubscriber } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { FileUpload } from "./entities/file-upload.entity.js";
import { FileUploadsService } from "./file-uploads.service.js";

@Injectable()
export class FileUploadExpirationSubscriber implements EventSubscriber {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly fileUploadsService: FileUploadsService,
    ) {
        entityManager.getEventManager().registerSubscriber(this);
    }

    getSubscribedEntities(): EntityName<FileUpload>[] {
        return [FileUpload];
    }

    async onLoad(args: EventArgs<FileUpload>): Promise<void> {
        if (args.entity.expiresAt && args.entity.expiresAt < new Date()) {
            await this.fileUploadsService.delete(args.entity);
            await this.entityManager.flush();
        }
    }
}
