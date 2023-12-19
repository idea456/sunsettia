import {
    Node,
    NodeType,
    NodeVisitor,
    Program,
    VisitableExpressionNode,
    VisitableNode,
    VisitableTagNode,
    VisitableTextNode,
} from "types";
import analyse, { analyseDependencies } from "./analyse";
import { TagNode } from "../parser/nodes";
import { ParseError, ParseErrorType } from "../error/error";
import analyseScript from "./analyse";

class CreateGeneratingVisitor implements NodeVisitor {
    code: string[];
    visitExpression(node: ExpressionNode): void {
        throw new Error("Method not implemented.");
    }
    visitTag(node: TagNode): void {
        throw new Error("Method not implemented.");
    }
    visitText(node: TextNode): void {
        throw new Error("Method not implemented.");
    }
}

export class GeneratingVisitor implements NodeVisitor {
    code: string[];
    private counter: number = 0;
    private parent_var: string = "";
    generated_vars: string[] = [];
    generated_events: string[] = [];
    generated_create_lifecycle: string[] = [];
    generated_declarations: Set<string> = new Set();

    constructor() {
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
    }

    private generateVariableDeclaration(var_name: string) {
        if (this.generated_declarations.has(`${var_name}_${this.counter}`))
            this.counter += 1;
        const generated_var_name = `${var_name}_${this.counter}`;
        this.generated_vars.push(`let ${generated_var_name};`);
        this.generated_declarations.add(generated_var_name);
        return generated_var_name;
    }

    private generateElement(
        node_name: string,
        element_type: string,
        parent_name?: string,
    ) {
        const generated_var_name = this.generateVariableDeclaration(node_name);
        this.generated_create_lifecycle.push(
            `${generated_var_name} = document.createElement('${element_type}');`,
        );
        if (!parent_name) {
            this.generated_create_lifecycle.push(
                `document.body.appendChild(${generated_var_name})`,
            );
        } else {
            this.generated_create_lifecycle.push(
                `${parent_name}.appendChild(${generated_var_name})`,
            );
        }
        return generated_var_name;
    }

    visitExpression(node: VisitableExpressionNode): void {
        // this.code.push(
        //     `const expr_${this.counter} = document.createTextNode(${node.raw})`,
        // );
        // this.code.push(
        //     `${this.parent_var}.appendChild(${`expr_${this.counter}`})`,
        // );
        const generated_var_name = this.generateVariableDeclaration("expr");
        this.generated_create_lifecycle.push(
            `${generated_var_name} = document.createTextNode(${node.raw})`,
        );

        this.generated_create_lifecycle.push(
            `${this.parent_var}.appendChild(${generated_var_name})`,
        );

        const dependencies = analyseDependencies(node.expression);
        dependencies.forEach((variable) => {
            this.code.push(
                `_listen('${variable}', () => expr_${this.counter}.data = ${node.raw})`,
            );
        });
    }

    visitTag(node: VisitableTagNode): void {
        let node_name: string;
        if (node.name === "component") {
            node_name = node.attributes.find(
                (attr) => attr.name === "name",
            )?.value;
            this.parent_var = this.generateElement(node_name, "div");
            node_name = this.parent_var;
        } else {
            node_name = this.generateElement(
                node.name,
                node.name,
                this.parent_var,
            );

            // TODO: Separate this into AttributeVisitor
            for (let i = 0; i < node.attributes.length; i++) {
                const attr_name = node.attributes[i]?.name;
                const attr_value = node.attributes[i]?.value;
                if (attr_name && attr_value) {
                    if (attr_name === "style") {
                        const styleTokens = attr_value.split(";");
                        styleTokens.forEach((style) => {
                            if (style) {
                                const styleName = style.trim().split(":")[0];
                                let styleValue = style.trim().split(":")[1];
                                this.code.push(
                                    `${node_name}.style['${styleName}'] = '${styleValue}'`,
                                );
                            }
                        });
                        // TODO: fix this refactor
                    } else if (attr_name.includes("@")) {
                        const event_name = attr_name.slice(1, attr_name.length);
                        // if (event_name === 'if') {
                        //     this.code.push()
                        // }
                        this.generated_events.push(
                            `${node_name}.addEventListener('${event_name}', ${attr_value});`,
                        );
                    }
                }
            }
            // this.code.push(`${this.parent_var}.appendChild(${node_name})`);
            // this.counter += 1;
        }

        if (node.children.length !== 0) {
            const old_parent_var = this.parent_var;
            this.parent_var = node_name;
            for (let i = 0; i < node.children.length; i++) {
                node.children[i].accept(this);
            }
            this.parent_var = old_parent_var;
        }
    }

    visitText(node: VisitableTextNode): void {
        const generated_var_name = this.generateVariableDeclaration("text");
        this.generated_create_lifecycle.push(
            `${generated_var_name} = document.createTextNode('${node.value}')`,
        );

        this.generated_create_lifecycle.push(
            `${this.parent_var}.appendChild(${generated_var_name})`,
        );
    }

    generateStyles(node: TagNode) {}

    generate(ast: Program) {
        const analysedCode = analyseScript(ast.code).generatedCode;

        if (ast.component) ast.component.accept(this);
        this.code = [
            analysedCode,
            ...this.generated_vars,
            ...this.generated_create_lifecycle,
            ...this.generated_events,
            ...this.code,
        ];
        return this.code.join("\n");
    }
}
