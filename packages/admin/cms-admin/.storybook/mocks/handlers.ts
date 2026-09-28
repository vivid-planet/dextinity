import { actionLogsHandlers } from "./actionLogsHandlers";
import { currentUserHandler } from "./currentUserHandler";

export const handlers = [currentUserHandler, ...actionLogsHandlers];
