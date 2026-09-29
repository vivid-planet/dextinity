import {
    Field,
    FilterBar,
    FilterBarPopoverFilter,
    FinalFormSearchTextField,
    type IFilterApi,
    SwitchField,
    TableFilterFinalForm,
} from "@dextinity/admin";
import { FormattedMessage, useIntl } from "react-intl";

import type { DamFilter } from "../../DamTable";

interface DamTableFilterProps {
    hideArchiveFilter?: boolean;
    filterApi: IFilterApi<DamFilter>;
}

export const DamTableFilter = ({ filterApi, hideArchiveFilter }: DamTableFilterProps) => {
    const intl = useIntl();

    return (
        <TableFilterFinalForm filterApi={filterApi}>
            <FilterBar>
                <Field
                    name="searchText"
                    component={FinalFormSearchTextField}
                    disableContentTranslation
                    fieldContainerProps={{ fieldMargin: "never" }}
                />
                {!hideArchiveFilter && (
                    <FilterBarPopoverFilter
                        label={intl.formatMessage({ id: "dextinity.pages.dam.archived", defaultMessage: "Archived" })}
                        sx={{ marginRight: 2, marginLeft: 2, marginBottom: 0 }}
                    >
                        <SwitchField
                            name="archived"
                            label={<FormattedMessage id="dextinity.pages.dam.showArchivedAssets" defaultMessage="Show archived assets" />}
                        />
                    </FilterBarPopoverFilter>
                )}
            </FilterBar>
        </TableFilterFinalForm>
    );
};
