// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import type { User } from "@dextinity/cms-api";

declare module "@dextinity/cms-api" {
    interface User {
        isAdmin: boolean;
    }
}
