import { useState } from "react";

import { Button } from "../../../components/button/Button";
import { Checkbox } from "../../../components/checkbox/Checkbox";
import { Dialog } from "../../../components/dialog/Dialog";
import { Field } from "../../../components/field/Field";
import { Input } from "../../../components/input/Input";
import { Select } from "../../../components/select/Select";
import { flattenPages, type SitePage } from "./cmsData";
import styles from "./cmsPrototype.module.scss";
import { slugify } from "./pageTreeState";

const topLevel = "top-level";

const documentTypes = [
    { value: "page", label: "Page" },
    { value: "link", label: "Link" },
    { value: "predefined", label: "Predefined page" },
];

export interface NewPage {
    parentId: string | null;
    name: string;
    slug: string;
    path: string;
    documentType: string;
    hiddenInMenu: boolean;
}

/** Remounted for each opening, so it starts empty below the page that was active in the tree. */
export function NewPageDialog({
    open,
    onOpenChange,
    pages,
    defaultParentId,
    onCreate,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pages: SitePage[];
    defaultParentId: string | null;
    onCreate: (page: NewPage) => void;
}) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [isSlugEdited, setIsSlugEdited] = useState(false);
    const [parentId, setParentId] = useState(defaultParentId ?? topLevel);
    const [documentType, setDocumentType] = useState("page");
    const [hiddenInMenu, setHiddenInMenu] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const parentOptions = [{ value: topLevel, label: "Top level" }, ...flattenPages(pages).map((page) => ({ value: page.id, label: page.label }))];
    const parent = parentId === topLevel ? undefined : flattenPages(pages).find((page) => page.id === parentId);
    const parentPath = parent?.path == null || parent.path === "/" ? "" : parent.path;
    const shownSlug = isSlugEdited ? slug : slugify(name);
    const completePath = `${parentPath}/${shownSlug}`;
    const isPathTaken = flattenPages(pages).some((page) => page.path === completePath);

    const nameError = isSubmitted && name.trim() === "" ? "Enter a name." : undefined;
    const slugError = isSubmitted && shownSlug === "" ? "Enter a slug." : isPathTaken ? "Another page already has this path." : undefined;

    function create() {
        setIsSubmitted(true);
        if (name.trim() === "" || shownSlug === "" || isPathTaken) {
            return;
        }
        onCreate({
            parentId: parentId === topLevel ? null : parentId,
            name: name.trim(),
            slug: shownSlug,
            path: completePath,
            documentType,
            hiddenInMenu,
        });
        onOpenChange(false);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            title="New page"
            description="The page starts unpublished, so you can fill it before it goes live."
            footer={
                <>
                    <Button variant="outlined" color="secondary" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={create}>Create page</Button>
                </>
            }
        >
            <form
                className={styles.newPageForm}
                noValidate
                onSubmit={(event) => {
                    event.preventDefault();
                    create();
                }}
            >
                <Field label="Name" required state={nameError != null ? "error" : "default"} validationMessage={nameError}>
                    <Input name="name" autoFocus value={name} onChange={(event) => setName(event.target.value)} />
                </Field>
                <Field
                    label="Slug"
                    required
                    prefix={`${parentPath}/`}
                    description={`Complete path: example.com${completePath}`}
                    state={slugError != null ? "error" : "default"}
                    validationMessage={slugError}
                >
                    <Input
                        name="slug"
                        value={shownSlug}
                        onChange={(event) => {
                            setSlug(slugify(event.target.value));
                            setIsSlugEdited(true);
                        }}
                    />
                </Field>
                <Field label="Parent page">
                    <Select name="parent" value={parentId} onChange={(value) => setParentId(value ?? topLevel)} options={parentOptions} searchable />
                </Field>
                <Field label="Document type" required>
                    <Select name="documentType" value={documentType} onChange={(value) => setDocumentType(value ?? "page")} options={documentTypes} />
                </Field>
                <Field label="Menu visibility" layout="group">
                    <Checkbox name="hiddenInMenu" checked={hiddenInMenu} onChange={setHiddenInMenu}>
                        Hide in menu
                    </Checkbox>
                </Field>
                <button type="submit" hidden />
            </form>
        </Dialog>
    );
}
