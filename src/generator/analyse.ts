import { Program } from "../parser/nodes";
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
    // let declarations: Map<string, Declaration> = new Map();
    // let assignments: Map<string, Assignment> = new Map();

    // let mutationMap: Map<string, Assignment[]> = new Map()

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

// export function appendSemicolons(code: string) {
//     const tokens = code.split("\n");
//     return tokens
//         .map((token) =>
//             token.charAt(token.length - 1) !== ";" ? token + ";" : token,
//         )
//         .join("");
// }
