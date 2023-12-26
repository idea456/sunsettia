import { type Expression as AcornExpression } from "acorn";

declare global {
    export type Program = {
        code: string;
        component?: VisitableNode;
    };

    export type Component = {
        body: Node[];
    };

    export interface Visitable {
        accept(visitor: NodeVisitor): void;
    }

    export interface VisitableNode extends Visitable {
        name: "$$text" | "$$expr" | string;
        type: NodeType.Expression | NodeType.Tag | NodeType.Text;

        child?: VisitableNode;
        sibling?: VisitableNode;
        return?: VisitableNode;

        children: VisitableNode[];

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
        expression: AcornExpression;
        raw: string;
    }

    export type Node =
        | VisitableTagNode
        | VisitableTextNode
        | VisitableExpressionNode;

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

    export interface NodeVisitor {
        code: string[];

        visitExpression(node: ExpressionNode): void;
        visitTag(node: TagNode): void;
        visitText(node: TextNode): void;
    }
}
