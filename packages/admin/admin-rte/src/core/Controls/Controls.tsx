import type { IControlProps } from "../types";
import BlockTypesControls from "./BlockTypesControls";
import CustomControls from "./CustomControls";
import HistoryControls from "./HistoryContols";
import InlineStyleTypeControls from "./InlineStyleTypeControls";
import LinkControls from "./LinkControls";
import ListsControls from "./ListsControls";
import ListsIndentControls from "./ListsIndentControls";
import SpecialCharactersControls from "./SpecialCharactersControls";
import { Toolbar } from "./Toolbar/Toolbar";
import TranslationControls from "./TranslationControls";

export default function Controls(p: IControlProps) {
    const {
        options: { customToolbarButtons },
    } = p;
    const hasCustomButtons = customToolbarButtons && customToolbarButtons.length > 0;
    return (
        <Toolbar {...p}>
            {[
                HistoryControls,
                BlockTypesControls,
                TranslationControls,
                InlineStyleTypeControls,
                ListsControls,
                ListsIndentControls,
                LinkControls,
                SpecialCharactersControls,
                ...(hasCustomButtons ? [CustomControls] : []),
            ]}
        </Toolbar>
    );
}
