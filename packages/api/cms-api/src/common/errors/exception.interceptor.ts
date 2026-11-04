import {
    BadRequestException,
    CallHandler,
    ExecutionContext,
    HttpException,
    Injectable,
    InternalServerErrorException,
    NestInterceptor,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

import { DextinityException } from "./dextinity.exception";
import { DextinityValidationException } from "./validation.exception";

// Inspired by https://docs.nestjs.com/interceptors#more-operators
@Injectable()
/**
 * @deprecated Use `ExceptionFilter` instead
 */
export class ExceptionInterceptor implements NestInterceptor {
    constructor(private readonly debug: boolean) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        return next.handle().pipe(
            catchError((error) => {
                if (error instanceof DextinityException) {
                    const errorObject: Record<string, unknown> = {
                        statusCode: 400,
                        message: error.message,
                        error: error.constructor.name,
                        validationErrors: [],
                    };
                    if (error instanceof DextinityValidationException) {
                        errorObject.validationErrors = error.errors;
                    }
                    // Business-Logic-Level errors should be handled by the client itself and should not be considered as "server-errors"
                    return throwError(() => new BadRequestException(errorObject));
                } else if (error instanceof HttpException) {
                    // Nest-HttpExceptions are thrown as they are (mostly directly from the resolver)
                    return throwError(() => error);
                }
                // Every unhandeld exception is converted to an Internal Server Error (500)

                console.error(error); // log error to help debugging

                return throwError(() => (this.debug ? error : new InternalServerErrorException()));
            }),
        );
    }
}
