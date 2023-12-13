import {
    CharacterToken,
    StartTagToken,
    Token,
    TokenType,
    NodeType,
    Program,
    Node,
} from "types";
import { Tokenizer } from "./tokenizer";
import { ExpressionNode, TagNode, TextNode } from "./nodes";

export enum ParseMode {
    Init = "Init",
    InScript = "InScript",
    InExpression = "InExpression",
    InComponent = "InComponent",
    Text = "Text",
    AfterComponent = "AfterComponent",
}

export class Parser {
    ast: Program;
    mode: ParseMode;
    tokenizer: Tokenizer;
    stack: Node[];
    reprocess: boolean;
    current_text: TextNode | null;
    current_raw_expression: string;
    constructor(text: string) {
        this.tokenizer = new Tokenizer(text);
        this.mode = ParseMode.Init;
        this.stack = [];
        this.current_text = null;
        this.current_raw_expression = "";
        this.reprocess = false;
        this.ast = {
            code: "",
        };
    }

    get current_node() {
        if (this.stack.length) return this.stack[this.stack.length - 1];
    }

    appendToParent(node: Node) {
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
                    }
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
                    const node = new TagNode(
                        current_token.name,
                        current_token.attributes,
                    );

                    if (current_token.self_closing) {
                        this.appendToParent(node);
                    } else {
                        this.stack.push(node);
                    }
                } else if (token.type === TokenType.EndTag) {
                    if (
                        this.current_node?.type === NodeType.Tag &&
                        this.current_node?.name !== token.name
                    ) {
                        // TODO: throw end tag does not match start tag error
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
