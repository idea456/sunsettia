import { Tokenizer, Parser } from "./parser";
import fs from "fs";

async function main() {
    const text = fs.readFileSync("index.html", "utf-8");
    const parser = new Parser(text);
    await parser.parse();
}

main();
