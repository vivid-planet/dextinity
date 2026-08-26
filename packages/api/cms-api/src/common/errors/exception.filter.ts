import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter as NestExceptionFilter,
    HttpException,
    InternalServerErrorException,
    Logger,
} from "@nestjs/common";
import { ErrorHttpStatusCode } from "@nestjs/common/utils/http-error-by-code.util";
import { Response } from "express";

import { DextinityException } from "./dextinity.exception";
import { DextinityValidationException } from "./validation.exception";

@Catch()
export class ExceptionFilter implements NestExceptionFilter {
    protected readonly logger = new Logger(ExceptionFilter.name);

    constructor(private readonly debug: boolean) {}

    catch(exception: Error, host: ArgumentsHost) {
        let statusCode: ErrorHttpStatusCode;
        let returnedError: Error;

        if (exception instanceof DextinityException) {
            const errorObject: Record<string, unknown> = {
                statusCode: 400,
                message: exception.message,
                error: exception.constructor.name,
                validationErrors: [],
            };

            if (exception instanceof DextinityValidationException) {
                errorObject.validationErrors = exception.errors;
            }

            statusCode = 400;
            returnedError = new BadRequestException(errorObject);
        } else if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            returnedError = exception;
        } else {
            returnedError = this.debug ? exception : new InternalServerErrorException();
            statusCode = "getStatus" in returnedError && typeof returnedError.getStatus === "function" ? returnedError.getStatus() : 500;
            this.logger.error(exception, exception.stack); // Log for debugging
        }

        const ctxType = host.getType<"http" | "graphql">(); // Check if it's an HTTP or GraphQL request

        if (ctxType === "graphql") {
            return returnedError;
        } else {
            const ctx = host.switchToHttp();
            const response = ctx.getResponse<Response>();
            response
                .status(statusCode)
                .json(
                    "getResponse" in returnedError && typeof returnedError.getResponse === "function"
                        ? returnedError.getResponse()
                        : { statusCode, message: returnedError.message },
                );
        }
    }
}
