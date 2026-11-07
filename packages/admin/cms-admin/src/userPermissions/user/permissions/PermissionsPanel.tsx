import { ContentScopeGrid } from "./ContentScopeGrid";
import { PermissionGrid } from "./PermissionGrid";
import { PermissionPanels } from "./PermissionsPanel.sc";

export const UserPermissionsUserPagePermissionsPanel = ({ userId }: { userId: string }) => (
    <PermissionPanels>
        <ContentScopeGrid userId={userId} />
        <PermissionGrid userId={userId} />
    </PermissionPanels>
);
