import { buildTemplatesHandler, createBuildsHandler } from "./buildTemplatesHandler";
import { currentUserHandler } from "./currentUserHandler";

export const handlers = [currentUserHandler, buildTemplatesHandler, createBuildsHandler];
