---
"@comet/api-generator": patch
---

Generate the filter DTO of an enum next to the enum when the entity imports the enum with a path alias

The generator writes the filter DTO of an enum next to the file of the enum, and it found this file from the import path of the enum.
With a path alias, for instance `import { Status } from "@src/common/enums/status.enum"`, it wrote the filter DTO to a wrong `generated/@src/common/enums/generated` directory, and the import of the enum in the filter DTO failed.
