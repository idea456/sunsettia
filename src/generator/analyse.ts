import { Program } from "../parser/nodes";
import acorn from "acorn";
import walk from "acorn-walk";

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
export default function analyse(ast: Program) {
    let declarations: Declaration[] = [];
    let assignments: Assignment[] = [];

    const tree = acorn.parse(ast.code, {
        ecmaVersion: "latest",
        sourceType: "module",
    });

    walk.simple(tree, {
        VariableDeclaration: (node) => {
            declarations.push({
                expression: node.declarations[0],
                raw: `let ${ast.code
                    .slice(node.declarations[0].start, node.declarations[0].end)
                    .replace(";", "")}`,
            });
        },
        AssignmentExpression: (node) => {
            assignments.push({
                expression: node,
                raw: ast.code.slice(node.start, node.end),
            });
        },
    });

    return {
        declarations,
        assignments,
    };
}
