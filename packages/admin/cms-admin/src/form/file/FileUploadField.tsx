import { Field, type FieldProps } from "@dextinity/admin";

import { FinalFormFileUpload, type FinalFormFileUploadProps } from "./FinalFormFileUpload";
import type { GQLFinalFormFileUploadDownloadableFragment, GQLFinalFormFileUploadFragment } from "./FinalFormFileUpload.generated";

type SingleFileUploadProps = FieldProps<GQLFinalFormFileUploadFragment | GQLFinalFormFileUploadDownloadableFragment, HTMLInputElement> &
    FinalFormFileUploadProps<false>;

type MultipleFileUploadProps = FieldProps<Array<GQLFinalFormFileUploadFragment | GQLFinalFormFileUploadDownloadableFragment>, HTMLInputElement> &
    FinalFormFileUploadProps<true>;

export type FileUploadFieldProps<Multiple extends boolean | undefined> = Multiple extends true ? MultipleFileUploadProps : SingleFileUploadProps;

export const FileUploadField = <Multiple extends boolean | undefined>({ name, ...restProps }: FileUploadFieldProps<Multiple>) => {
    return (
        <Field<
            Multiple extends true
                ? Array<GQLFinalFormFileUploadFragment | GQLFinalFormFileUploadDownloadableFragment>
                : GQLFinalFormFileUploadFragment | GQLFinalFormFileUploadDownloadableFragment
        >
            component={FinalFormFileUpload}
            name={name}
            {...restProps}
        />
    );
};
