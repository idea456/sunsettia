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

export interface Visitable {
    accept(visitor: NodeVisitor): void;
}

export interface VisitableNode extends Visitable {
    name: "$$text" | "$$expr" | string;
    type: NodeType;

    child?: VisitableNode;
    sibling?: VisitableNode;
    return?: VisitableNode;

    children?: VisitableNode[];

    accept(visitor: NodeVisitor): void;
}

export interface VisitableTagNode extends VisitableNode {
    name: string;
    type: NodeType.Tag;
    children: VisitableNode[];
    attributes: Attribute[];
}

export interface VisitableTextNode extends VisitableNode {
    name: "$$text";
    type: NodeType.Text;
    value: string;
}

export interface VisitableExpressionNode extends VisitableNode {
    name: "$$expr";
    type: NodeType.Expression;
    expression: Expression;
    raw: string;
}

export type Node =
    | VisitableTagNode
    | VisitableTextNode
    | VisitableExpressionNode;
