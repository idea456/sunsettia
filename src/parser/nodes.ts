import { type Expression as AcornExpression, parseExpressionAt } from "acorn";

export const NodeType = {
    Tag: "Tag",
    Text: "Text",
    Expression: "Expression",
} as const;

/**
 * Implement tree traversal for rendering using React's fiber tree traversal way of singly-linked pointers.
 * This allows a way to emulate the call stack and pause/resume execution of traversal without relying on recursion's call stack.
 * This relies on three pointers:
 * - child: points to the next immediate children
 * - sibling: points to the next immediate sibling node
 * - return: points to the parent
 */
export class ExpressionNode implements VisitableExpressionNode {
    name = "$$expr" as const;
    // for analysis
    expression: AcornExpression;
    // for generation
    raw: string;
    type = NodeType.Expression;

    child?: VisitableNode;
    sibling?: VisitableNode;
    return?: VisitableNode;

    children: VisitableNode[] = [];

    constructor(raw: string) {
        this.name = "$$expr";
        this.raw = raw;
        this.expression = parseExpressionAt(raw, 0, {
            ecmaVersion: "latest",
        });
    }

    accept(visitor: NodeVisitor) {
        visitor.visitExpression(this);
    }
}

export class TagNode implements VisitableTagNode {
    type = NodeType.Tag;
    attributes: Attribute[];
    name: string;
    props?: Attribute[];

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
    name = "$$text" as const;
    type = NodeType.Text;
    child?: VisitableNode;
    sibling?: VisitableNode;
    return?: VisitableNode;
    value: string;

    children: VisitableNode[] = [];

    constructor(value: string) {
        this.value = value;
        this.name = "$$text";
    }

    accept(visitor: NodeVisitor): void {
        visitor.visitText(this);
    }
}
