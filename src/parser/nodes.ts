import acorn from "acorn";
import {
    Attribute,
    NodeType,
    NodeVisitor,
    VisitableNode,
    VisitableTagNode,
    VisitableTextNode,
    VisitableExpressionNode,
} from "types";

export class ExpressionNode implements VisitableExpressionNode {
    // for analysis
    expression: acorn.Expression;
    // for generation
    raw: string;
    type: NodeType.Expression = NodeType.Expression;

    child?: VisitableNode;
    sibling?: VisitableNode;
    return?: VisitableNode;

    constructor(raw: string) {
        this.raw = raw;
        this.expression = acorn.parseExpressionAt(raw, 0, {
            ecmaVersion: "latest",
        });
    }

    accept(visitor: NodeVisitor) {
        visitor.visitExpression(this);
    }
}

export class TagNode implements VisitableTagNode {
    type: NodeType.Tag = NodeType.Tag;
    attributes: Attribute[];
    name: string;
    child?: VisitableNode;
    sibling?: VisitableNode;
    return?: VisitableNode;

    children: VisitableNode[];

    constructor(name: string, attributes: Attribute[]) {
        this.name = name;
        this.children = [];
        this.attributes = attributes;
    }

    accept(visitor: NodeVisitor): void {
        visitor.visitTag(this);
    }
}

export class TextNode implements VisitableTextNode {
    type: NodeType.Text = NodeType.Text;
    child?: VisitableNode;
    sibling?: VisitableNode;
    return?: VisitableNode;
    value: string;

    constructor(value: string) {
        this.value = value;
    }

    accept(visitor: NodeVisitor): void {
        visitor.visitText(this);
    }
}
