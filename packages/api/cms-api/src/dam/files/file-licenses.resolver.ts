import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { RequiredPermission } from "../../user-permissions/decorators/required-permission.decorator";
import { License } from "./entities/license.embeddable";
import { getLicenseExpirationDate, hasLicenseExpired, isLicenseNotValidYet, isLicenseValid, licenseExpiresWithinThirtyDays } from "./license.util";

@Resolver(() => License)
@RequiredPermission(["dam"])
export class FileLicensesResolver {
    @ResolveField(() => Date, { nullable: true, description: "The expirationDate is the durationTo + 1 day" })
    expirationDate(@Parent() license: License): Date | undefined {
        return getLicenseExpirationDate(license);
    }

    @ResolveField(() => Boolean)
    isNotValidYet(@Parent() license: License): boolean {
        return isLicenseNotValidYet(license);
    }

    @ResolveField(() => Boolean)
    expiresWithinThirtyDays(@Parent() license: License): boolean {
        return licenseExpiresWithinThirtyDays(license);
    }

    @ResolveField(() => Boolean)
    hasExpired(@Parent() license: License): boolean {
        return hasLicenseExpired(license);
    }

    @ResolveField(() => Boolean)
    isValid(@Parent() license: License): boolean {
        return isLicenseValid(license);
    }
}
