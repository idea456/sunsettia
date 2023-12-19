import {
    CharacterToken,
    StartTagToken,
    Token,
    TokenType,
    NodeType,
    Program,
    Node,
    VisitableNode,
} from "types";
import { Tokenizer } from "./tokenizer";
import { ExpressionNode, TagNode, TextNode } from "./nodes";
import { ParseError, ParseErrorType } from "../error/error";
import { readFileSync } from "fs";
import { ImportDeclaration } from "acorn";
import { analyseImports } from "../generator/analyse";
import path from "path";

import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

enum ParseMode {
    Init = "Init",
    InScript = "InScript",
    InExpression = "InExpression",
    InComponent = "InComponent",
    Text = "Text",
    AfterComponent = "AfterComponent",
}

export class Parser {
    ast: Program;
    mode: ParseMode = ParseMode.Init;
    tokenizer: Tokenizer;
    stack: Node[] = [];
    reprocess: boolean = false;
    current_text: TextNode | null = null;
    current_raw_expression: string = "";
    imports: ImportDeclaration[] = [];
    // TODO: replce this in config file
    current_dirname: string = "./src/__tests__/app/src/index.sun";

    constructor(text: string, dirname?: string) {
        this.tokenizer = new Tokenizer(text);
        this.ast = {
            code: "",
        };
        if (dirname) this.current_dirname = dirname;
    }

    get current_node() {
        if (this.stack.length) return this.stack[this.stack.length - 1];
    }

    appendToParent(node: VisitableNode) {
        if (this.current_node && this.current_node.type === NodeType.Tag) {
            this.current_node.children.push(node);
        }
    }

    async wait() {
        new Promise((resolve) => {
            this.tokenizer.emitter.on("done", resolve);
        });
    }

    switchMode(mode: ParseMode) {
        console.log(`Switching parsing mode to ${mode}`);
        this.mode = mode;
    }

    async parse() {
        this.tokenizer.emitter.on("data", (data) => {
            const token = data as Token;
            if (token) {
                // if (token.type === TokenType.StartTag) {
                //     this.stack.push();
                // }

                if (token.type === TokenType.EOF) {
                    this.tokenizer.emitter.emit("done");
                } else {
                    this.process(token);
                }
            }
        });
        this.tokenizer.run();
        await this.wait();
    }

    process(token: Token) {
        switch (this.mode) {
            case ParseMode.Init:
                if (token.type === TokenType.StartTag) {
                    const current_token = token as StartTagToken;
                    if (token.name === "component") {
                        // initialize the component docoument
                        const component_name = current_token.attributes.find(
                            (attr) => attr.name === "name",
                        );
                        if (!component_name)
                            throw new ParseError(
                                ParseErrorType.NoComponentNameError,
                                current_token,
                            );
                        this.stack.push(
                            new TagNode("component", current_token.attributes),
                        );
                        this.ast.component = this.current_node;
                        this.switchMode(ParseMode.InComponent);
                    } else if (token.name === "script") {
                        this.switchMode(ParseMode.InScript);
                    }
                }
                break;
            case ParseMode.InScript:
                if (token.type === TokenType.Character) {
                    this.ast.code += (token as CharacterToken).literal;
                } else if (token.type === TokenType.EndTag) {
                    if (token.name !== "script") {
                        // TODO: raise error expect closing script tag
                        throw new ParseError(
                            ParseErrorType.UnmatchedTagError,
                            token,
                        );
                    }
                    this.imports = analyseImports(this.ast.code);
                    this.switchMode(ParseMode.Init);
                }
                break;
            case ParseMode.InExpression:
                if (token.literal === "}") {
                    const node = new ExpressionNode(
                        this.current_raw_expression,
                    );

                    this.appendToParent(node);
                    this.current_raw_expression = "";
                    this.switchMode(ParseMode.InComponent);
                } else {
                    this.current_raw_expression += token.literal;
                }
                break;
            case ParseMode.InComponent:
                if (token.type === TokenType.Character) {
                    if (!this.current_text)
                        this.current_text = new TextNode("");
                    if (token.literal === "}") {
                        if (this.current_raw_expression) {
                            const node = new ExpressionNode(
                                this.current_raw_expression,
                            );
                            this.appendToParent(node);
                            this.current_raw_expression = "";
                        }
                    } else {
                        if (token.literal === "{") {
                            this.current_raw_expression = "";
                            if (this.current_text?.value) {
                                this.appendToParent(this.current_text);
                                this.current_text = null;
                            }
                            this.switchMode(ParseMode.InExpression);
                        } else {
                            this.current_text.value += token.literal;
                        }
                    }
                } else if (token.type === TokenType.StartTag) {
                    const current_token = token as StartTagToken;
                    if (this.current_text?.value) {
                        this.appendToParent(this.current_text);
                        this.current_text = null;
                    }
                    let node;
                    if (current_token.is_component) {
                        const importNode = this.imports.filter(
                            (importNode) =>
                                importNode.specifiers[0].local.name ===
                                current_token.name,
                        )[0];
                        if (importNode) {
                            const absolutePathToComponent = path.resolve(
                                path.dirname(this.current_dirname),
                                importNode.source.value,
                            );

                            const text = readFileSync(
                                absolutePathToComponent,
                                "utf-8",
                            );

                            const parser = new Parser(
                                text,
                                absolutePathToComponent,
                            );
                            parser.parse();
                            console.log("WTFFF", parser.ast);
                            parser.ast.component?.children?.forEach((child) => {
                                this.appendToParent(child);
                            });
                        } else {
                            // TODO: Throw component not found, did you mean ...
                        }
                    } else {
                        node = new TagNode(
                            current_token.name,
                            current_token.attributes,
                        );
                        if (current_token.self_closing) {
                            this.appendToParent(node);
                        } else {
                            this.stack.push(node);
                        }
                    }
                } else if (token.type === TokenType.EndTag) {
                    if (
                        this.current_node?.type === NodeType.Tag &&
                        this.current_node?.name !== token.name
                    ) {
                        document.createElement;
                        // TODO: throw end tag does not match start tag error
                        throw new ParseError(
                            ParseErrorType.UnmatchedTagError,
                            token,
                        );
                    }
                    if (this.current_text?.value) {
                        this.appendToParent(this.current_text);
                        this.current_text = null;
                    }

                    const node = this.stack.pop();
                    if (node && this.current_node) this.appendToParent(node);
                }
                break;
        }
    }
}
