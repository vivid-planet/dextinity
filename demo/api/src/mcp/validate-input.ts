import { formatValidationErrors } from "@dextinity/cms-api";
import { BadRequestException, type Type } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

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
