import { Component, Node, NodeType, Program, TextNode } from "../parser/nodes";
import acorn from "acorn";
import walk from "acorn-walk";
import analyse from "./analyse";

type Pulp = {
    node: Node;
    parent?: Pulp;
    sibling?: Pulp;
    children?: Pulp[];
    alternate?: Pulp;
};

type PulpTree = {
    body: Pulp;
};

export class Generator {
    code: string[];
    ast: Program;
    current_parent: string;
    counter: number;
    subscriptions: Map<string, string[]>;
    variables: string[];
    tree?: PulpTree;

    constructor(ast: Program) {
        this.ast = ast;
        this.code = [];
        this.current_parent = "";
        this.counter = 0;
        this.subscriptions = new Map();
        this.variables = [];
    }

    analyse() {
        analyse(this.ast);
    }

    construct(current_pulp: Pulp) {
        let pulp: Pulp;
        if (current_pulp.node.type === NodeType.Tag) {
            if (current_pulp.node.name !== "component") {
                pulp = {
                    node: current_pulp.node,
                    children: [],
                };
                for (let i = 0; i < pulp.node.children.length; i++) {
                    const child_pulp = this.construct(pulp.node.children[i]);
                    child_pulp.parent = current_pulp;
                    pulp.children.push(child_pulp);
                }
            }
        }

        return pulp;
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
                        console.log(
                            attr_name,
                            attr_value,
                            attr_name.includes("@"),
                        );
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
                console.log("stuff", this.code);
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
            this.analyse();
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
