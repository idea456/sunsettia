import { Tokenizer } from "./parser";
import fs from "fs";

function main() {
    const text = fs.readFileSync("index.html", "utf-8");
    const tokenizer = new Tokenizer(text);
    tokenizer.run();
    console.log("Tokenizer results");
}

main();
