import type { DraftDecorator } from "draft-js";

import EditorComponent from "./EditorComponent";

const NO_BREAK_SPACE_UNICODE_CHAR = /\u00a0/g;

const Decorator: DraftDecorator = {
    strategy: (contentBlock, callback) => {
        findWithRegex(NO_BREAK_SPACE_UNICODE_CHAR, contentBlock, callback);
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
