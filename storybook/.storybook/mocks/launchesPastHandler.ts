import { faker } from "@faker-js/faker";
import { compareAsc, compareDesc } from "date-fns";
import type { GraphQLFieldResolver } from "graphql";
import { http, HttpResponse } from "msw";

type StringFilter = {
    contains: string;
    equal: string;
};

type DateFilter = {
    equal: Date;
};

type LaunchesPastFilter = {
    launch_date_local: DateFilter;
    mission_name: StringFilter;
    or?: LaunchesPastFilter[];
    and?: LaunchesPastFilter[];
};

export type Launch = {
    id: string;
    mission_name: string;
    launch_date_local: Date;
};

export type LaunchesPastResult = {
    data: Launch[];
    result: {
        totalCount: number;
    };
};

export type LaunchesPastPagePagingResult = {
    nodes: Launch[];
    totalCount: number;
    nextPage?: number;
    previousPage?: number;
    totalPages?: number;
};

const allLaunches: Launch[] = [];

for (let i = 0; i < 100; i += 1) {
    allLaunches.push({
        id: faker.string.uuid(),
        mission_name: faker.word.adjective(),
        launch_date_local: faker.date.past(),
    });
}

export const launchesPastResultResolver: GraphQLFieldResolver<
    unknown,
    unknown,
    { limit?: number; offset?: number; sort?: string; order?: string; filter?: LaunchesPastFilter }
> = (parent, args) => {
    const { limit, offset, sort, order, filter } = args;

    let launches = [...allLaunches];

    if (sort && order) {
        const isAscending = order.toLowerCase() === "asc";
        launches = launches.sort((a, b) => {
            if (sort === "mission_name") {
                if (isAscending) {
                    return a.mission_name.localeCompare(b.mission_name);
                } else {
                    return b.mission_name.localeCompare(a.mission_name);
                }
            } else {
                if (isAscending) {
                    return compareAsc(a.launch_date_local, b.launch_date_local);
                } else {
                    return compareDesc(a.launch_date_local, b.launch_date_local);
                }
            }
        });
    }

    if (filter) {
        launches = launches.filter((launch) => {
            if (filter.mission_name) {
                if (filter.mission_name.equal) {
                    return launch.mission_name === filter.mission_name.equal;
                }
                if (filter.mission_name.contains) {
                    return launch.mission_name.includes(filter.mission_name.contains);
                }
            }
            if (filter.launch_date_local) {
                if (filter.launch_date_local.equal) {
                    return launch.launch_date_local === filter.launch_date_local.equal;
                }
            }

            if (filter.or != null && filter.or.length > 0) {
                return filter.or.some((f) => {
                    if (f.mission_name) {
                        if (f.mission_name.equal) {
                            return launch.mission_name === f.mission_name.equal;
                        }
                        if (f.mission_name.contains) {
                            return launch.mission_name.includes(f.mission_name.contains);
                        }
                    }
                    if (f.launch_date_local) {
                        if (f.launch_date_local.equal) {
                            return launch.launch_date_local === f.launch_date_local.equal;
                        }
                    }
                });
            }
            if (filter.and != null && filter.and.length > 0) {
                return filter.and.every((f) => {
                    if (f.mission_name) {
                        if (f.mission_name.equal) {
                            return launch.mission_name === f.mission_name.equal;
                        }
                        if (f.mission_name.contains) {
                            return launch.mission_name.includes(f.mission_name.contains);
                        }
                    }
                    if (f.launch_date_local) {
                        if (f.launch_date_local.equal) {
                            return launch.launch_date_local === f.launch_date_local.equal;
                        }
                    }
                });
            }

            return true;
        });
    }

    return {
        data: offset !== undefined && limit ? launches.slice(offset, offset + limit) : launches,
        result: {
            totalCount: launches.length,
        },
    };
};

export const launchesPastPagePagingResolver: GraphQLFieldResolver<unknown, unknown, { page?: number; size?: number }> = (
    parent,
    { page = 1, size = 20 },
): LaunchesPastPagePagingResult => {
    const launches = [...allLaunches];
    const totalCount = launches.length;

    return {
        nodes: launches.slice((page - 1) * size, page * size),
        totalCount: totalCount,
        nextPage: totalCount > page * size ? page + 1 : undefined,
        previousPage: page > 1 ? page - 1 : undefined,
        totalPages: Math.ceil(totalCount / size),
    };
};

export const launchesPastRestHandler = http.get("/launches", () => {
    return HttpResponse.json(allLaunches);
});
