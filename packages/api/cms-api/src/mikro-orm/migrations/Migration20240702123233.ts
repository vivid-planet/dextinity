import { Migration } from "@mikro-orm/migrations";
import mimedb from "mime-db";

const getValidExtensionsForMimetype = (mimetype: string) => {
    let supportedExtensions: readonly string[] | undefined;
    if (mimetype === "application/x-zip-compressed") {
        // zip files in Windows, not supported by mime-db
        // see https://github.com/jshttp/mime-db/issues/245
        supportedExtensions = ["zip"];
    } else {
        supportedExtensions = mimedb[mimetype]?.extensions;
    }

    return supportedExtensions;
};

export class Migration20240702123233 extends Migration {
    async up(): Promise<void> {
        // This migration adds a valid file extension to every DamFile#name that doesn't have an extension yet

        // Get all mimetypes in use
        const mimetypes = (await this.execute('select distinct "DamFile".mimetype from "DamFile"')) as Array<{ mimetype: string }>;

        // Create a mapping of mimetypes to their valid extensions
        const mimetypeToExtensionsMap: { [key: string]: string[] } = mimetypes.reduce((prev, m) => {
            const mimetype = m.mimetype;
            const extensions = getValidExtensionsForMimetype(mimetype);

            if (extensions === undefined || extensions.length === 0) {
                throw new Error(
                    `No valid extensions found for mimetype ${mimetype}. This type is not allowed in the DAM and files of this type should be removed.`,
                );
            }

            return { ...prev, [mimetype]: extensions };
        }, {});

        // Generate an input string for jsonb_build_object that maps mimetypes to their first valid extension
        const sqlMimetypeToSingleExtensionMap = Object.entries(mimetypeToExtensionsMap)
            .map(([mimetype, extensions]) => `'${mimetype}', '${extensions[0]}'`)
            .join(", ");

        // Generate SQL clauses to check if the name doesn't end with a valid extension for each mimetype
        const sqlCaseClauses = Object.entries(mimetypeToExtensionsMap)
            .map(([mimetype, extensions]) => {
                const conditions = extensions.map((ext) => `name NOT LIKE '%.${ext}'`).join(" AND ");
                return `(mimetype = '${mimetype}' AND (${conditions}))`;
            })
            .join(" OR ");

        if (sqlCaseClauses.length > 0) {
            this.addSql(`
              WITH mimetype_extension_map AS (
                  SELECT jsonb_build_object(${sqlMimetypeToSingleExtensionMap}) AS map
              )
        
              UPDATE "DamFile"
              SET "name" = CONCAT("name", '.', mimetype_extension_map.map ->> "DamFile".mimetype)
              FROM mimetype_extension_map
              WHERE ${sqlCaseClauses};
            `);
        }
    }
}
