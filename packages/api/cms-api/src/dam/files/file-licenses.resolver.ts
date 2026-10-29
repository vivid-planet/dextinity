import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { add, differenceInCalendarDays, isAfter, isBefore } from "date-fns";

import { RequiredPermission } from "../../user-permissions/decorators/required-permission.decorator.js";
import { License } from "./entities/license.embeddable.js";

@Resolver(() => License)
@RequiredPermission(["dam"])
export class FileLicensesResolver {
    // if durationTo = '2023-02-27T00:00:00.000Z' then the license is still valid on 27.03.2023
    // and expires at '2023-02-28T00:00:00.000Z'
    @ResolveField(() => Date, { nullable: true, description: "The expirationDate is the durationTo + 1 day" })
    expirationDate(@Parent() license: License): Date | undefined {
        if (license.durationTo) {
            return add(license.durationTo, {
                days: 1,
            });
        }
        return undefined;
    }

    @ResolveField(() => Boolean)
    isNotValidYet(@Parent() license: License): boolean {
        const currentDate = new Date();

        return license.durationFrom !== undefined && isBefore(currentDate, license.durationFrom);
    }

    @ResolveField(() => Boolean)
    expiresWithinThirtyDays(@Parent() license: License): boolean {
        const currentDate = new Date();
        const expirationDate = this.expirationDate(license);

        return expirationDate !== undefined && isBefore(currentDate, expirationDate) && differenceInCalendarDays(expirationDate, currentDate) <= 30;
    }

    @ResolveField(() => Boolean)
    hasExpired(@Parent() license: License): boolean {
        const currentDate = new Date();
        const expirationDate = this.expirationDate(license);

        return expirationDate !== undefined && isAfter(currentDate, expirationDate);
    }

    @ResolveField(() => Boolean)
    isValid(@Parent() license: License): boolean {
        const isNotValidYet = this.isNotValidYet(license);
        const hasExpired = this.hasExpired(license);

        return !(isNotValidYet || hasExpired);
    }
}
