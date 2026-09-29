import { useMutation } from "@apollo/client";
import { FinalForm } from "@dextinity/admin";

import { useDamScope } from "../config/useDamScope";
import { clearDamItemCache } from "../helpers/clearDamItemCache";
import { createDamFolderMutation } from "./AddFolder.gql";
import type { GQLCreateDamFolderMutation, GQLCreateDamFolderMutationVariables } from "./AddFolder.gql.generated";
import { FolderFormFields, type FolderFormValues } from "./FolderFormFields";

interface AddFolderProps {
    parentId?: string;
}

const AddFolder = ({ parentId }: AddFolderProps) => {
    const scope = useDamScope();
    const [createDamFolder] = useMutation<GQLCreateDamFolderMutation, GQLCreateDamFolderMutationVariables>(createDamFolderMutation, {
        refetchQueries: ["DamItemsList"],
        update: (cache) => {
            clearDamItemCache(cache);
        },
    });

    return (
        <FinalForm<FolderFormValues>
            mode="add"
            onSubmit={async ({ name }: FolderFormValues) => {
                await createDamFolder({
                    variables: {
                        input: {
                            name,
                            parentId: parentId,
                        },
                        scope,
                    },
                });
            }}
        >
            <FolderFormFields />
        </FinalForm>
    );
};

export default AddFolder;
