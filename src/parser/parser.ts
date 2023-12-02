import { once } from "events";
import { StartTagToken, Token, TokenType } from "./token";
import { TokenStream, Tokenizer } from "./tokenizer";
import { Component, Node, TextNode } from "./nodes";

export enum ParseMode {
    Init = "Init",
    InComponent = "InComponent",
    Text = "Text",
    AfterComponent = "AfterComponent",
}

export class Parser {
    ast?: Node;
    mode: ParseMode;
    tokenizer: Tokenizer;
    stack: Node[];
    reprocess: boolean;
    current_text: TextNode | null;

    constructor(text: string) {
        this.tokenizer = new Tokenizer(text);
        this.mode = ParseMode.Init;
        this.stack = [];
        this.current_text = null;
        this.reprocess = false;
    }

    get current_node() {
        if (this.stack.length) return this.stack[this.stack.length - 1];
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
                console.log("i have token", token);
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
        console.log("Tree building finished!");
        console.log(this.ast);
    }

    process(token: Token) {
        switch (this.mode) {
            case ParseMode.Init:
                if (token.type === TokenType.StartTag) {
                    const current_token = token as StartTagToken;
                    if (token.name === "component") {
                        // initialize the component docoument
                        this.stack.push({
                            name: current_token.name,
                            type: current_token.type,
                            attributes: current_token.attributes,
                            children: [],
                        });
                        this.ast = this.current_node;
                        this.switchMode(ParseMode.InComponent);
                    }
                }
                break;
            case ParseMode.InComponent:
                if (token.type === TokenType.Character) {
                    if (!this.current_text)
                        this.current_text = {
                            value: "",
                            type: token.type,
                        };
                    this.current_text.value += token.literal;
                } else if (token.type === TokenType.StartTag) {
                    const current_token = token as StartTagToken;
                    if (this.current_text) {
                        this.current_node?.children.push(this.current_text);
                        this.current_text = null;
                    }
                    const node: Node = {
                        name: current_token.name,
                        type: current_token.type,
                        children: [],
                        attributes: current_token.attributes,
                    };

                    this.stack.push(node);
                } else if (token.type === TokenType.EndTag) {
                    if (this.current_node?.name !== token.name) {
                        // TODO: throw end tag does not match start tag error
                    }

                    const node = this.stack.pop();
                    if (this.current_node)
                        this.current_node.children.push(node);
                }
                break;
        }
    }
}
