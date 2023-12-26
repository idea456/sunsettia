// import fs from "fs";
import { BaseError, BaseErrorType } from "./error";
import { Parser } from "./parser";
import { GeneratingVisitor } from "./generator";
// import { getConfigFile } from "./utils";

class Sunsettia {
    // static async compile() {
    //     let config = getConfigFile();
    //     let entryPath = config?.entry;
    //     if (!entryPath)
    //         throw new BaseError(BaseErrorType.NoEntrySpecifiedError);

    //     const text = fs.readFileSync(entryPath, "utf-8");
    //     const parser = new Parser(text);
    //     await parser.parse();

    //     const generator = new GeneratingVisitor();
    //     generator.generate(parser.ast);

    //     fs.writeFileSync(
    //         config?.outDir || "./app.js",
    //         `export default function() {\n${generator.code.join("\n")}\n}`,
    //     );
    // }

    static async compileRaw(text: string) {
        const parser = new Parser(text);
        await parser.parse();

        const generator = new GeneratingVisitor();
        generator.generate(parser.ast);

        return `export default function() {\n${generator.code.join("\n")}\n}`;
    }
}

export default Sunsettia;
