import { buildTemplatesHandler } from "./buildTemplatesHandler";
import { currentUserHandler } from "./currentUserHandler";
import { damImagePreviewHandler } from "./damImagePreviewHandler";

export const handlers = [currentUserHandler, buildTemplatesHandler, damImagePreviewHandler];
