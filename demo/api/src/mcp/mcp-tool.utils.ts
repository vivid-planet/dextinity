import { type CurrentUser, formatValidationErrors } from "@dextinity/cms-api";
import { NotFoundError } from "@mikro-orm/postgresql";
import {
    type ArgumentsHost,
    BadRequestException,
    type CanActivate,
    Catch,
    type ExceptionFilter,
    type ExecutionContext,
    ForbiddenException,
    Injectable,
    NotFoundException,
    type Type,
    UnauthorizedException,
} from "@nestjs/common";
import { McpExecutionContext } from "@nestjs/mcp";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import type { Request } from "express";
import { z } from "zod";

/** The HTTP request of a tool call, after the global `DextinityAuthGuard` has authenticated it. */
type McpRequest = Request & { user?: CurrentUser | string };

/**
 * Refuses a system user authenticated by basic auth, whom `UserPermissionsGuard` lets through: the tools serve the AI
 * Mode of the admin, which a person uses.
 */
@Injectable()
export class SignedInUserGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const user = McpExecutionContext.create(context).getRequest<McpRequest>()?.user;
        if (typeof user !== "object") {
            throw new UnauthorizedException("The MCP server answers only a user signed in to the admin.");
        }
        return true;
    }
}

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

/**
 * Answers a call for an item of a scope the user may not read as if the item didn't exist. `@AffectedEntity` refuses
 * the one with a `ForbiddenException` and fails to find the other with a `NotFoundError`, which would otherwise reach
 * the agent as "Forbidden resource" and "Internal server error". The item's ID is the tool's `idArg` argument, as for
 * `@AffectedEntity`.
 */
@Catch(ForbiddenException, NotFoundError)
export class NotFoundFilter implements ExceptionFilter {
    constructor(
        private readonly itemName: string,
        private readonly idArg = "id",
    ) {}

    catch(_exception: unknown, host: ArgumentsHost): never {
        const id = McpExecutionContext.create(host).getInput<Record<string, string>>()[this.idArg];
        throw new NotFoundException(`There is no ${this.itemName} ${id}.`);
    }
}

const domainSchema = z.string().describe('Domain, e.g. "main"');

export const pageTreeScopeSchema = z
    .strictObject({
        domain: domainSchema,
        language: z.string().describe('Language, e.g. "en"'),
    })
    .describe("Content scope of the page tree");

export const damScopeSchema = z.strictObject({ domain: domainSchema }).describe("Scope of the DAM");

/**
 * Validates and transforms the input of a tool as the app's global `ValidationPipe` does the input of a GraphQL
 * mutation. The paths of the invalid values are part of the message, the only part of an error the agent gets, as the
 * GraphQL API reports them as `validationErrors`.
 */
export async function validateInput<T extends object>(input: unknown, metatype: Type<T>): Promise<T> {
    const value = plainToInstance(metatype, input);
    const validationErrors = await validate(value, { whitelist: true, forbidNonWhitelisted: true });
    if (validationErrors.length > 0) {
        throw new BadRequestException(`Validation failed:\n${JSON.stringify(formatValidationErrors(validationErrors), null, 2)}`);
    }
    return value;
}
