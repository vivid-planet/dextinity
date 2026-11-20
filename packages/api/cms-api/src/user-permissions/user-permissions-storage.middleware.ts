import { Injectable, type NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

import { UserPermissionsStorageService } from "./user-permissions-storage.service.js";

@Injectable()
export class UserPermissionsStorageMiddleware implements NestMiddleware {
    constructor(private readonly userPermissionsStorageService: UserPermissionsStorageService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        this.userPermissionsStorageService.run(() => next());
    }
}
