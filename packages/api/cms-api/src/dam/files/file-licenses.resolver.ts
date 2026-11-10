import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { differenceInCalendarDays, isBefore } from "date-fns";

import { RequiredPermission } from "../../user-permissions/decorators/required-permission.decorator";
import { License } from "./entities/license.embeddable";
import { getLicenseExpirationDate, hasLicenseExpired, isLicenseNotValidYet, isLicenseValid } from "./license-validity";

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
        const currentDate = new Date();
        const expirationDate = this.expirationDate(license);

        return expirationDate !== undefined && isBefore(currentDate, expirationDate) && differenceInCalendarDays(expirationDate, currentDate) <= 30;
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
