import { gql } from "@apollo/client";

import { damFileFieldFragment } from "../../form/file/FileField.fragment";

const damSettingsFragment = gql`
    fragment DamSettings on DamSettings {
        id
        invalidLicenseFallbackImage {
            ...DamFileFieldFile
        }
    }
    ${damFileFieldFragment}
`;

export const damSettingsQuery = gql`
    query DamSettings($scope: DamScopeInput!) {
        damSettings(scope: $scope) {
            ...DamSettings
        }
    }
    ${damSettingsFragment}
`;

export const updateDamSettingsMutation = gql`
    mutation UpdateDamSettings($scope: DamScopeInput!, $input: DamSettingsInput!) {
        updateDamSettings(scope: $scope, input: $input) {
            ...DamSettings
        }
    }
    ${damSettingsFragment}
`;
