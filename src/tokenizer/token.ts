export enum TokenType {
    StartTag,
    EndTag,
    Comment,
    Character,
    Component,
    EOF,
}

export interface Token {
    name: string;
    type: TokenType;
}

export type Attribute = {
    name: string;
    value: string | Expression;
};

export type Expression = string;

// https://html.spec.whatwg.org/
export class Tag implements Token {
    // Start and end tag tokens have a tag name, a self-closing flag, and a list of attributes, each of which has a name and a value.
    constructor(
        public name: string,
        public type:
            | TokenType.StartTag
            | TokenType.EndTag
            | TokenType.Component,
        public self_closing: boolean,
        public attributes: Attribute[],
    ) {}
}
