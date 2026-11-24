import { AiModeHeaderItem, BuildEntry, ContentScopeControls, Header, SearchHeaderItem, UserHeaderItem } from "@dextinity/cms-admin";

import { useAdminLanguage } from "./adminLanguage/AdminLanguageContext";
import { AdminLanguageSwitch } from "./adminLanguage/AdminLanguageSwitch";

const MasterHeader = () => {
    const { language, languages, setLanguage } = useAdminLanguage();

    return (
        <Header>
            <SearchHeaderItem />
            <ContentScopeControls />
            <BuildEntry />
            <UserHeaderItem>
                {languages.length > 1 && <AdminLanguageSwitch languages={languages} value={language} onChange={setLanguage} />}
            </UserHeaderItem>
            <AiModeHeaderItem />
        </Header>
    );
};

export default MasterHeader;
