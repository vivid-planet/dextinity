import { NotFoundError } from "@mikro-orm/postgresql";
import { type ArgumentsHost, Catch, type ExceptionFilter, ForbiddenException, NotFoundException } from "@nestjs/common";
import { McpExecutionContext } from "@nestjs/mcp";

/**
 * Answers a call for an item of a scope the user may not read as if the item didn't exist. `@AffectedEntity` refuses
 * the one with a `ForbiddenException` and fails to find the other with a `NotFoundError`, which would otherwise reach
 * the agent as "Forbidden resource" and "Internal server error". The item's ID is the tool's `id` argument.
 */
@Catch(ForbiddenException, NotFoundError)
export class NotFoundFilter implements ExceptionFilter {
    constructor(private readonly itemName: string) {}

    catch(_exception: unknown, host: ArgumentsHost): never {
        const { id } = McpExecutionContext.create(host).getInput<{ id: string }>();
        throw new NotFoundException(`There is no ${this.itemName} ${id}.`);
    }
}
