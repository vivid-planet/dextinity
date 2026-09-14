import type { PureQueryOptions } from "@apollo/client";
import { Delete } from "@dextinity/admin-icons";
// eslint-disable-next-line no-restricted-imports
import { Button, type ButtonProps, IconButton } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { Component, type ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { DeleteMutation } from "../DeleteMutation";
import { messages } from "../messages";

interface IProps {
    selectedId?: string;
    mutation: any;
    icon?: ReactNode | null;
    text?: ReactNode; // typically a string or a FormattedMessage (intl) is passed
    color?: ButtonProps["color"];
    refetchQueries?: Array<string | PureQueryOptions>;
}

const DeleteMessage = () => <FormattedMessage {...messages.delete} />;

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export class TableDeleteButton extends Component<IProps> {
    public render() {
        const { selectedId, mutation, refetchQueries, icon = <Delete />, text = <DeleteMessage />, color } = this.props;
        const disabled = !selectedId;

        return (
            <DeleteMutation mutation={mutation} refetchQueries={refetchQueries}>
                {(deleteBrand, { loading }) => {
                    if (loading) {
                        return <CircularProgress />;
                    }

                    const onClick = this.handleDeleteClick.bind(this, deleteBrand);

                    if (!text && icon) {
                        return (
                            <IconButton onClick={onClick} disabled={disabled} color={color} size="large">
                                {icon}
                            </IconButton>
                        );
                    }

                    return (
                        <Button onClick={onClick} disabled={disabled} color={color} startIcon={icon ? icon : undefined}>
                            {text}
                        </Button>
                    );
                }}
            </DeleteMutation>
        );
    }

    private handleDeleteClick = (
        deleteBrand: (options: {
            variables: {
                id: string;
            };
        }) => void,
    ) => {
        deleteBrand({ variables: { id: this.props.selectedId! } });
    };
}
