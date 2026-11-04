import { graphql, HttpResponse } from "msw";

export const buildTemplatesHandler = graphql.query("BuildTemplates", () => {
    return HttpResponse.json({
        data: {
            buildTemplates: Array.from({ length: 10 }, (_, i) => ({
                __typename: "BuildTemplate",
                id: `template-${i + 1}`,
                name: `template-${i + 1}`,
                label: `Build Template ${i + 1}`,
            })),
        },
    });
});
