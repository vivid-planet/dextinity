import { buildTemplatesHandler } from "./buildTemplatesHandler";
import { currentUserHandler } from "./currentUserHandler";
import { fullTextSearchPrototypeHandler } from "./fullTextSearchPrototypeHandler";

export const handlers = [currentUserHandler, buildTemplatesHandler, fullTextSearchPrototypeHandler];
