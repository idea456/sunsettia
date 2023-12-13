import { GeneratingVisitor, Generator } from "./generator";
import analyse, { analyseDependencies, link } from "./generator/analyse";
import { Parser } from "./parser";
import fs from "fs";
import util from "util";

async function main() {
    const text = fs.readFileSync("./src/index.sun", "utf-8");
    const parser = new Parser(text);
    await parser.parse();
    // console.log(
    //     "The tree -------------------------------------------------",
    //     util.inspect(
    //         link(parser.ast.component),
    //         false,
    //         null,
    //         true /* enable colors */,
    //     ),
    // );

    const traverse = (node, i) => {
        console.log(
            `${"  ".repeat(i)}${node?.name || node?.value} : [child: ${
                node?.child?.name || node?.child?.value
            }, sibling: ${
                node?.sibling?.name || node?.sibling?.value
            }, return: ${node?.return?.name || node?.return?.value}]`,
        );

        if (node?.children?.length) {
            node.children.forEach((n) => {
                traverse(n, i + 1);
            });
        }
    };

    traverse(link(parser.ast.component), 0);

    // console.log("code is hereeeee", parser.tokenizer.code.trim());
    const generator = new GeneratingVisitor();
    console.log(generator.generate(parser.ast));
    // if (parser.ast && parser.ast.component) {
    //     const generator = new Generator(parser.ast);
    //     // generator.analyse();
    //     generator.generate(parser.ast.component).join("\n");
    //     // console.log("FINAL", generator.code);
    //     //cconsole.log(parser.ast.component);
    //     // const pulpTree = generator.construct();
    //     // const analysis = generator.analyse();
    //     console.log(
    //         "The tree -------------------------------------------------",
    //         util.inspect(
    //             parser.ast.component,
    //             false,
    //             null,
    //             true /* enable colors */,
    //         ),
    //     );
    //     console.log(generator.code);
    //     console.log("done");

    fs.writeFileSync(
        "./app.js",
        `export default function() {\n${generator.code.join("\n")}\n}`,
    );
    // }
}

main();
