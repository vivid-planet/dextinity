import { launchesPastPagePagingQueryHandler, launchesPastQueryHandler } from "./launchesPastHandler";
import { manufacturersQueryHandler } from "./manufacturersHandler";
import { productsQueryHandler } from "./productsHandler";
import { userQueryHandler, usersQueryHandler, usersRestHandler } from "./usersHandler";

export type { Launch, LaunchesPastPagePagingResult, LaunchesPastResult } from "./launchesPastHandler";
export type { Manufacturer } from "./manufacturersHandler";
export type { Product } from "./productsHandler";

export const handlers = [
    usersQueryHandler,
    usersRestHandler,
    userQueryHandler,
    manufacturersQueryHandler,
    productsQueryHandler,
    launchesPastQueryHandler,
    launchesPastPagePagingQueryHandler,
];
