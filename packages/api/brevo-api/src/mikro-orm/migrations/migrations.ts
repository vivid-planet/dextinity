import type { MigrationObject } from "@mikro-orm/postgresql";

import { Migration20240115095733 } from "./Migration20240115095733.js";
import { Migration20240118144808 } from "./Migration20240118144808.js";
import { Migration20240123145606 } from "./Migration20240123145606.js";
import { Migration20240527112204 } from "./Migration20240527112204.js";
import { Migration20240619092554 } from "./Migration20240619092554.js";
import { Migration20240619145217 } from "./Migration20240619145217.js";
import { Migration20240621102349 } from "./Migration20240621102349.js";
import { Migration20240819214939 } from "./Migration20240819214939.js";
import { Migration20240830112400 } from "./Migration20240830112400.js";
import { Migration20241016123307 } from "./Migration20241016123307.js";
import { Migration20241018110515 } from "./Migration20241018110515.js";
import { Migration20241022144400 } from "./Migration20241022144400.js";
import { Migration20241024071748 } from "./Migration20241024071748.js";
import { Migration20241119101706 } from "./Migration20241119101706.js";
import { Migration20250221073825 } from "./Migration20250221073825.js";
import { Migration20250317131301 } from "./Migration20250317131301.js";
import { Migration20250321132034 } from "./Migration20250321132034.js";
import { Migration20250703155205 } from "./Migration20250703155205.js";

export const migrationsList: MigrationObject[] = [
    { name: "Migration20240115095733", class: Migration20240115095733 },
    { name: "Migration20240118144808", class: Migration20240118144808 },
    { name: "Migration20240123145606", class: Migration20240123145606 },
    { name: "Migration20240527112204", class: Migration20240527112204 },
    { name: "Migration20240619092554", class: Migration20240619092554 },
    { name: "Migration20240619145217", class: Migration20240619145217 },
    { name: "Migration20240621102349", class: Migration20240621102349 },
    { name: "Migration20240819214939", class: Migration20240819214939 },
    { name: "Migration20240830112400", class: Migration20240830112400 },
    { name: "Migration20241016123307", class: Migration20241016123307 },
    { name: "Migration20241018110515", class: Migration20241018110515 },
    { name: "Migration20241119101706", class: Migration20241119101706 },
    { name: "Migration20241022144400", class: Migration20241022144400 },
    { name: "Migration20241024071748", class: Migration20241024071748 },
    { name: "Migration20250221073825", class: Migration20250221073825 },
    { name: "Migration20250321132034", class: Migration20250321132034 },
    { name: "Migration20250317131301", class: Migration20250317131301 },
    { name: "Migration20250703155205", class: Migration20250703155205 },
];
