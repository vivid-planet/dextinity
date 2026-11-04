import { manufacturersQueryHandler } from "./manufacturersHandler";
import { productsQueryHandler } from "./productsHandler";
import { userQueryHandler, usersQueryHandler, usersRestHandler } from "./usersHandler";

export type { Manufacturer } from "./manufacturersHandler";
export type { Product } from "./productsHandler";

export const handlers = [usersQueryHandler, usersRestHandler, userQueryHandler, manufacturersQueryHandler, productsQueryHandler];
