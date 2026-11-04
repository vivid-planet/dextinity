import { graphql, HttpResponse } from "msw";

export type Manufacturer = { id: string; name: string };

export const manufacturers: Manufacturer[] = [
    { id: "1", name: "Acme Corp" },
    { id: "2", name: "TechVision" },
    { id: "3", name: "BuildCraft" },
    { id: "4", name: "NovaTech" },
    { id: "5", name: "Apex Industries" },
];

export const manufacturersQueryHandler = graphql.query<{ manufacturers: Manufacturer[] }, { search?: string }>(
    "Manufacturers",
    ({ variables }) => {
        const search = variables.search?.toLowerCase() ?? "";
        return HttpResponse.json({
            data: {
                manufacturers: search ? manufacturers.filter((m) => m.name.toLowerCase().includes(search)) : manufacturers,
            },
        });
    },
);
