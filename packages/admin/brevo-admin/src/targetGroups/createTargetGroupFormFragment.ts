import { type DocumentNode, gql } from "@apollo/client";
import { print } from "graphql";

export function createTargetGroupFormFragment(nodeFragment: { name: string; fragment: DocumentNode }): DocumentNode {
    const fragmentSource = ["fragment TargetGroupForm on BrevoTargetGroup {", `...${nodeFragment.name}`, "}", print(nodeFragment.fragment)].join(
        "\n",
    );
    return gql(fragmentSource);
}
