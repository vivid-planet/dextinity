import type { User } from "@dextinity/cms-api";

export const staticUsers: User[] = [
    {
        id: "1",
        name: "Admin",
        email: "demo@dextinity.com",
        isAdmin: true,
    },
    {
        id: "2",
        name: "Non-Admin",
        email: "test@test.com",
        isAdmin: false,
    },
];
