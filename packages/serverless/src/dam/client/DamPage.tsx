import {
    FillSpace,
    SaveBoundary,
    SaveBoundarySaveButton,
    Stack,
    StackMainContent,
    StackPage,
    StackSwitch,
    StackToolbar,
    ToolbarActions,
    ToolbarAutomaticTitleItem,
    ToolbarBackButton,
} from "@dextinity/admin";
import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { damQueryKeys } from "./damApi.types.js";
import { useDamApi } from "./DamApiProvider.js";
import { DamItemsGrid } from "./DamItemsGrid.js";
import { EditFile } from "./EditFile.js";

export function DamPage() {
    const intl = useIntl();

    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "dextinity.dam.assetManager", defaultMessage: "Asset Manager" })}>
            <DamFolder />
        </Stack>
    );
}

function DamFolder({ folderId }: { folderId?: string }) {
    const intl = useIntl();
    const { client } = useDamApi();
    // Only needed for the breadcrumb title of the subfolder page
    const [subfolderId, setSubfolderId] = useState<string>();
    const { data: subfolder } = useQuery({
        queryKey: damQueryKeys.folder(subfolderId),
        queryFn: () => parseResponse(client.folders[":id"].$get({ param: { id: subfolderId as string } })),
        enabled: subfolderId !== undefined,
    });

    return (
        <StackSwitch initialPage="grid">
            <StackPage name="grid">
                <StackToolbar />
                <StackMainContent fullHeight>
                    <DamItemsGrid folderId={folderId} />
                </StackMainContent>
            </StackPage>
            <StackPage name="folder" title={subfolder?.name}>
                {(selectedId: string) => <Subfolder id={selectedId} onActivate={setSubfolderId} />}
            </StackPage>
            <StackPage name="edit" title={intl.formatMessage({ id: "dextinity.dam.editFile", defaultMessage: "Edit file" })}>
                {(selectedId: string) => (
                    <SaveBoundary>
                        <StackToolbar>
                            <ToolbarBackButton />
                            <ToolbarAutomaticTitleItem />
                            <FillSpace />
                            <ToolbarActions>
                                <SaveBoundarySaveButton />
                            </ToolbarActions>
                        </StackToolbar>
                        <StackMainContent>
                            <EditFile id={selectedId} />
                        </StackMainContent>
                    </SaveBoundary>
                )}
            </StackPage>
        </StackSwitch>
    );
}

function Subfolder({ id, onActivate }: { id: string; onActivate: (id: string) => void }) {
    useEffect(() => {
        onActivate(id);
    }, [id, onActivate]);

    return <DamFolder folderId={id} />;
}
