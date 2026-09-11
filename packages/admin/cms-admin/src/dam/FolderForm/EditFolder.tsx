import { useMutation, useQuery } from "@apollo/client";
import { FinalForm, Loading } from "@dextinity/admin";

import { editFolderQuery, updateDamFolderMutation } from "./EditFolder.gql";
import type {
    GQLEditFolderQuery,
    GQLEditFolderQueryVariables,
    GQLUpdateDamFolderMutation,
    GQLUpdateDamFolderMutationVariables,
} from "./EditFolder.gql.generated";
import { FolderFormFields, type FolderFormValues } from "./FolderFormFields";

interface EditFolderProps {
    id: string;
}

const EditFolder = ({ id }: EditFolderProps) => {
    const { loading, data } = useQuery<GQLEditFolderQuery, GQLEditFolderQueryVariables>(editFolderQuery, {
        variables: {
            id: id,
        },
    });

    const [updateDamFolder] = useMutation<GQLUpdateDamFolderMutation, GQLUpdateDamFolderMutationVariables>(updateDamFolderMutation);

    if (loading || !data?.damFolder) {
        return <Loading />;
    }

    return (
        <FinalForm<FolderFormValues>
            mode="edit"
            onSubmit={async ({ name }: FolderFormValues) => {
                await updateDamFolder({
                    variables: {
                        id: id,
                        input: {
                            name,
                        },
                    },
                });
            }}
            initialValues={data?.damFolder}
        >
            <FolderFormFields />
        </FinalForm>
    );
};

export default EditFolder;
