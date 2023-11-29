import { State } from "./state";
import {
    Attribute,
    CharacterToken,
    EOFToken,
    EndTagToken,
    Expression,
    StartTagToken,
    Token,
    TokenType,
} from "./token";

const EOF = "#";
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
        this.text = text + "#";
        this.current = 0;
        this.state = State.Data;
        this.tokens = [];
        this.should_reconsume = true;
    }

    private isEnd() {
        return this.current >= this.text.length;
    }

    private isAsciiAlpha(c: string) {
        return (
            (c >= "A" && c <= "Z") ||
            (c >= "a" && c <= "z") ||
            (c >= "0" && c <= "9") ||
            ["_", "-"].includes(c)
        );
    }

    private isWhitespace(c: string) {
        return [" ", "\t", "\f", "\n"].includes(c);
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
        // When a state says to reconsume a matched character in a specified state, that means to switch to that state,
        // but when it attempts to consume the next input character, provide it with the current input character instead.
        if (this.should_reconsume) {
            this.should_reconsume = false;
            return this.peek();
        }
        // return this.next();
        this.current += 1;
        return this.text[this.current];
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
        console.log("Token emitted", this.currentToken);
        if (this.currentToken) this.tokens.push(this.currentToken);
        this.currentToken = null;
    }

    private emitAttribute() {
        if (
            this.currentToken instanceof StartTagToken &&
            this.current_attribute
        ) {
            if (this.current_attribute.value) {
                this.current_attribute.value = this.current_value;
                this.current_value = null;
            }
            this.currentToken.attributes.push(this.current_attribute);
            this.current_attribute = null;
        }
    }

    run() {
        let current_char;
        console.log(`[${this.state}]`, this.peek());
        switch (this.state) {
            case State.Data:
                current_char = this.consume();
                if (current_char === "<") {
                    this.switch(State.TagOpen);
                } else if (current_char === EOF) {
                    this.currentToken = new EOFToken();
                    this.emitToken();
                    return;
                } else {
                    if (!["\t", "\n"].includes(current_char)) {
                        this.currentToken = new CharacterToken(current_char);
                        this.emitToken();
                    }
                    this.switch(State.Data);
                }
                break;
            case State.TagOpen:
                current_char = this.consume();
                if (current_char === "/") {
                    this.switch(State.EndTagOpen);
                } else if (this.isAsciiAlpha(current_char)) {
                    this.currentToken = new StartTagToken(
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
                current_char = this.consume();
                if (this.isAsciiAlpha(current_char)) {
                    this.currentToken = new EndTagToken(current_char);
                    this.switch(State.TagName);
                }
                break;

            case State.TagName:
                current_char = this.consume();
                if (this.isWhitespace(current_char)) {
                    // this.should_reconsume = true;
                    this.switch(State.BeforeAttributeName);
                } else if (current_char === "/") {
                    this.switch(State.SelfClosingStartTag);
                } else if (current_char === ">") {
                    this.emitToken();
                    this.switch(State.Data);
                } else if (this.isAsciiAlpha(current_char)) {
                    if (this.currentToken)
                        this.currentToken.name += current_char;
                    this.switch(State.TagName);
                }
                break;
            case State.BeforeAttributeName:
                current_char = this.consume();

                if (this.isWhitespace(current_char))
                    // ignore whitespaces
                    this.switch(State.BeforeAttributeName);
                else if (current_char === "=") {
                    // TODO: Throw error unexpected-equals-sign-before-attribute-name error
                } else if (current_char === ">" || current_char === "/") {
                    this.should_reconsume = true;
                    this.switch(State.AfterAttributeName);
                }

                this.current_attribute = {
                    name: current_char,
                    value: "",
                };
                // this.should_reconsume = true;
                this.switch(State.AttributeName);
                break;

            case State.AttributeName:
                current_char = this.consume();
                if (
                    current_char === ">" ||
                    this.isWhitespace(current_char) ||
                    current_char === "/"
                ) {
                    this.should_reconsume = true;
                    this.switch(State.AfterAttributeName);
                } else if (current_char === "=") {
                    this.switch(State.BeforeAttributeValue);
                } else if (this.isAsciiAlpha(current_char)) {
                    if (this.current_attribute)
                        this.current_attribute.name += current_char;
                    this.switch(State.AttributeName);
                }
                break;
            case State.AfterAttributeName:
                current_char = this.consume();

                if (current_char === ">") {
                    this.emitAttribute();
                    this.emitToken();
                    this.switch(State.Data);
                }
                break;
            case State.BeforeAttributeValue:
                current_char = this.consume();
                if (this.isWhitespace(current_char)) {
                    // TODO: throw error
                    // <component name=   />
                } else if (current_char === '"' || current_char === "'") {
                    // <component name="test" />
                    this.switch(State.AttributeValueQuoted);
                } else if (current_char === "{") {
                    // <component name={x} />
                    this.switch(State.AttributeValueExpression);
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
                current_char = this.consume();
                if (current_char === ">") {
                    if (this.current_attribute) {
                        this.emitAttribute();
                    }
                    this.emitToken();
                    this.switch(State.Data);
                } else if (current_char === "/") {
                    this.switch(State.SelfClosingStartTag);
                } else if (this.isWhitespace(current_char)) {
                    if (this.current_attribute && this.current_value) {
                        this.current_attribute.value = this.current_value;
                        this.current_value = null;
                        if (this.currentToken)
                            this.currentToken.attributes.push(
                                this.current_attribute,
                            );
                        this.current_attribute = null;
                    }

                    this.should_reconsume = true;
                    this.switch(State.BeforeAttributeName);
                }
                break;

            case State.AttributeValueExpression:
                current_char = this.consume();
                if (current_char === "}") {
                    this.switch(State.AfterAttributeValueExpression);
                } else if (current_char === "EOF") {
                    // throw error, expect } after expression
                } else {
                    if (!this.current_value) {
                        this.current_value = "";
                    }
                    this.current_value += current_char;
                    this.switch(State.AttributeValueExpression);
                }
                break;
            case State.AfterAttributeValueExpression:
                current_char = this.consume();
                if (current_char === ">") {
                    if (this.current_attribute) {
                        this.current_attribute.value = this.current_value;
                        this.current_value = null;
                        this.currentToken.attributes.push(
                            this.current_attribute,
                        );
                    }
                    this.emitToken();
                    this.switch(State.Data);
                } else if (current_char === "/") {
                    this.switch(State.SelfClosingStartTag);
                } else if (this.isWhitespace(current_char)) {
                    if (this.current_attribute && this.current_value) {
                        this.current_attribute.value = this.current_value;
                        this.current_attribute.is_expression = true;
                        this.current_value = null;
                        if (this.currentToken)
                            this.currentToken.attributes.push(
                                this.current_attribute,
                            );
                        this.current_attribute = null;
                    }

                    this.should_reconsume = true;
                    this.switch(State.BeforeAttributeName);
                }
                break;
                break;
        }
    }
}
