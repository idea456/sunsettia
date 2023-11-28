import { State } from "./state";
import { Attribute, Expression, Tag, Token, TokenType } from "./token";

export class Tokenizer {
    text: string;
    current: number;
    state: State;
    tokens: Token[];
    currentToken: Token | null;
    current_attribute: Attribute | null;
    current_value: Expression | string | null;
    should_reconsume: boolean;

    constructor(text: string) {
        this.text = text;
        this.current = 0;
        this.state = State.Data;
        this.tokens = [];
    }

    private isEnd() {
        return this.current >= this.text.length;
    }

    private isAsciiAlpha(c: string) {
        return (c >= "A" && c <= "Z") || (c >= "a" && c <= "z");
    }

    private isWhitespace(c: string) {
        return [" ", "\t", "\f"].includes(c);
    }

    private peek() {
        return this.text[this.current];
    }

    private next() {
        let current_c = this.peek();
        this.current += 1;
        return current_c;
    }

    private consume() {
        if (this.should_reconsume) {
            this.should_reconsume = false;
            return this.peek();
        }
        return this.next();
    }

    private matches(chars: string) {
        if (this.current + chars.length >= this.text.length) return false;
        for (let i = this.current; i < this.current + chars.length; i++) {
            if (this.text[i] !== chars[i - this.current]) return false;
        }
        return true;
    }

    private switch(state: State) {
        this.state = state;
        this.run();
    }

    private emitToken() {
        if (this.currentToken) this.tokens.push(this.currentToken);
        this.currentToken = null;
    }

    run() {
        let current_char;
        switch (this.state) {
            case State.Data:
                current_char = this.consume();
                console.log("[Data]", current_char);
                if (current_char === "<") {
                    this.switch(State.TagOpen);
                }
                break;
            case State.TagOpen:
                current_char = this.consume();
                console.log("[TagOpen]", current_char);
                if (current_char === "/") {
                    this.switch(State.EndTagOpen);
                } else if (this.isAsciiAlpha(current_char)) {
                    this.currentToken = new Tag(
                        current_char,
                        TokenType.StartTag,
                        false,
                        [],
                    );
                    // this.should_reconsume = true;
                    this.switch(State.TagName);
                }
                break;
            case State.EndTagOpen:
                console.log("[EndTagOpen]", current_char);

            case State.TagName:
                current_char = this.consume();
                console.log("[TagName]", current_char);
                if (this.isWhitespace(current_char)) {
                    this.should_reconsume = true;
                    this.switch(State.BeforeAttributeName);
                } else if (current_char === "/") {
                    this.switch(State.SelfClosingStartTag);
                } else if (current_char === ">") {
                    this.switch(State.Data);
                    this.emitToken();
                } else if (this.isAsciiAlpha(current_char)) {
                    if (this.currentToken)
                        this.currentToken.name += current_char;
                    this.switch(State.TagName);
                }
                break;
            case State.BeforeAttributeName:
                current_char = this.consume();
                console.log("[BeforeAttributeName]", current_char);

                if (this.isWhitespace(current_char))
                    this.switch(State.BeforeAttributeName);

                if (current_char === "=") {
                    // TODO: Throw error unexpected-equals-sign-before-attribute-name error
                }

                this.current_attribute = {
                    name: "",
                    value: "",
                };
                // this.should_reconsume = true;
                this.switch(State.AttributeName);

            case State.AttributeName:
                current_char = this.consume();
                console.log("[AttributeName]", current_char);
                if (
                    this.isWhitespace(current_char) ||
                    current_char === "/" ||
                    current_char === ">"
                ) {
                    this.should_reconsume = true;
                    this.switch(State.AfterAttributeName);
                }

                if (current_char === "=") {
                    this.switch(State.BeforeAttributeValue);
                } else if (this.isAsciiAlpha(current_char)) {
                    if (this.current_attribute)
                        this.current_attribute.name += current_char;
                    this.switch(State.AttributeName);
                }
            case State.AfterAttributeName:
                console.log(
                    "[AfterAttributeName]",
                    current_char,
                    this.current_attribute,
                );
                break;
            case State.BeforeAttributeValue:
                current_char = this.consume();
                if (this.isWhitespace(current_char)) {
                    // TODO: throw error
                    // <component name=   />
                }

                if (current_char === '"' || current_char === "'") {
                    // <component name="test" />
                    this.switch(State.AttributeValueQuoted);
                } else if (current_char === "{") {
                    // <component name={x} />
                    this.switch(State.AttributeExpression);
                }
                // TODO: throw new error
                // <component name=asdasd />
                break;
            case State.AttributeValueQuoted:
                current_char = this.consume();
                if (this.isAsciiAlpha(current_char)) {
                    if (!this.current_value) {
                        this.current_value = "";
                    }
                    this.current_value += current_char;
                    this.switch(State.AttributeValueQuoted);
                } else if (current_char === '"' || current_char === "'") {
                    this.switch(State.AfterAttributeValueQuoted);
                }
                break;
            case State.AfterAttributeValueQuoted:
                console.log("[AfterAttributeValueQuoted]", this.current_value);
                current_char = this.consume();
                if (current_char === ">") {
                    console.log("here", this.current_value);
                    if (this.current_attribute) {
                        this.current_attribute.value = this.current_value;
                        this.current_value = null;
                        this.currentToken.attributes = this.current_attribute;
                    }
                    this.emitToken();
                    this.switch(State.Data);
                } else if (current_char === "/") {
                    this.switch(State.SelfClosingStartTag);
                } else if (this.isWhitespace(current_char)) {
                    if (this.current_attribute && this.current_value) {
                        console.log();
                        // this.current_attribute.value = this.current_value;
                        // this.current_value = null;
                        // if (this.currentToken)
                        //     this.currentToken.attributes.push(
                        //         this.current_attribute,
                        //     );
                        // this.current_attribute = null;
                    }
                    this.switch(State.BeforeAttributeName);
                }
                break;
        }
    }
}
