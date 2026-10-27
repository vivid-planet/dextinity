import { zValidator as baseZValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import type { z } from "zod";

/**
 * Validates like NestJS's `ValidationPipe`: invalid input is rejected with a 400 response listing the issues.
 */
export function zValidator<TTarget extends keyof ValidationTargets, TSchema extends z.ZodType>(target: TTarget, schema: TSchema) {
    return baseZValidator(target, schema, (result, c) => {
        if (!result.success) {
            return c.json(
                {
                    statusCode: 400,
                    message: "Validation failed",
                    issues: result.error.issues.map(({ path, message }) => ({ path: path.join("."), message })),
                },
                400,
            );
        }
    });
}
