import { gqlArgsToMikroOrmQuery, RequiredPermission } from "@dextinity/cms-api";
import { EntityManager, type FindOptions } from "@mikro-orm/postgresql";
import { Args, Query, Resolver } from "@nestjs/graphql";

import { ManufacturerCountriesArgs } from "./dto/manufacturer-countries.args.js";
import { PaginatedManufacturerCountries } from "./dto/paginated-manufacturer-countries.js";
import { ManufacturerCountry } from "./entities/manufacturer-country.entity.js";

@Resolver(() => ManufacturerCountry)
@RequiredPermission(["manufacturers"], { skipScopeCheck: true })
export class ManufacturerCountryResolver {
    constructor(protected readonly entityManager: EntityManager) {}
    @Query(() => PaginatedManufacturerCountries)
    async manufacturerCountries(
        @Args()
        { search, filter, offset, limit }: ManufacturerCountriesArgs,
    ): Promise<PaginatedManufacturerCountries> {
        const where = gqlArgsToMikroOrmQuery({ search, filter }, this.entityManager.getMetadata(ManufacturerCountry));
        const options: FindOptions<ManufacturerCountry> = { offset, limit };
        const [entities, totalCount] = await this.entityManager.findAndCount(ManufacturerCountry, where, options);
        return new PaginatedManufacturerCountries(entities, totalCount);
    }
}
