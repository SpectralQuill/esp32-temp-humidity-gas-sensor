import { BooleanUtils } from "./BooleanUtils";
import { NumberUtils } from "./NumberUtils";

const rawEnvMap = import.meta.env;

export class EnvUtils {

    public static ensureEnv<T extends ReadonlyArray<EnvSchema>>(
        envSchemaArray: T
    ): EnvMap<T> {

        type EnvMapValue = EnvMap<T>[keyof EnvMap<T>];

        const envMap = {} as EnvMap<T>;
        for (let envSchema of envSchemaArray) {

            const name = envSchema.name as keyof EnvMap<T>;
            const envValue = rawEnvMap[name];
            switch (envSchema.type) {
                case "number":
                    if (!NumberUtils.isNumber(envValue))
                        throw new Error(
                            `Environmental variable ${String(name)} must be a number`
                        );
                    envMap[name] = Number(envValue) as EnvMapValue;
                    break;
                case "string":
                    if (!envValue)
                        throw new Error(
                            `Environmental variable ${String(name)} must be given`
                        );
                    envMap[name] = envValue;
                    break;
                case "boolean":
                    if (!BooleanUtils.isBooleanString(envValue))
                        throw new Error(
                            `Environmental variable ${String(name)} must be a boolean`
                        );
                    envMap[name] = BooleanUtils.convertToBoolean(
                        envValue
                    ) as EnvMapValue;
                    break;
            }
    
        }

        return envMap;

    }

}
