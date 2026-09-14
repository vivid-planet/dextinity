import { FormSection } from "@dextinity/admin";
import type { IRteRef } from "@dextinity/admin-rte";
import { Card, CardContent } from "@mui/material";
import { convertToRaw, type EditorState, type RawDraftContentState } from "draft-js";
import { type RefObject, useEffect } from "react";

export function useAutoFocus(editorRef: RefObject<IRteRef | undefined>) {
    useEffect(() => {
        if (editorRef && editorRef.current) {
            editorRef.current.focus();
        }
    }, [editorRef]);
}

export function PrintEditorState({ editorState }: { editorState: EditorState }) {
    return (
        <Card variant="outlined">
            <CardContent>
                <FormSection title="EditorState" disableMarginBottom>
                    <pre>
                        {editorState && editorState.getCurrentContent() && JSON.stringify(convertToRaw(editorState.getCurrentContent()), null, 2)}
                    </pre>
                </FormSection>
            </CardContent>
        </Card>
    );
}

export function PrintAnything({ children, label }: { children: any; label: string }) {
    return (
        <Card variant="outlined">
            <CardContent>
                <FormSection title={label} disableMarginBottom>
                    <pre>{JSON.stringify(children, null, 2)}</pre>
                </FormSection>
            </CardContent>
        </Card>
    );
}

export const exampleContent = {
    blocks: [
        {
            key: "3v61q",
            text: "Hallo Rte!",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "fn7cl",
            text: "",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "ceuje",
            text: "bold italic underlined mixed strokethrough",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
                {
                    offset: 0,
                    length: 5,
                    style: "BOLD",
                },
                {
                    offset: 23,
                    length: 5,
                    style: "BOLD",
                },
                {
                    offset: 5,
                    length: 7,
                    style: "ITALIC",
                },
                {
                    offset: 23,
                    length: 5,
                    style: "ITALIC",
                },
                {
                    offset: 12,
                    length: 10,
                    style: "UNDERLINE",
                },
                {
                    offset: 23,
                    length: 5,
                    style: "UNDERLINE",
                },
                {
                    offset: 29,
                    length: 13,
                    style: "STRIKETHROUGH",
                },
            ],
            entityRanges: [],
            data: {},
        },
        {
            key: "18l4e",
            text: "",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "2ttbh",
            text: "Überschrift 1",
            type: "header-one",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "f2sbt",
            text: "Überschrift 2",
            type: "header-two",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "3fqqj",
            text: "Überschrift 3",
            type: "header-three",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "31mfg",
            text: "Überschrift 4",
            type: "header-four",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "8hfk",
            text: "Überschrift 5",
            type: "header-five",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "a4i7m",
            text: "Überschrift 6",
            type: "header-six",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "eggda",
            text: "Blockquote",
            type: "blockquote",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "2fi99",
            text: "Überschrift Custom",
            type: "header-custom-green",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "jo34",
            text: "foo",
            type: "unordered-list-item",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "ehf85",
            text: "bar",
            type: "unordered-list-item",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "9l0ca",
            text: "bar nested",
            type: "unordered-list-item",
            depth: 1,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "89qsj",
            text: "baz",
            type: "unordered-list-item",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "f7c8p",
            text: "foo",
            type: "ordered-list-item",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "6n1hu",
            text: "bar",
            type: "ordered-list-item",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "s1qe",
            text: "bar nested",
            type: "ordered-list-item",
            depth: 1,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "2b93q",
            text: "baz",
            type: "ordered-list-item",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "1s4bb",
            text: "",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "b5tke",
            text: "nach oben gestellt",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
                {
                    offset: 5,
                    length: 4,
                    style: "SUP",
                },
            ],
            entityRanges: [],
            data: {},
        },
        {
            key: "btjkb",
            text: "",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "c73p9",
            text: "nach unten gestellt",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
                {
                    offset: 5,
                    length: 5,
                    style: "SUB",
                },
            ],
            entityRanges: [],
            data: {},
        },
        {
            key: "dup6r",
            text: "",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
        {
            key: "6sptc",
            text: "Das ist ein Link.",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [
                {
                    offset: 12,
                    length: 4,
                    key: 0,
                },
            ],
            data: {},
        },
        {
            key: "7cbdf",
            text: "",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
        },
    ],
    entityMap: {
        "0": {
            type: "LINK",
            mutability: "MUTABLE",
            data: {
                url: "https://gitlab.vivid-planet.com/",
            },
        },
    },
} as RawDraftContentState; // inline types SUP and SUB are recognized as invalid which is incorrect
