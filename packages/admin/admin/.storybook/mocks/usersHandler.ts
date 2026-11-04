import { graphql, http, HttpResponse } from "msw";

const users = [
    { id: 1, name: "Leanne Graham", username: "Bret", email: "Sincere@april.biz" },
    { id: 2, name: "Ervin Howell", username: "Antonette", email: "Shanna@melissa.tv" },
    { id: 3, name: "Clementine Bauch", username: "Samantha", email: "Nathan@yesenia.net" },
    { id: 4, name: "Patricia Lebsack", username: "Karianne", email: "Julianne.OConner@kory.org" },
    { id: 5, name: "Chelsey Dietrich", username: "Kamren", email: "Lucio_Hettinger@annie.ca" },
    { id: 6, name: "Mrs. Dennis Schulist", username: "Leopoldo_Corkery", email: "Karley_Dach@jasper.info" },
    { id: 7, name: "Kurtis Weissnat", username: "Elwyn.Skiles", email: "Telly.Hoeger@billy.biz" },
    { id: 8, name: "Nicholas Runolfsdottir V", username: "Maxime_Nienow", email: "Sherwood@rosamond.me" },
    { id: 9, name: "Glenna Reichert", username: "Delphine", email: "Chaim_McDermott@dana.io" },
    { id: 10, name: "Clementina DuBuque", username: "Moriah.Stanton", email: "Rey.Padberg@karina.biz" },
];

export const usersQueryHandler = graphql.query<{ users: typeof users }, { query?: string }>("users", ({ variables }) => {
    const query = variables.query?.toLowerCase() ?? "";
    return HttpResponse.json({
        data: {
            users: query ? users.filter((user) => user.name.toLowerCase().includes(query)) : users,
        },
    });
});

export const usersRestHandler = http.get("/users", () => {
    return HttpResponse.json(users);
});

export const userQueryHandler = graphql.query<{ user: (typeof users)[number] | null }, { id: number }>("user", ({ variables }) => {
    return HttpResponse.json({
        data: {
            user: users.find((user) => user.id === variables.id) ?? null,
        },
    });
});
