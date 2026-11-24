import { type ArgumentsHost, Catch, type ExceptionFilter, ForbiddenException, HttpException, Logger, NotFoundException } from "@nestjs/common";
import { McpExecutionContext } from "@nestjs/mcp";

/**
 * Answers a call for an item of a scope the user may not read as if the item didn't exist. `@AffectedEntity` refuses
 * the one with a `ForbiddenException`, and fails to find the item or the page tree node a document is attached to with
 * an error that names the ID. Both would otherwise reach the agent as "Forbidden resource" and "Internal server error".
 * The item's ID is the tool's `id` argument.
 *
 * Other errors of the call, e.g. a `NotFoundError` for the target of a link a block transformer resolves, are rethrown:
 * the item exists. A filter of the tool takes the place of the app's global filter, so this one logs them instead.
 */
@Catch()
export class NotFoundFilter implements ExceptionFilter {
    private readonly logger = new Logger(NotFoundFilter.name);

    constructor(private readonly itemName: string) {}

    catch(exception: unknown, host: ArgumentsHost): never {
        const { id } = McpExecutionContext.create(host).getInput<{ id: string }>();
        if (exception instanceof ForbiddenException || this.isNotFoundErrorOf(exception, id)) {
            throw new NotFoundException(`There is no ${this.itemName} ${id}.`);
        }
        if (!(exception instanceof HttpException)) {
            this.logger.error(exception);
        }
        throw exception;
    }

    private isNotFoundErrorOf(exception: unknown, id: string): boolean {
        return exception instanceof Error && !(exception instanceof HttpException) && exception.message.includes(id);
    }
}
