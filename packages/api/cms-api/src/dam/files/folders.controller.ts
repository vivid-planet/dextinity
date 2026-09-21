import { Controller, ForbiddenException, Get, NotFoundException, Param, Res, Type } from "@nestjs/common";
import { Response } from "express";

import { GetCurrentUser } from "../../auth/decorators/get-current-user.decorator";
import { RequiredPermission } from "../../user-permissions/decorators/required-permission.decorator";
import { CurrentUser } from "../../user-permissions/dto/current-user";
import { DamScopeAccessControlService } from "../scope-access-control.service";
import { FoldersService } from "./folders.service";

export const createFoldersController = ({ damBasePath }: { damBasePath: string }): Type<unknown> => {
    @Controller(`${damBasePath}/folders`)
    class FoldersController {
        constructor(
            private readonly foldersService: FoldersService,
            private readonly scopeAccessControl: DamScopeAccessControlService,
        ) {}

        @RequiredPermission(["dam"], { skipScopeCheck: true }) // Scope is checked in method
        @Get("/:folderId/zip")
        async createZip(@Param("folderId") folderId: string, @Res() res: Response, @GetCurrentUser() user: CurrentUser): Promise<void> {
            const folder = await this.foldersService.findOneById(folderId);
            if (!folder) {
                throw new NotFoundException("Folder not found");
            }

            if (folder.scope && !this.scopeAccessControl.isAllowed(user, folder.scope)) {
                throw new ForbiddenException("The current user is not allowed to access this scope and download this folder.");
            }

            const zipStream = await this.foldersService.createZipStreamFromFolder(folderId);

            res.setHeader("Content-Disposition", `attachment; filename="${folder.name}.zip"`);
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("cache-control", "no-store");
            zipStream.pipe(res);
        }
    }

    return FoldersController;
};
