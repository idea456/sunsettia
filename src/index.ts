import { Tokenizer } from "./tokenizer";
import fs from "fs";

function main() {
    const text = fs.readFileSync("index.html", "utf-8");
    console.log("running");
    const tokenizer = new Tokenizer(text);
    tokenizer.run();
    console.log(tokenizer.tokens);
}

main();
