import { actionLogsHandlers } from "./actionLogsHandlers";
import { buildTemplatesHandler } from "./buildTemplatesHandler";
import { currentUserHandler } from "./currentUserHandler";
import { globalActionLogHandlers } from "./globalActionLogHandlers";

export const handlers = [currentUserHandler, buildTemplatesHandler, ...actionLogsHandlers, ...globalActionLogHandlers];
