export enum TokenType {
    StartTag = "StartTag",
    EndTag = "EndTag",
    ScriptTag = "ScriptTag",
    Comment = "Comment",
    Character = "Character",
    EOF = "EOF",
}

export interface Token {
    name: string;
    type: TokenType;
    literal?: string;
    line: number;
}

export type Attribute = {
    name: string;
    value?: string;
    is_expression: boolean;
    is_self_closing: boolean;
};

export type Expression = string;

// https://html.spec.whatwg.org/
export class StartTagToken implements Token {
    // Start and end tag tokens have a tag name, a self-closing flag, and a list of attributes, each of which has a name and a value.
    constructor(
        public name: string,
        public type: TokenType.StartTag | TokenType.EndTag,
        public self_closing: boolean,
        public attributes: Attribute[],
        public line: number,
        public is_component: boolean,
    ) {}
}

export class EndTagToken implements Token {
    type = TokenType.EndTag;

    constructor(public name: string, public line: number) {}
}

export class EOFToken implements Token {
    name = "EOF";
    type = TokenType.EOF;
    literal = "#";

    constructor(public line: number) {}
}

export class CharacterToken implements Token {
    name = "Character";
    type = TokenType.Character;

    constructor(public literal: string, public line: number) {}
}
