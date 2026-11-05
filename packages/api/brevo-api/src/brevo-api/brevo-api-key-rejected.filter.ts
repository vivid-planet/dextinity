import { Catch, InternalServerErrorException, Logger } from "@nestjs/common";
import type { GqlExceptionFilter } from "@nestjs/graphql";

import { BrevoApiKeyRejectedError } from "./brevo-api-key-rejected.error";

// Only applied to the admin resolvers: public endpoints keep the generic error of the global ExceptionFilter,
// so anonymous callers can't tell that the Brevo integration is misconfigured
@Catch(BrevoApiKeyRejectedError)
export class BrevoApiKeyRejectedFilter implements GqlExceptionFilter {
    private readonly logger = new Logger(BrevoApiKeyRejectedFilter.name);

    catch(exception: BrevoApiKeyRejectedError): InternalServerErrorException {
        this.logger.error(exception, exception.stack);

        return new InternalServerErrorException(
            "Brevo rejected the API key. Make sure a valid Brevo API key is configured and the API's IP address is authorized in Brevo.",
        );
    }
}
