import { buildTemplatesHandler } from "./buildTemplatesHandler";
import { currentUserHandler } from "./currentUserHandler";
import { fullTextSearchHandler, fullTextSearchTypesHandler } from "./fullTextSearchHandler";

export const handlers = [currentUserHandler, buildTemplatesHandler, fullTextSearchHandler, fullTextSearchTypesHandler];
