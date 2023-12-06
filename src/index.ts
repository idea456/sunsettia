import { Generator } from "./generator";
import analyse from "./generator/analyse";
import { Parser } from "./parser";
import fs from "fs";

async function main() {
    const text = fs.readFileSync("./src/index.sun", "utf-8");
    const parser = new Parser(text);
    await parser.parse();

    // console.log("code is hereeeee", parser.tokenizer.code.trim());
    if (parser.ast && parser.ast.component) {
        const generator = new Generator(parser.ast);
        generator.analyse();
        generator.generate(parser.ast.component).join("\n");
        console.log("FINAL", generator.code);

        fs.writeFileSync(
            "./app.js",
            `export default function() {\n${generator.code.join("\n")}\n}`,
        );
    }
}

main();
