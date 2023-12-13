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

export class GeneratingVisitor implements NodeVisitor {
    code: string[];
    private counter: number;
    private parent_var: string;

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
        this.counter = 0;
        this.parent_var = "";
    }

    visitExpression(node: VisitableExpressionNode): void {
        this.code.push(
            `const expr_${this.counter} = document.createTextNode(${node.raw})`,
        );
        this.code.push(
            `${this.parent_var}.appendChild(${`expr_${this.counter}`})`,
        );
        const dependencies = analyseDependencies(node.expression);
        dependencies.forEach((variable) => {
            this.code.push(
                `_listen('${variable}', () => expr_${this.counter}.data = ${node.raw})`,
            );
        });
    }

    visitTag(node: VisitableTagNode): void {
        let node_name;
        if (node.name === "component") {
            node_name = "component";
            this.parent_var = "component";
            this.code.push(`const component = document.createElement('div')`);
            this.code.push(`document.body.appendChild(component)`);
        } else {
            node_name = `${node.name}_${this.counter}`;
            this.code.push(
                `const ${node_name} = document.createElement('${node.name}')`,
            );
            // TODO: Separate this into AttributeVisitor
            for (let i = 0; i < node.attributes.length; i++) {
                const attr_name = node.attributes[i]?.name;
                const attr_value = node.attributes[i]?.value;
                if (attr_name && attr_value) {
                    if (attr_name.includes("@")) {
                        const event_name = attr_name.slice(1, attr_name.length);
                        this.code.push(
                            `${node_name}.addEventListener('${event_name}', ${attr_value});`,
                        );
                    }
                }
            }
            this.code.push(`${this.parent_var}.appendChild(${node_name})`);
            this.counter += 1;
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
        console.log("WE ARE IN TEXT", this.parent_var, node.value);
        this.code.push(
            `const text_${this.counter} = document.createTextNode('${node.value}')`,
        );
        this.code.push(
            `${this.parent_var}.appendChild(${`text_${this.counter}`})`,
        );
    }

    generate(ast: Program) {
        const analysedCode = analyse(ast.code).generatedCode;

        console.log("analysed code", ast.code, analysedCode);
        this.code.push(analysedCode);
        if (ast.component) ast.component.accept(this);
        return this.code.join("\n");
    }
}
