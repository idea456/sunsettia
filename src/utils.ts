import { BaseError, BaseErrorType } from "./error";
import fs from "fs";

export function getConfigFile() {
    let config;
    if (fs.existsSync("./sunsettia.config.js")) {
        config = eval(fs.readFileSync("./sunsettia.config.js", "utf-8"));

        if (!config?.entry) {
            throw new BaseError(BaseErrorType.NoEntrySpecifiedError);
        }
    } else {
        throw new BaseError(BaseErrorType.NoConfigFileError);
    }
    return config;
}
