import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import { getRequestFromExecutionContext } from "../../common/decorators/utils.js";
import type { CurrentUser } from "../../user-permissions/dto/current-user.js";

// Allows injecting Current User into resolvers via `@GetCurrentUser() user: CurrentUser`
export const GetCurrentUser = createParamDecorator((data: unknown, context: ExecutionContext): CurrentUser => {
    return getRequestFromExecutionContext(context).user;
});
