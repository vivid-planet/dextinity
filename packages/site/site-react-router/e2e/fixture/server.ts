import { createServer } from "node:http";

import { createRequestListener } from "@dextinity/site-react-router/node";

// Started by playwright.config.ts in the folder of the test app, with Vite during development and with the build in production
const server = createServer();
server.on("request", await createRequestListener({ dev: process.env.NODE_ENV !== "production", server }));
server.listen(Number(process.env.PORT));
