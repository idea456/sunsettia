import { Attribute } from "./token";
import { type Expression } from "acorn";

export type Program = {
    code: string;
    component?: Node;
};

export type Component = {
    body: Node[];
};

export enum NodeType {
    Tag = "Tag",
    Text = "Text",
    Expression = "Expression",
}

export interface TagNode {
    name: string;
    type: NodeType.Tag;
    children: Node[];
    attributes: Attribute[];
}

export interface TextNode {
    name: "text";
    type: NodeType.Text;
    value: string;
}

export interface ExpressionNode {
    name: "expression";
    type: NodeType.Expression;
    value: string;
    expression: Expression;
    raw: string;
}

export type Node = TagNode | TextNode | ExpressionNode;
