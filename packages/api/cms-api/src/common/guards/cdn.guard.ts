import { type CanActivate, type ExecutionContext, Injectable, Logger } from "@nestjs/common";
import type { Request } from "express";

import { getRequestFromExecutionContext } from "../decorators/utils.js";

@Injectable()
export class CdnGuard implements CanActivate {
    private headerName: string;
    private headerValue: string;
    protected readonly logger = new Logger(CdnGuard.name);

    constructor({ headerName, headerValue }: { headerName: string; headerValue: string }) {
        this.headerName = headerName;
        this.headerValue = headerValue;
    }

    private isInternalRequest(request: Request): boolean {
        // This check is only ok when the application is behind a trusted proxy
        return !request.header("x-forwarded-for");
    }

    getRequest(context: ExecutionContext): Request {
        return getRequestFromExecutionContext(context);
    }

    canActivate(context: ExecutionContext): boolean {
        const request = this.getRequest(context);
        if (this.isInternalRequest(request)) {
            // Internal requests (e.g. BFF) are allowed
            return true;
        }

        if (request.header(this.headerName) === this.headerValue) {
            return true;
        }

        this.logger.debug(`Header "${this.headerName}" either missing or invalid.`);
        return false;
    }
}
