import { BuildEntry, ContentScopeControls, Header, SearchHeaderItem, UserHeaderItem } from "@dextinity/cms-admin";
import { useAiMode } from "@src/aiMode/AiModeContext";
import { AiModeHeaderItem } from "@src/aiMode/AiModeHeaderItem";

const MasterHeader = () => {
    const { isEnabled: isAiModeEnabled } = useAiMode();

    return (
        <Header>
            <SearchHeaderItem />
            <ContentScopeControls />
            <BuildEntry />
            <UserHeaderItem />
            {isAiModeEnabled && <AiModeHeaderItem />}
        </Header>
    );
};

export default MasterHeader;
