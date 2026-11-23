import { buildTemplatesHandler } from "./buildTemplatesHandler";
import { currentUserHandler } from "./currentUserHandler";
import { fullTextSearchHandler } from "./fullTextSearchHandler";

export const handlers = [currentUserHandler, buildTemplatesHandler, fullTextSearchHandler];
