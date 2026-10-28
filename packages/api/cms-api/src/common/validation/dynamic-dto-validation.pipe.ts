import { type Type, ValidationPipe } from "@nestjs/common";

import { ValidationExceptionFactory } from "../errors/validation.exception-factory.js";

export class DynamicDtoValidationPipe extends ValidationPipe {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(expectedType: Type<any>) {
        super({
            exceptionFactory: ValidationExceptionFactory,
            transform: true,
            forbidNonWhitelisted: true,
            whitelist: true,
            expectedType,
        });
    }
}
