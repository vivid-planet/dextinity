import { Catch, type ExceptionFilter, ForbiddenException } from "@nestjs/common";

/**
 * Tells the agent why the permission check refused the call. `@nestjs/mcp` answers a refusal with the message of the
 * guard's exception, which is "Forbidden resource".
 */
@Catch(ForbiddenException)
export class RefusalReasonFilter implements ExceptionFilter {
    constructor(private readonly reason: string) {}

    catch(): never {
        throw new ForbiddenException(this.reason);
    }
}
