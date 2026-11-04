import { gql, useQuery } from "@apollo/client";

import type { GQLDamPathLazyQuery, GQLDamPathLazyQueryVariables } from "./DamPathLazy.generated";

const damPathLazyQuery = gql`
    query DamPathLazy($id: ID!) {
        damFile(id: $id) {
            damPath
        }
    }
`;

interface DamPathLazyProps {
    fileId: string;
}
export const DamPathLazy = ({ fileId }: DamPathLazyProps) => {
    const { data } = useQuery<GQLDamPathLazyQuery, GQLDamPathLazyQueryVariables>(damPathLazyQuery, { variables: { id: fileId } });
    if (!data) {
        return <> </>;
    }
    return <>{data.damFile.damPath}</>;
};
