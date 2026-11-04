import type { DraftDecorator } from "draft-js";

import { EditorComponent } from "./EditorComponent";

const SHY_UNICHAR_REGEX = /\u00ad/g;

const Decorator: DraftDecorator = {
    strategy: (contentBlock, callback) => {
        findWithRegex(SHY_UNICHAR_REGEX, contentBlock, callback);
    },
    component: EditorComponent,
};

function findWithRegex(regex: RegExp, contentBlock: Draft.ContentBlock, callback: (start: number, end: number) => void) {
    const text = contentBlock.getText();
    let matchArr, start;
    while ((matchArr = regex.exec(text)) !== null) {
        start = matchArr.index;
        callback(start, start + matchArr[0].length);
    }
}

export default Decorator;
