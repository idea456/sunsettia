import {
    parse,
    type AssignmentExpression,
    VariableDeclarator,
    Program as AcornProgram,
    Expression as AcornExpression,
    ImportDeclaration,
} from "acorn";
import { ancestor, simple } from "acorn-walk";
import escodegen from "escodegen";

type Declaration = {
    expression: VariableDeclarator;
    raw?: string;
};

type Assignment = {
    expression: AssignmentExpression;
    raw?: string;
};

/**
 * Analyses the script and determines what is initialized and mutated
 * Determines dependencies for each mutation
 * Applies transformation to wrap
 * @param ast
 * @returns
 */
export default function analyseScript(code: string) {
    let declarations: Declaration[] = [];
    let assignments: Assignment[] = [];
    // const code = appendSemicolons(rawCode);
    const tree = parse(code, {
        ecmaVersion: "latest",
        sourceType: "module",
    });

    ancestor(tree, {
        ImportDeclaration(path, _state, ancestors) {
            const node = path;
            let index = 0;
            let parent = ancestors[ancestors.length - 2] as AcornProgram;
            for (let i = 0; i < parent.body.length; i++) {
                const bodyNode = parent.body[i];
                if (
                    bodyNode.type === "ImportDeclaration" &&
                    bodyNode.start === node.start &&
                    bodyNode.end === node.end
                ) {
                    index = i;
                    break;
                }
            }
            parent.body = [
                ...parent.body.slice(0, index),
                ...parent.body.slice(index + 1, parent.body.length),
            ];
        },
        ExpressionStatement(path, _state, ancestors) {
            const node = path;
            if (node?.expression.type === "AssignmentExpression") {
                //@ts-expect-error
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
                let parent = ancestors[ancestors.length - 2] as AcornProgram;
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
                // @ts-expect-error
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

export function analyseDependencies(expression: AcornExpression) {
    let dependencies: string[] = [];
    simple(expression, {
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

export function analyseImports(code: string) {
    const tree = parse(code, {
        ecmaVersion: "latest",
        sourceType: "module",
    });
    const imports: ImportDeclaration[] = [];

    simple(tree, {
        ImportDeclaration: (node) => {
            imports.push(node);
        },
    });

    return imports;
}

// export function appendSemicolons(code: string) {
//     const tokens = code.split("\n");
//     return tokens
//         .map((token) =>
//             token.charAt(token.length - 1) !== ";" ? token + ";" : token,
//         )
//         .join("");
// }
