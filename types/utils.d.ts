/*  =========================
    BOOLEANS
    ========================= */

type BooleanString = "true" | "false";

/*  =========================
    ENVIRONMENTAL VARIABLES
    ========================= */

interface EnvSchema {
    name: string;
    type: "string" | "number" | "boolean";
}

type EnvMap<T extends ReadonlyArray<EnvSchema>> = {
    [S in T[number] as S["name"]]:
        S["type"] extends "string" ? string
        : S["type"] extends "number" ? number
        : S["type"] extends "boolean" ? boolean
        : undefined
    ;
};
