import { faker } from "@faker-js/faker";
import { compareAsc } from "date-fns";
import { HttpResponse } from "msw";

import { graphqlApi } from "./graphqlApi";

export type Launch = {
    id: string;
    mission_name: string;
    launch_date_local: string;
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

type LaunchesPastFilter = {
    launch_date_local?: { equal?: string };
    mission_name?: { contains?: string; equal?: string };
    or?: LaunchesPastFilter[];
    and?: LaunchesPastFilter[];
};

faker.seed(1);

const allLaunches: Launch[] = Array.from({ length: 100 }, () => ({
    id: faker.string.uuid(),
    mission_name: faker.word.adjective(),
    launch_date_local: faker.date.past({ refDate: "2026-01-01" }).toISOString(),
}));

function matchesFilter(launch: Launch, filter: LaunchesPastFilter): boolean {
    if (filter.mission_name?.equal !== undefined && launch.mission_name !== filter.mission_name.equal) {
        return false;
    }
    if (filter.mission_name?.contains !== undefined && !launch.mission_name.includes(filter.mission_name.contains)) {
        return false;
    }
    if (filter.launch_date_local?.equal !== undefined && launch.launch_date_local !== filter.launch_date_local.equal) {
        return false;
    }
    if (filter.or && filter.or.length > 0 && !filter.or.some((orFilter) => matchesFilter(launch, orFilter))) {
        return false;
    }
    if (filter.and && !filter.and.every((andFilter) => matchesFilter(launch, andFilter))) {
        return false;
    }
    return true;
}

export const launchesPastQueryHandler = graphqlApi.query<
    { launchesPastResult: LaunchesPastResult },
    { limit?: number; offset?: number; sort?: string; order?: string; filter?: LaunchesPastFilter }
>("LaunchesPast", ({ variables: { limit, offset, sort, order, filter } }) => {
    let launches = filter ? allLaunches.filter((launch) => matchesFilter(launch, filter)) : [...allLaunches];

    if (sort && order) {
        const direction = order.toLowerCase() === "asc" ? 1 : -1;
        launches = launches.sort((a, b) =>
            sort === "mission_name"
                ? direction * a.mission_name.localeCompare(b.mission_name)
                : direction * compareAsc(a.launch_date_local, b.launch_date_local),
        );
    }

    return HttpResponse.json({
        data: {
            launchesPastResult: {
                data: offset !== undefined && limit ? launches.slice(offset, offset + limit) : launches,
                result: { totalCount: launches.length },
            },
        },
    });
});

export const launchesPastPagePagingQueryHandler = graphqlApi.query<
    { launchesPastPagePaging: LaunchesPastPagePagingResult },
    { page?: number; size?: number }
>("LaunchesPastPagePaging", ({ variables: { page = 1, size = 20 } }) => {
    const totalCount = allLaunches.length;

    return HttpResponse.json({
        data: {
            launchesPastPagePaging: {
                nodes: allLaunches.slice((page - 1) * size, page * size),
                totalCount,
                nextPage: totalCount > page * size ? page + 1 : undefined,
                previousPage: page > 1 ? page - 1 : undefined,
                totalPages: Math.ceil(totalCount / size),
            },
        },
    });
});
