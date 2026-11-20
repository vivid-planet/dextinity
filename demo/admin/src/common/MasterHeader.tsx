import { BuildEntry, ContentScopeControls, Header, SearchHeaderItem, UserHeaderItem } from "@dextinity/cms-admin";
import { useAiMode } from "@src/aiMode/AiModeContext";
import { AiModeHeaderItem } from "@src/aiMode/AiModeHeaderItem";

import { useAdminLanguage } from "./adminLanguage/AdminLanguageContext";
import { AdminLanguageSwitch } from "./adminLanguage/AdminLanguageSwitch";

const MasterHeader = () => {
    const { isEnabled: isAiModeEnabled } = useAiMode();
    const { language, languages, setLanguage } = useAdminLanguage();

    return (
        <Header>
            <SearchHeaderItem />
            <ContentScopeControls />
            <BuildEntry />
            <UserHeaderItem>
                {languages.length > 1 && <AdminLanguageSwitch languages={languages} value={language} onChange={setLanguage} />}
            </UserHeaderItem>
            {isAiModeEnabled && <AiModeHeaderItem />}
        </Header>
    );
};

export default MasterHeader;
