import { Generator } from "./generator";
import { Tokenizer, Parser } from "./parser";
import acorn from "acorn";
import util from "util";
import fs from "fs";

async function main() {
    const text = fs.readFileSync("./src/index.sun", "utf-8");
    const parser = new Parser(text);
    await parser.parse();

    console.log(
        util.inspect(
            acorn.parse(parser.ast?.code, {
                ecmaVersion: "latest",
                sourceType: "module",
            }),
            false,
            null,
            true /* enable colors */,
        ),
    );

    // console.log("code is hereeeee", parser.tokenizer.code.trim());
    // const generator = new Generator(parser.ast);
    // const code = generator.generate(parser.ast).join("\n");

    // fs.writeFileSync("./app.js", `export default function() {\n${code}\n}`);
}

main();
