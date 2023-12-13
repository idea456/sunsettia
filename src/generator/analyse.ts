import { NodeType, Program, VisitableNode, VisitableTagNode } from "types";
import acorn, { Expression } from "acorn";
import walk from "acorn-walk";
import escodegen from "escodegen";

type Declaration = {
    expression: acorn.VariableDeclarator;
    raw?: string;
};

type Assignment = {
    expression: acorn.AssignmentExpression;
    raw?: string;
};

/**
 * Analyses the script and determines what is initialized and mutated
 * Determines dependencies for each mutation
 * Applies transformation to wrap
 * @param ast
 * @returns
 */
export default function analyse(code: string) {
    let declarations: Declaration[] = [];
    let assignments: Assignment[] = [];
    // const code = appendSemicolons(rawCode);
    const tree = acorn.parse(code, {
        ecmaVersion: "latest",
        sourceType: "module",
    });

    walk.ancestor(tree, {
        ExpressionStatement(path, _state, ancestors) {
            const node = path;
            if (node?.expression.type === "AssignmentExpression") {
                let dependency = node.expression.left.name;
                let invalidateExpr = {
                    type: "ExpressionStatement",
                    start: node.start,
                    expression: {
                        type: "CallExpression",
                        callee: {
                            type: "Identifier",
                            name: "_invalidate",
                        },
                        arguments: [
                            {
                                type: "Literal",
                                value: dependency,
                            },
                            node.expression,
                        ],
                    },
                };
                let index = 0;
                let parent = ancestors[ancestors.length - 2];
                for (let i = 0; i < parent.body.length; i++) {
                    const bodyNode = parent.body[i];
                    if (
                        bodyNode.type === "ExpressionStatement" &&
                        bodyNode.start === node.start &&
                        bodyNode.end === node.end
                    ) {
                        index = i;
                        break;
                    }
                }
                parent.body[index] = invalidateExpr;
            }
        },
    });

    const generatedCode = escodegen.generate(tree);

    return {
        declarations,
        assignments,
        generatedCode,
    };
}

export function analyseDependencies(expression: Expression) {
    let dependencies: string[] = [];
    walk.simple(expression, {
        Identifier: (node) => {
            dependencies.push(node.name);
        },
    });

    return dependencies;
}

/**
 * Implement tree traversal for rendering using React's fiber tree traversal way of singly-linked pointers.
 * This allows a way to emulate the call stack and pause/resume execution of traversal without relying on recursion's call stack.
 * This relies on three pointers:
 * - child: points to the next immediate children
 * - sibling: points to the next immediate sibling node
 * - return: points to the parent
 */
export function link(ast: VisitableTagNode) {
    let current_parent: VisitableNode = ast;

    const traverse = (current_node: VisitableNode) => {
        if (current_node !== current_parent)
            current_node.return = current_parent;

        if (current_node.children?.length) {
            current_node.child = current_node.children[0];
            current_node.children?.reduceRight(
                (
                    rightNode: VisitableNode | undefined,
                    leftNode: VisitableNode,
                ) => {
                    leftNode.sibling = rightNode;
                    return leftNode;
                },
                undefined,
            );
            current_parent = current_node;
            for (let i = 0; i < current_node.children.length; i++) {
                traverse(current_node.children[i]);
            }
        }

        return current_node;
    };

    return traverse(ast);
}

// export function appendSemicolons(code: string) {
//     const tokens = code.split("\n");
//     return tokens
//         .map((token) =>
//             token.charAt(token.length - 1) !== ";" ? token + ";" : token,
//         )
//         .join("");
// }
