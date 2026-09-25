import { describe, expect, it } from "vitest";

import type { BlockDependency } from "../../blocks/types";
import { damFilesFromDependencies } from "./damFileDependencies";

const damFileDependency = (damFile: unknown): BlockDependency => ({ targetGraphqlObjectType: "DamFile", id: "file-1", data: { damFile } });

describe("damFilesFromDependencies", () => {
    it("ignores dependencies that aren't DAM files", () => {
        expect(damFilesFromDependencies([{ targetGraphqlObjectType: "PageTreeNode", id: "page-1" }])).toEqual([]);
    });

    it("extracts a file that is referenced by its id only", () => {
        expect(damFilesFromDependencies([{ targetGraphqlObjectType: "DamFile", id: "file-1" }])).toEqual([
            { id: "file-1", scope: undefined, imageCropArea: undefined },
        ]);
    });

    it("extracts the id and the scope", () => {
        expect(damFilesFromDependencies([damFileDependency({ id: "file-1", scope: { domain: "main" } })])).toEqual([
            { id: "file-1", scope: { domain: "main" }, imageCropArea: undefined },
        ]);
    });

    it("drops the __typename of a crop area that originates from a GraphQL result", () => {
        const damFile = {
            id: "file-1",
            image: { cropArea: { __typename: "ImageCropArea", focalPoint: "SMART", width: null, height: null, x: null, y: null } },
        };

        expect(damFilesFromDependencies([damFileDependency(damFile)])[0].imageCropArea).toEqual({
            focalPoint: "SMART",
            width: null,
            height: null,
            x: null,
            y: null,
        });
    });
});
