import { Attribute, TokenType } from "./token";

export type Component = {
    body: Node[];
};

export interface Node {
    name: string;
    type: TokenType;
    children: (Node | TextNode)[];
    attributes: Attribute[];
}

export interface TextNode {
    type: TokenType.Character;
    value: string;
}
