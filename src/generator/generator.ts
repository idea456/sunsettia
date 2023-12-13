import { Node, NodeType, Program, TextNode } from "types";
import analyse, { analyseDependencies } from "./analyse";
import acorn from "acorn";

interface NodeVisitor {
    code: string[];

    visitEvents(eventName: string, expression: null): void;
    visitExpression(expression: acorn.Expression): void;
    visitTag(): void;
    visitText(): void;
    visitStyles(): void;
}

interface VisitableNode {
    accept(visitor: NodeVisitor): void;
}

class ExpressionNode implements VisitableNode {
    expression: acorn.Expression;

    constructor(public raw: string) {
        this.expression = acorn.parseExpressionAt(raw, 0, {
            ecmaVersion: "latest",
        });
    }

    accept(visitor: NodeVisitor) {
        visitor.visitExpression(this.expression);
    }
}

class StyleNode implements VisitableNode {
    constructor(public raw: string) {}

    accept(visitor: NodeVisitor): void {
        visitor.visitStyles();
    }
}

class EventNode implements VisitableNode {
    constructor(public name: string) {}

    accept(visitor: NodeVisitor) {
        visitor.visitEvents(this.name, null);
    }
}

class TagNode implements VisitableNode {
    constructor(public name: string) {}

    accept(visitor: NodeVisitor): void {
        visitor.visitTag();
    }
}

class TextNode implements VisitableNode {
    constructor(public raw: string) {}

    accept(visitor: NodeVisitor): void {
        visitor.visitText();
    }
}

class NodeVisitor implements NodeVisitor {}

class Generator {
    constructor() {
        this.visitor = new NodeVisitor();
    }
    traverse();
}

export class Generator {
    code: string[];
    ast: Program;
    current_parent: string;
    counter: number;
    subscriptions: Map<string, string[]>;
    variables: string[];

    constructor(ast: Program) {
        this.ast = ast;
        this.current_parent = "";
        this.counter = 0;
        this.subscriptions = new Map();
        this.variables = [];
        this.code = [
            "let variableToNodesMapper = new Map();",
            " function _invalidate(variable, expr) {",
            "    const nodes = variableToNodesMapper.get(variable);",
            "    if (nodes) {",
            "      for (let i = 0; i < nodes.length; i++) {",
            "        nodes[i]();",
            "      }",
            "    }",
            "  }",
            "  function _listen(variable, fn) {",
            "    if (!variableToNodesMapper.has(variable))",
            "      variableToNodesMapper.set(variable, []);",
            "    variableToNodesMapper.set(variable, [",
            "      ...variableToNodesMapper.get(variable),",
            "      fn,",
            "    ]);",
            "  }",
        ];

        const analysedCode = analyse(ast.code).generatedCode;

        this.code.push(analysedCode);
    }

    analyse() {
        return analyse(this.ast.code);
    }

    generate(current_node: Node) {
        let node_name;
        if (current_node.type === NodeType.Tag) {
            if (current_node.name === "component") {
                node_name = "component";
                this.code.push(
                    `const component = document.createElement('div')`,
                );
                this.code.push(`document.body.appendChild(component)`);
                this.current_parent = "component";
            } else {
                node_name = `${current_node.name}_${this.counter}`;
                this.code.push(
                    `const ${node_name} = document.createElement('${current_node.name}')`,
                );
                for (let i = 0; i < current_node.attributes.length; i++) {
                    const attr_name = current_node.attributes[i]?.name;
                    const attr_value = current_node.attributes[i]?.value;
                    if (attr_name && attr_value) {
                        if (attr_name.includes("@")) {
                            const event_name = attr_name.slice(
                                1,
                                attr_name.length,
                            );
                            this.code.push(
                                `${node_name}.addEventListener('${event_name}', ${attr_value});`,
                            );
                        }
                    }
                }
                this.code.push(
                    `${this.current_parent}.appendChild(${node_name})`,
                );
                this.counter += 1;
            }

            if (current_node.children.length !== 0) {
                let previous_parent = this.current_parent;
                this.current_parent = node_name;
                for (let i = 0; i < current_node.children.length; i++) {
                    this.generate(current_node.children[i]);
                }
                this.current_parent = previous_parent;
            }
        } else if (current_node.type === NodeType.Expression) {
            this.code.push(
                `const expr_${this.counter} = document.createTextNode(${current_node.raw})`,
            );
            this.code.push(
                `${this.current_parent}.appendChild(${`expr_${this.counter}`})`,
            );
            const dependencies = analyseDependencies(current_node.expression);
            dependencies.forEach((variable) => {
                this.code.push(
                    `_listen('${variable}', () => expr_${this.counter} .data = ${current_node.raw})`,
                );
            });
        } else if (current_node.type === NodeType.Text) {
            this.code.push(
                `const text_${this.counter} = document.createTextNode('${
                    (current_node as TextNode).value
                }')`,
            );
            this.code.push(
                `${this.current_parent}.appendChild(${`text_${this.counter}`})`,
            );
        }

        return this.code;
    }
}
