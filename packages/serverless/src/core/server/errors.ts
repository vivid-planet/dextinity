import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export class DextinityHttpException extends HTTPException {
    constructor(status: ContentfulStatusCode, message?: string) {
        super(status, { message });
    }
}

export const notFound = (message = "Not Found") => new DextinityHttpException(404, message);
export const badRequest = (message = "Bad Request") => new DextinityHttpException(400, message);
export const forbidden = (message = "Forbidden") => new DextinityHttpException(403, message);
export const unauthorized = (message = "Unauthorized") => new DextinityHttpException(401, message);
export const conflict = (message = "Conflict") => new DextinityHttpException(409, message);
export const unprocessableEntity = (message = "Unprocessable Entity") => new DextinityHttpException(422, message);

/**
 * Responds with the same error shape as NestJS's exception filter, so clients of the NestJS API keep working.
 */
export const dextinityErrorHandler: ErrorHandler = (error, c) => {
    if (error instanceof HTTPException) {
        return c.json({ statusCode: error.status, message: error.message }, error.status);
    }
    console.error(error);
    return c.json({ statusCode: 500, message: "Internal Server Error" }, 500);
};
