export interface NodeVisitor {
    code: string[];

    visitExpression(node: ExpressionNode): void;
    visitTag(node: TagNode): void;
    visitText(node: TextNode): void;
}
