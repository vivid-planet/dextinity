import { type User } from "@comet/cms-api";

export const staticUsers: User[] = [
    {
        id: "1",
        name: "Admin",
        email: "demo@comet-dxp.com",
        isAdmin: true,
    },
    {
        id: "2",
        name: "Non-Admin",
        email: "test@test.com",
        isAdmin: false,
    },
    // Additional non-admin users to fill the user permissions list (e.g. for testing pagination).
    // Ids must stay sequential because `UserService.getUser` resolves users by `id - 1` array index.
    ...Array.from({ length: 23 }, (_, index) => {
        const id = index + 3;
        return {
            id: `${id}`,
            name: `User ${id}`,
            email: `user${id}@comet-dxp.com`,
            isAdmin: false,
        };
    }),
];
