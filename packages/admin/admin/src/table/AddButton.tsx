import { AddNoCircle } from "@dextinity/admin-icons";
import { Component } from "react";
import { FormattedMessage } from "react-intl";

import { Button } from "../common/buttons/Button";
import { messages } from "../messages";
import type { ISelectionApi } from "../SelectionApi";

interface IProps {
    selectionApi: ISelectionApi;
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export class TableAddButton extends Component<IProps> {
    public render() {
        return (
            <Button variant="textDark" onClick={this.handleAddClick} startIcon={<AddNoCircle />}>
                <FormattedMessage {...messages.add} />
            </Button>
        );
    }

    private handleAddClick = () => {
        this.props.selectionApi.handleAdd();
    };
}
