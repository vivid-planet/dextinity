import { actionLogsHandlers } from "./actionLogsHandlers";
import { buildTemplatesHandler } from "./buildTemplatesHandler";
import { currentUserHandler } from "./currentUserHandler";

export const handlers = [currentUserHandler, buildTemplatesHandler, ...actionLogsHandlers];
