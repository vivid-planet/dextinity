import { CancelButton, CheckboxField, Dialog, FieldContainer, FinalForm, OnChangeField, SaveButton, SelectField, TextField } from "@dextinity/admin";
import { DialogActions, DialogContent, Typography } from "@mui/material";
import { parseResponse } from "hono/client";
import { useIntl } from "react-intl";
import slugify from "slugify";

import type { PageTreeNodeItem } from "./pageTreeApi.types.js";
import { usePageTreeApi } from "./PageTreeApiProvider.js";
import { usePageTreeMutation } from "./usePageTreeMutation.js";

interface FormValues {
    name: string;
    slug: string;
    hideInMenu: boolean;
    documentType: string;
}

interface PageTreeNodeDialogProps {
    onClose: () => void;
    category: string;
    /** Edits the node. Without it, the dialog adds a node to `parent` (or the root). */
    node?: PageTreeNodeItem;
    parent?: PageTreeNodeItem | null;
}

const slugPattern = /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/;

/** Like the slug transformation of `@dextinity/cms-admin`: only unreserved characters remain (RFC 3986) */
function transformToSlug(name: string, locale: string): string {
    return slugify(name, { replacement: "-", lower: true, locale }).replace(/[^a-zA-Z0-9-._~]/g, "");
}

export function PageTreeNodeDialog({ onClose, category, node, parent = null }: PageTreeNodeDialogProps) {
    const intl = useIntl();
    const { client, scope, documentTypes } = usePageTreeApi();
    const isHome = node?.slug === "home";
    const parentId = node ? node.parentId : (parent?.id ?? null);
    const parentPath = parent ? (parent.path === "/" ? "/home" : parent.path) : node ? node.path.replace(/\/[^/]*$/, "") : "";

    const { mutateAsync: save } = usePageTreeMutation((values: FormValues) =>
        node
            ? parseResponse(client.nodes[":id"].$patch({ param: { id: node.id }, json: values }))
            : parseResponse(client.nodes.$post({ json: { ...values, scope, category, parentId } })),
    );

    const validateSlug = async (slug: string | undefined): Promise<string | undefined> => {
        if (!slug || (node && slug === node.slug)) {
            return undefined;
        }
        if (!slugPattern.test(slug)) {
            return intl.formatMessage({
                id: "dextinity.pageTree.slug.invalid",
                defaultMessage: "Only letters, digits, hyphens and underscores, starting with a letter or digit",
            });
        }
        const { availability } = await parseResponse(
            client["slug-availability"].$get({ query: { ...scope, slug, ...(parentId ? { parentId } : {}) } }),
        );
        if (availability === "Taken") {
            return intl.formatMessage({ id: "dextinity.pageTree.slug.taken", defaultMessage: "A page with this path already exists" });
        }
        if (availability === "Reserved") {
            return intl.formatMessage({ id: "dextinity.pageTree.slug.reserved", defaultMessage: "This path is reserved" });
        }
        return undefined;
    };

    const handleSubmit = async (values: FormValues) => {
        try {
            await save(values);
            onClose();
        } catch {
            // The snackbar of the mutation shows the error, the dialog stays open
        }
    };

    return (
        <Dialog
            open
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            title={
                node
                    ? intl.formatMessage({ id: "dextinity.pageTree.editPageProperties", defaultMessage: "Edit page properties" })
                    : intl.formatMessage({ id: "dextinity.pageTree.addPage", defaultMessage: "Add page" })
            }
        >
            <FinalForm<FormValues>
                mode={node ? "edit" : "add"}
                initialValues={{
                    name: node?.name ?? "",
                    slug: node?.slug ?? "",
                    hideInMenu: node?.hideInMenu ?? false,
                    documentType: node?.documentType ?? Object.keys(documentTypes)[0],
                }}
                onSubmit={handleSubmit}
            >
                {({ submitting, values, form }) => (
                    <>
                        <DialogContent>
                            <TextField
                                name="name"
                                label={intl.formatMessage({ id: "dextinity.pageTree.name", defaultMessage: "Name" })}
                                required
                                fullWidth
                                autoFocus
                            />
                            {!node && (
                                <OnChangeField name="name">
                                    {(name: string) => {
                                        if (!form.getFieldState("slug")?.modified) {
                                            form.change("slug", transformToSlug(name, intl.locale));
                                        }
                                    }}
                                </OnChangeField>
                            )}
                            <TextField
                                name="slug"
                                label={intl.formatMessage({ id: "dextinity.pageTree.slug", defaultMessage: "Slug" })}
                                required
                                fullWidth
                                disabled={isHome}
                                validate={validateSlug}
                            />
                            <FieldContainer label={intl.formatMessage({ id: "dextinity.pageTree.path", defaultMessage: "Path" })} fullWidth>
                                <Typography variant="body2" color="textSecondary">
                                    {values.slug === "home" && parentPath === "" ? "/" : `${parentPath}/${values.slug ?? ""}`}
                                </Typography>
                            </FieldContainer>
                            <SelectField
                                name="documentType"
                                label={intl.formatMessage({ id: "dextinity.pageTree.documentType", defaultMessage: "Document type" })}
                                options={Object.entries(documentTypes).map(([value, { label }]) => ({ value, label }))}
                                required
                                fullWidth
                            />
                            <CheckboxField
                                name="hideInMenu"
                                label={intl.formatMessage({ id: "dextinity.pageTree.hideInMenu", defaultMessage: "Hide in menu" })}
                                type="checkbox"
                            />
                        </DialogContent>
                        <DialogActions>
                            <CancelButton onClick={onClose} />
                            <SaveButton type="submit" loading={submitting} />
                        </DialogActions>
                    </>
                )}
            </FinalForm>
        </Dialog>
    );
}
