import { ValidationExceptionFactory } from "@dextinity/cms-api";
import { type Type, ValidationPipe } from "@nestjs/common";

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
