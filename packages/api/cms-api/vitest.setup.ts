import "reflect-metadata";

import { registerEnumType } from "@nestjs/graphql";
import { CombinedPermission } from "./src/user-permissions/user-permissions.types.js";

registerEnumType(CombinedPermission, { name: "Permission" });
